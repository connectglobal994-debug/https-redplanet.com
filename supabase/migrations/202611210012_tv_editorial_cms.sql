-- Editorial CMS for Red Planet TV. Published stories alone are public.
create table if not exists public.tv_articles (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references auth.users(id),
 reviewer_id uuid references auth.users(id),
 title text not null check(char_length(trim(title)) between 5 and 180),
 slug text not null unique,
 category text not null check(category in ('music','red_planet','collaborations','football','world','technology','culture')),
 summary text not null check(char_length(trim(summary)) between 20 and 500),
 body text not null check(char_length(trim(body)) between 50 and 30000),
 source_name text,
 source_url text,
 status text not null default 'draft' check(status in ('draft','in_review','needs_changes','approved','published','rejected')),
 editorial_notes text,
 published_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists tv_articles_public_idx on public.tv_articles(category,published_at desc) where status='published';
alter table public.tv_articles enable row level security;
drop policy if exists tv_articles_public_read on public.tv_articles;
create policy tv_articles_public_read on public.tv_articles for select to anon,authenticated using(status='published');
drop policy if exists tv_articles_staff_read on public.tv_articles;
create policy tv_articles_staff_read on public.tv_articles for select to authenticated using(public.has_redplanet_role(array['administrator','editor','moderator']));
drop policy if exists tv_articles_editor_create on public.tv_articles;
create policy tv_articles_editor_create on public.tv_articles for insert to authenticated
with check(author_id=(select auth.uid()) and public.has_redplanet_role(array['administrator','editor']));
drop policy if exists tv_articles_author_draft_update on public.tv_articles;
create policy tv_articles_author_draft_update on public.tv_articles for update to authenticated
using(author_id=(select auth.uid()) and status in ('draft','needs_changes'))
with check(author_id=(select auth.uid()) and status in ('draft','needs_changes','in_review'));
drop policy if exists tv_articles_staff_review on public.tv_articles;
create policy tv_articles_staff_review on public.tv_articles for update to authenticated
using(public.has_redplanet_role(array['administrator','editor','moderator']))
with check(public.has_redplanet_role(array['administrator','editor','moderator']));
revoke all on public.tv_articles from anon,authenticated;
grant select on public.tv_articles to anon,authenticated;
grant insert on public.tv_articles to authenticated;
grant update on public.tv_articles to authenticated;
