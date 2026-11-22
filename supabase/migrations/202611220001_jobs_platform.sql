-- Red Planet Jobs: curated listings and automated-discovery foundation.
-- Apply to a dedicated Supabase development project first; review RLS before production.

create table if not exists public.rp_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  company_name text not null check (char_length(company_name) between 2 and 160),
  description text not null check (char_length(description) between 30 and 20000),
  category text not null default 'Other',
  employment_type text not null default 'full_time'
    check (employment_type in ('full_time','part_time','contract','temporary','internship','freelance','volunteer')),
  work_mode text not null default 'onsite'
    check (work_mode in ('remote','hybrid','onsite')),
  location_text text not null default 'Not specified',
  country_code text,
  salary_min numeric(14,2),
  salary_max numeric(14,2),
  salary_currency char(3),
  application_url text not null,
  source_name text not null default 'Red Planet',
  source_url text,
  external_id text,
  status text not null default 'draft'
    check (status in ('draft','published','paused','expired','rejected')),
  published_at timestamptz,
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rp_jobs_salary_range check (
    salary_min is null or salary_max is null or salary_max >= salary_min
  )
);

create unique index if not exists rp_jobs_source_external_uidx
  on public.rp_jobs(source_name, external_id)
  where external_id is not null;
create index if not exists rp_jobs_public_listing_idx
  on public.rp_jobs(status, published_at desc, expires_at);
create index if not exists rp_jobs_location_idx
  on public.rp_jobs(country_code, work_mode, employment_type);

create table if not exists public.rp_job_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  status text not null default 'started'
    check (status in ('started','completed','partial','failed')),
  fetched_count integer not null default 0,
  inserted_count integer not null default 0,
  updated_count integer not null default 0,
  error_summary text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table public.rp_jobs enable row level security;
alter table public.rp_job_ingestion_runs enable row level security;

drop policy if exists rp_jobs_public_read on public.rp_jobs;
create policy rp_jobs_public_read on public.rp_jobs
  for select to anon, authenticated
  using (status = 'published' and (expires_at is null or expires_at > now()));

drop policy if exists rp_jobs_admin_read on public.rp_jobs;
create policy rp_jobs_admin_read on public.rp_jobs
  for select to authenticated
  using (public.has_redplanet_role(array['administrator']));

drop policy if exists rp_job_ingestion_admin_read on public.rp_job_ingestion_runs;
create policy rp_job_ingestion_admin_read on public.rp_job_ingestion_runs
  for select to authenticated
  using (public.has_redplanet_role(array['administrator']));

revoke all on public.rp_jobs, public.rp_job_ingestion_runs from anon, authenticated;
grant select on public.rp_jobs to anon, authenticated;
grant select on public.rp_job_ingestion_runs to authenticated;
grant all on public.rp_jobs, public.rp_job_ingestion_runs to service_role;
