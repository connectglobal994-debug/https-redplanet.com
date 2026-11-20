-- Prevent artist-owned submission rows from spoofing staff review metadata.
create or replace function public.guard_artist_submission_updates()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
 is_staff boolean;
begin
 is_staff := public.has_redplanet_role(array['administrator','moderator','editor']);
 if is_staff then return new; end if;
 if not exists (
  select 1 from public.artist_profiles ap
  where ap.id=old.artist_profile_id and ap.owner_user_id=(select auth.uid())
 ) then
  raise exception 'Not authorized to update this submission';
 end if;
 if new.artist_profile_id is distinct from old.artist_profile_id
    or new.review_notes is distinct from old.review_notes
    or new.reviewed_at is distinct from old.reviewed_at
    or new.reviewed_by is distinct from old.reviewed_by then
  raise exception 'Artist accounts cannot change staff review fields';
 end if;
 if old.status not in ('draft','needs_changes') or new.status not in (old.status,'submitted') then
  raise exception 'This submission cannot be changed in its current review state';
 end if;
 return new;
end;
$$;
drop trigger if exists guard_artist_submission_updates on public.music_submissions;
create trigger guard_artist_submission_updates
before update on public.music_submissions
for each row execute function public.guard_artist_submission_updates();
revoke all on function public.guard_artist_submission_updates() from public,anon;
grant execute on function public.guard_artist_submission_updates() to authenticated;
