-- Red Planet candidate profiles, CVs and job applications.
-- Apply after 202611190001_core_schema.sql and 202611220001_jobs_platform.sql.
-- User-owned writes are protected by Supabase Auth identity and RLS.

create table if not exists public.rp_candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 160),
  headline text,
  location_text text,
  country_code char(2),
  phone text,
  bio text,
  linkedin_url text,
  portfolio_url text,
  website_url text,
  skills text[] not null default '{}',
  visibility text not null default 'private' check (visibility in ('private','public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rp_resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_profile_id uuid not null references public.rp_candidate_profiles(id) on delete cascade,
  title text not null default 'My CV' check (char_length(title) between 2 and 120),
  content jsonb not null default '{}'::jsonb,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rp_resumes_content_object check (jsonb_typeof(content) = 'object')
);

create unique index if not exists rp_resumes_one_primary_idx
  on public.rp_resumes(candidate_profile_id) where is_primary = true;
create index if not exists rp_candidate_profiles_visibility_idx
  on public.rp_candidate_profiles(visibility, updated_at desc);

create table if not exists public.rp_job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.rp_jobs(id) on delete restrict,
  applicant_user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid references public.rp_resumes(id) on delete set null,
  resume_snapshot jsonb not null default '{}'::jsonb,
  cover_letter text,
  status text not null default 'submitted'
    check (status in ('submitted','viewed','shortlisted','interview','offered','rejected','withdrawn')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_id, applicant_user_id)
);

create index if not exists rp_job_applications_applicant_idx
  on public.rp_job_applications(applicant_user_id, submitted_at desc);
create index if not exists rp_job_applications_job_idx
  on public.rp_job_applications(job_id, status, submitted_at desc);

alter table public.rp_candidate_profiles enable row level security;
alter table public.rp_resumes enable row level security;
alter table public.rp_job_applications enable row level security;

drop policy if exists rp_candidate_profile_owner_select on public.rp_candidate_profiles;
create policy rp_candidate_profile_owner_select on public.rp_candidate_profiles
  for select to authenticated
  using (user_id = (select auth.uid()) or visibility = 'public'
    or public.has_redplanet_role(array['administrator','moderator','editor']));

drop policy if exists rp_candidate_profile_owner_insert on public.rp_candidate_profiles;
create policy rp_candidate_profile_owner_insert on public.rp_candidate_profiles
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists rp_candidate_profile_owner_update on public.rp_candidate_profiles;
create policy rp_candidate_profile_owner_update on public.rp_candidate_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists rp_resume_owner_select on public.rp_resumes;
create policy rp_resume_owner_select on public.rp_resumes
  for select to authenticated
  using (exists (
    select 1 from public.rp_candidate_profiles p
    where p.id = candidate_profile_id and p.user_id = (select auth.uid())
  ) or public.has_redplanet_role(array['administrator','moderator','editor']));

drop policy if exists rp_resume_owner_insert on public.rp_resumes;
create policy rp_resume_owner_insert on public.rp_resumes
  for insert to authenticated
  with check (exists (
    select 1 from public.rp_candidate_profiles p
    where p.id = candidate_profile_id and p.user_id = (select auth.uid())
  ));

drop policy if exists rp_resume_owner_update on public.rp_resumes;
create policy rp_resume_owner_update on public.rp_resumes
  for update to authenticated
  using (exists (
    select 1 from public.rp_candidate_profiles p
    where p.id = candidate_profile_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.rp_candidate_profiles p
    where p.id = candidate_profile_id and p.user_id = (select auth.uid())
  ));

drop policy if exists rp_application_owner_select on public.rp_job_applications;
create policy rp_application_owner_select on public.rp_job_applications
  for select to authenticated
  using (applicant_user_id = (select auth.uid())
    or public.has_redplanet_role(array['administrator','moderator','editor']));

drop policy if exists rp_application_owner_insert on public.rp_job_applications;
create policy rp_application_owner_insert on public.rp_job_applications
  for insert to authenticated
  with check (
    applicant_user_id = (select auth.uid())
    and status = 'submitted'
    and exists (
      select 1 from public.rp_jobs j
      where j.id = job_id and j.status = 'published'
        and (j.expires_at is null or j.expires_at > now())
    )
  );

revoke all on public.rp_candidate_profiles, public.rp_resumes, public.rp_job_applications from anon, authenticated;
grant select, insert, update on public.rp_candidate_profiles to authenticated;
grant select, insert, update on public.rp_resumes to authenticated;
grant select, insert on public.rp_job_applications to authenticated;
grant all on public.rp_candidate_profiles, public.rp_resumes, public.rp_job_applications to service_role;
