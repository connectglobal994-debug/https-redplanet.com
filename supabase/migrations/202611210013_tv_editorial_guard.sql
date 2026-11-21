-- Protect editorial review metadata and reserve publication to administrators/editors.
create or replace function public.guard_tv_article_review()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
 is_admin_or_editor boolean;
 is_moderator boolean;
begin
 is_admin_or_editor := public.has_redplanet_role(array['administrator','editor']);
 is_moderator := public.has_redplanet_role(array['administrator','editor','moderator']);
 if not is_moderator then
  if new.reviewer_id is distinct from old.reviewer_id
     or new.editorial_notes is distinct from old.editorial_notes
     or new.published_at is distinct from old.published_at then
   raise exception 'Authors cannot change editorial review metadata';
  end if;
  if old.status not in ('draft','needs_changes') or new.status not in (old.status,'in_review') then
   raise exception 'This story cannot be changed in its current editorial state';
  end if;
 end if;
 if new.status='published' and not is_admin_or_editor then
  raise exception 'Only administrators and editors can publish stories';
 end if;
 return new;
end;
$$;
drop trigger if exists guard_tv_article_review on public.tv_articles;
create trigger guard_tv_article_review before update on public.tv_articles
for each row execute function public.guard_tv_article_review();
revoke all on function public.guard_tv_article_review() from public,anon;
grant execute on function public.guard_tv_article_review() to authenticated;
