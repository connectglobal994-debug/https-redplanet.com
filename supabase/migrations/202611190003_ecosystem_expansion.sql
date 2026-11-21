-- Red Planet ecosystem expansion: studios, media/TV, AI work marketplace,
-- social publishing connections and payment intent records.
-- Apply after 202611190001_core_schema.sql and 202611190002_public_intake_news.sql.
-- This migration creates data structures only. It does NOT connect payment gateways,
-- publish social posts, ingest video, or execute trades.

alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles add constraint user_roles_role_check check (
  role in (
    'member','artist','producer','label','collaborator','editor','moderator',
    'finance_operator','administrator','platform_owner','department_manager',
    'studio_owner','studio_manager','tv_producer','jobs_reviewer','support_agent'
  )
);

create table if not exists public.studios (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  name text not null check (char_length(name) between 2 and 140),
  slug text not null unique,
  description text,
  logo_path text,
  website_url text,
  status text not null default 'pending' check (status in ('pending','active','suspended','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_members (
  studio_id uuid not null references public.studios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  studio_role text not null check (studio_role in ('owner','manager','producer','engineer','artist','viewer')),
  invited_by uuid references auth.users(id),
  joined_at timestamptz not null default now(),
  primary key (studio_id, user_id)
);

create table if not exists public.studio_artist_roster (
  studio_id uuid not null references public.studios(id) on delete cascade,
  artist_profile_id uuid not null references public.artist_profiles(id) on delete cascade,
  added_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (studio_id, artist_profile_id)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id),
  department text not null check (department in ('music','tv','news','jobs','admin')),
  media_type text not null check (media_type in ('audio','video','image','document')),
  object_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size > 0),
  visibility text not null default 'private' check (visibility in ('private','unlisted','public')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected','removed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tv_channels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  category text not null default 'general',
  channel_type text not null default 'on_demand' check (channel_type in ('on_demand','scheduled','live')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tv_programs (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.tv_channels(id) on delete cascade,
  title text not null,
  description text,
  media_asset_id uuid references public.media_assets(id),
  poster_asset_id uuid references public.media_assets(id),
  program_type text not null default 'episode' check (program_type in ('episode','film','music_video','sports','talent','documentary','live_event','other')),
  status text not null default 'draft' check (status in ('draft','review','scheduled','published','archived')),
  scheduled_at timestamptz,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  poster_user_id uuid references auth.users(id),
  organization_name text,
  title text not null check (char_length(title) between 5 and 180),
  description text not null,
  category text not null default 'ai_training',
  work_type text not null default 'remote' check (work_type in ('remote','hybrid','onsite')),
  engagement text not null default 'contract' check (engagement in ('contract','part_time','full_time','task_based','project')),
  compensation_type text not null default 'not_disclosed' check (compensation_type in ('hourly','fixed','per_task','not_disclosed')),
  compensation_currency char(3),
  compensation_min numeric(12,2),
  compensation_max numeric(12,2),
  skills text[] not null default '{}',
  location text,
  status text not null default 'pending_review' check (status in ('draft','pending_review','published','paused','closed','rejected')),
  application_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.ai_jobs(id) on delete cascade,
  applicant_user_id uuid not null references auth.users(id) on delete cascade,
  cover_note text,
  cv_object_path text,
  screening_answers jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check (status in ('submitted','reviewing','shortlisted','assessment','interview','offered','accepted','rejected','withdrawn')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, applicant_user_id)
);

create table if not exists public.social_channels (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('instagram','facebook','tiktok','youtube','x','linkedin','threads')),
  account_label text not null,
  provider_account_id text,
  secret_reference text,
  status text not null default 'pending' check (status in ('pending','connected','expired','revoked','error')),
  scopes text[] not null default '{}',
  connected_at timestamptz,
  created_at timestamptz not null default now(),
  unique (owner_user_id, platform, provider_account_id)
);

create table if not exists public.social_publish_jobs (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.social_channels(id) on delete cascade,
  media_asset_id uuid references public.media_assets(id),
  caption text not null,
  scheduled_at timestamptz,
  status text not null default 'draft' check (status in ('draft','awaiting_approval','scheduled','publishing','published','failed','cancelled')),
  external_post_id text,
  last_error text,
  approved_by uuid references auth.users(id),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  purpose text not null check (purpose in ('membership','music_subscription','studio_subscription','shop_order','other')),
  provider text not null check (provider in ('mpesa','paypal','card')),
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null,
  status text not null default 'created' check (status in ('created','pending','succeeded','failed','cancelled','refunded')),
  provider_reference text unique,
  idempotency_key text not null unique,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studios_owner_idx on public.studios(owner_user_id);
create index if not exists studio_members_user_idx on public.studio_members(user_id);
create index if not exists media_assets_department_idx on public.media_assets(department, moderation_status, created_at desc);
create index if not exists tv_programs_channel_idx on public.tv_programs(channel_id, status, scheduled_at);
create index if not exists ai_jobs_discovery_idx on public.ai_jobs(status, category, created_at desc);
create index if not exists ai_job_applications_user_idx on public.ai_job_applications(applicant_user_id, submitted_at desc);
create index if not exists social_publish_queue_idx on public.social_publish_jobs(status, scheduled_at);
create index if not exists payment_intents_user_idx on public.payment_intents(user_id, created_at desc);

alter table public.studios enable row level security;
alter table public.studio_members enable row level security;
alter table public.studio_artist_roster enable row level security;
alter table public.media_assets enable row level security;
alter table public.tv_channels enable row level security;
alter table public.tv_programs enable row level security;
alter table public.ai_jobs enable row level security;
alter table public.ai_job_applications enable row level security;
alter table public.social_channels enable row level security;
alter table public.social_publish_jobs enable row level security;
alter table public.payment_intents enable row level security;

create policy "studio_member_read" on public.studios for select to authenticated
using (owner_user_id = (select auth.uid()) or exists (
  select 1 from public.studio_members sm where sm.studio_id = id and sm.user_id = (select auth.uid())
) or public.has_redplanet_role(array['administrator','platform_owner','department_manager']));

create policy "studio_owner_create" on public.studios for insert to authenticated
with check (owner_user_id = (select auth.uid()));

create policy "studio_owner_update" on public.studios for update to authenticated
using (owner_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','platform_owner']))
with check (owner_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','platform_owner']));

create policy "studio_members_read" on public.studio_members for select to authenticated
using (user_id = (select auth.uid()) or exists (
  select 1 from public.studios s where s.id = studio_id and s.owner_user_id = (select auth.uid())
) or public.has_redplanet_role(array['administrator','platform_owner']));

create policy "media_owner_or_staff_read" on public.media_assets for select to authenticated
using (owner_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','platform_owner','editor','tv_producer']));
create policy "media_owner_create" on public.media_assets for insert to authenticated
with check (owner_user_id = (select auth.uid()));

create policy "published_tv_read" on public.tv_channels for select to anon, authenticated
using (status = 'published');
create policy "tv_staff_manage_channels" on public.tv_channels for all to authenticated
using (public.has_redplanet_role(array['administrator','platform_owner','tv_producer']))
with check (public.has_redplanet_role(array['administrator','platform_owner','tv_producer']));
create policy "published_programs_read" on public.tv_programs for select to anon, authenticated
using (status = 'published');
create policy "tv_staff_manage_programs" on public.tv_programs for all to authenticated
using (public.has_redplanet_role(array['administrator','platform_owner','tv_producer']))
with check (public.has_redplanet_role(array['administrator','platform_owner','tv_producer']));

create policy "published_jobs_read" on public.ai_jobs for select to anon, authenticated
using (status = 'published');
create policy "job_poster_create" on public.ai_jobs for insert to authenticated
with check (poster_user_id = (select auth.uid()));
create policy "job_poster_or_reviewer_update" on public.ai_jobs for update to authenticated
using (poster_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','platform_owner','jobs_reviewer']))
with check (poster_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','platform_owner','jobs_reviewer']));

create policy "application_applicant_or_reviewer_read" on public.ai_job_applications for select to authenticated
using (applicant_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','platform_owner','jobs_reviewer']));
create policy "application_self_create" on public.ai_job_applications for insert to authenticated
with check (applicant_user_id = (select auth.uid()));
create policy "application_applicant_or_reviewer_update" on public.ai_job_applications for update to authenticated
using (applicant_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','platform_owner','jobs_reviewer']))
with check (applicant_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','platform_owner','jobs_reviewer']));

create policy "social_channels_owner_read" on public.social_channels for select to authenticated
using (owner_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','platform_owner']));
create policy "social_channels_owner_create" on public.social_channels for insert to authenticated
with check (owner_user_id = (select auth.uid()));
create policy "social_channels_owner_update" on public.social_channels for update to authenticated
using (owner_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','platform_owner']))
with check (owner_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','platform_owner']));

create policy "social_publish_owner_or_staff_read" on public.social_publish_jobs for select to authenticated
using (exists (select 1 from public.social_channels sc where sc.id = channel_id and sc.owner_user_id = (select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner']));
create policy "social_publish_owner_create" on public.social_publish_jobs for insert to authenticated
with check (exists (select 1 from public.social_channels sc where sc.id = channel_id and sc.owner_user_id = (select auth.uid())));

create policy "payment_intents_owner_read" on public.payment_intents for select to authenticated
using (user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','platform_owner','finance_operator']));

-- No client-side payment success updates, social token writes, or role grants are allowed.
-- Trusted server webhooks/workers must verify provider signatures before changing statuses.
