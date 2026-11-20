-- Music generation job tracking. Audio provider credentials remain in Edge Function secrets.
create table if not exists public.music_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null check (char_length(trim(prompt)) between 10 and 2000),
  style text,
  duration_seconds integer not null default 30 check (duration_seconds between 5 and 300),
  status text not null default 'queued' check (status in ('queued','processing','completed','failed')),
  provider_job_id text,
  output_object_path text,
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists music_generation_jobs_user_created_idx
  on public.music_generation_jobs(user_id, created_at desc);
alter table public.music_generation_jobs enable row level security;
drop policy if exists "music_generation_owner_read" on public.music_generation_jobs;
create policy "music_generation_owner_read" on public.music_generation_jobs
for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.music_generation_jobs from anon, authenticated;
grant select on public.music_generation_jobs to authenticated;
