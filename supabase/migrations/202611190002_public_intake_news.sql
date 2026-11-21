-- Public membership waitlist intake and editor-controlled news publishing.
-- Apply after 202611190001_core_schema.sql.

create table if not exists public.membership_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null unique check (char_length(email) <= 254),
  privacy_consent_at timestamptz not null,
  source text not null default 'website',
  created_at timestamptz not null default now()
);

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 5 and 220),
  summary text not null check (char_length(summary) between 20 and 1200),
  url text not null,
  source text not null,
  category text not null default 'GLOBAL' check (category in ('MARS','GLOBAL','SYNDICATE','MARKETS','TECH')),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_articles_published_idx
  on public.news_articles(published, published_at desc);

alter table public.membership_leads enable row level security;
alter table public.news_articles enable row level security;

-- No anon/authenticated insert policy: public intake writes use the server-only service role.
create policy "published_news_public_read" on public.news_articles
  for select to anon, authenticated using (published = true);
create policy "news_staff_manage" on public.news_articles
  for all to authenticated
  using (public.has_redplanet_role(array['administrator','editor']))
  with check (public.has_redplanet_role(array['administrator','editor']));

revoke all on public.membership_leads from anon, authenticated;
grant select on public.news_articles to anon, authenticated;
