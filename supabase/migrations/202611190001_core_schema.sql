-- Red Planet initial application schema.
-- Apply only to a dedicated Supabase DEVELOPMENT project first.
-- Review and test RLS policies before production use.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  country_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('member','artist','producer','label','collaborator','editor','moderator','finance_operator','administrator')),
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id),
  primary key (user_id, role)
);

create table if not exists public.artist_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  artist_name text not null,
  biography text,
  website_url text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','pending','verified','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.music_submissions (
  id uuid primary key default gen_random_uuid(),
  artist_profile_id uuid not null references public.artist_profiles(id) on delete cascade,
  title text not null,
  submission_type text not null default 'single'
    check (submission_type in ('single','ep','album','demo','other')),
  status text not null default 'draft'
    check (status in ('draft','submitted','needs_changes','rights_review','approved','scheduled','published','rejected','withdrawn','takedown_requested')),
  description text,
  genre text,
  release_date date,
  audio_object_path text,
  artwork_object_path text,
  rights_declaration boolean not null default false,
  ai_assistance_disclosed boolean not null default false,
  contributor_credits jsonb not null default '[]'::jsonb,
  sample_disclosure text,
  review_notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.music_submissions(id),
  artist_profile_id uuid not null references public.artist_profiles(id),
  slug text not null unique,
  title text not null,
  release_type text not null check (release_type in ('single','ep','album')),
  release_date date,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases(id) on delete cascade,
  title text not null,
  track_number integer not null check (track_number > 0),
  audio_delivery_path text,
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  explicit_content boolean not null default false,
  created_at timestamptz not null default now(),
  unique (release_id, track_number)
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null,
  status text not null check (status in ('pending','active','past_due','cancelled','expired')),
  provider text not null check (provider in ('paypal','manual','other')),
  provider_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  provider text not null,
  provider_order_id text unique,
  provider_capture_id text unique,
  currency char(3) not null,
  amount_minor bigint not null check (amount_minor >= 0),
  status text not null check (status in ('created','pending','completed','failed','refunded','reversed')),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id),
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists music_submissions_artist_idx on public.music_submissions(artist_profile_id, created_at desc);
create index if not exists music_submissions_status_idx on public.music_submissions(status, created_at desc);
create index if not exists memberships_user_idx on public.memberships(user_id, status);
create index if not exists payment_records_user_idx on public.payment_records(user_id, created_at desc);

-- Role check is evaluated inside PostgreSQL, never trusted from browser-supplied role values.
create or replace function public.has_redplanet_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = any(required_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.artist_profiles enable row level security;
alter table public.music_submissions enable row level security;
alter table public.releases enable row level security;
alter table public.tracks enable row level security;
alter table public.memberships enable row level security;
alter table public.payment_records enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles_select_self_or_admin" on public.profiles
for select to authenticated
using (id = (select auth.uid()) or public.has_redplanet_role(array['administrator','moderator']));

create policy "profiles_insert_self" on public.profiles
for insert to authenticated
with check (id = (select auth.uid()));

create policy "profiles_update_self_or_admin" on public.profiles
for update to authenticated
using (id = (select auth.uid()) or public.has_redplanet_role(array['administrator']))
with check (id = (select auth.uid()) or public.has_redplanet_role(array['administrator']));

create policy "roles_read_self_or_admin" on public.user_roles
for select to authenticated
using (user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator']));

-- No client insert/update/delete policy for roles: privileged role grants must be server-admin controlled.
create policy "artist_profile_read_owner_or_staff" on public.artist_profiles
for select to authenticated
using (owner_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','moderator','editor']));

create policy "artist_profile_create_owner" on public.artist_profiles
for insert to authenticated
with check (owner_user_id = (select auth.uid()));

create policy "artist_profile_update_owner_or_staff" on public.artist_profiles
for update to authenticated
using (owner_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','moderator']))
with check (owner_user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','moderator']));

create policy "submission_read_owner_or_staff" on public.music_submissions
for select to authenticated
using (
  exists (select 1 from public.artist_profiles ap
          where ap.id = artist_profile_id and ap.owner_user_id = (select auth.uid()))
  or public.has_redplanet_role(array['administrator','moderator','editor'])
);

create policy "submission_create_owner_draft" on public.music_submissions
for insert to authenticated
with check (
  status = 'draft'
  and exists (select 1 from public.artist_profiles ap
              where ap.id = artist_profile_id and ap.owner_user_id = (select auth.uid()))
);

create policy "submission_update_owner_draft" on public.music_submissions
for update to authenticated
using (
  status in ('draft','needs_changes')
  and exists (select 1 from public.artist_profiles ap
              where ap.id = artist_profile_id and ap.owner_user_id = (select auth.uid()))
)
with check (
  status in ('draft','needs_changes','submitted')
  and exists (select 1 from public.artist_profiles ap
              where ap.id = artist_profile_id and ap.owner_user_id = (select auth.uid()))
);

create policy "submission_staff_review" on public.music_submissions
for update to authenticated
using (public.has_redplanet_role(array['administrator','moderator','editor']))
with check (public.has_redplanet_role(array['administrator','moderator','editor']));

create policy "published_releases_public_read" on public.releases
for select to anon, authenticated
using (published = true);

create policy "release_staff_read_all" on public.releases
for select to authenticated
using (public.has_redplanet_role(array['administrator','moderator','editor']));

create policy "published_tracks_public_read" on public.tracks
for select to anon, authenticated
using (exists (select 1 from public.releases r where r.id = release_id and r.published = true));

create policy "track_staff_read_all" on public.tracks
for select to authenticated
using (public.has_redplanet_role(array['administrator','moderator','editor']));

create policy "membership_read_owner_or_finance" on public.memberships
for select to authenticated
using (user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','finance_operator']));

create policy "payment_read_owner_or_finance" on public.payment_records
for select to authenticated
using (user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','finance_operator']));

-- No authenticated client write policies for memberships, payment_records or audit_events.
-- Trusted backend/webhook functions using the service role own those writes.


-- Explicit grants complement RLS. Policies do not revoke table privileges.
revoke all on table public.profiles, public.user_roles, public.artist_profiles,
  public.music_submissions, public.releases, public.tracks, public.memberships,
  public.payment_records, public.audit_events from anon, authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select on table public.user_roles to authenticated;
grant select, insert, update on table public.artist_profiles to authenticated;
grant select, insert, update on table public.music_submissions to authenticated;
grant select on table public.releases to anon, authenticated;
grant select on table public.tracks to anon, authenticated;
grant select on table public.memberships to authenticated;
grant select on table public.payment_records to authenticated;

revoke all on function public.has_redplanet_role(text[]) from public, anon;
grant execute on function public.has_redplanet_role(text[]) to authenticated;
