-- Red Planet security hardening for ecosystem expansion.
-- Apply after 202611190003_ecosystem_expansion.sql.
-- Fixes recursive studio RLS and prevents users approving their own content/jobs.

create or replace function public.can_access_studio(target_studio_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.studios s
    where s.id = target_studio_id
      and (
        s.owner_user_id = target_user_id
        or exists (
          select 1
          from public.studio_members sm
          where sm.studio_id = s.id
            and sm.user_id = target_user_id
        )
      )
  );
$$;

create or replace function public.can_manage_studio(target_studio_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.studios s
    where s.id = target_studio_id
      and (
        s.owner_user_id = target_user_id
        or exists (
          select 1
          from public.studio_members sm
          where sm.studio_id = s.id
            and sm.user_id = target_user_id
            and sm.studio_role in ('owner', 'manager')
        )
      )
  );
$$;

revoke all on function public.can_access_studio(uuid, uuid) from public, anon;
revoke all on function public.can_manage_studio(uuid, uuid) from public, anon;
grant execute on function public.can_access_studio(uuid, uuid) to authenticated;
grant execute on function public.can_manage_studio(uuid, uuid) to authenticated;

-- Avoid mutually recursive RLS evaluation between studios and studio_members.
drop policy if exists "studio_member_read" on public.studios;
create policy "studio_member_read" on public.studios
for select to authenticated
using (
  public.can_access_studio(id, (select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner','department_manager'])
);

-- Owners may edit pending studio details but cannot activate or approve their own studio.
drop policy if exists "studio_owner_update" on public.studios;
create policy "studio_owner_update_pending" on public.studios
for update to authenticated
using (
  owner_user_id = (select auth.uid())
  and status = 'pending'
)
with check (
  (owner_user_id = (select auth.uid()) and status = 'pending')
  or public.has_redplanet_role(array['administrator','platform_owner'])
);

drop policy if exists "studio_members_read" on public.studio_members;
create policy "studio_members_read" on public.studio_members
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.can_manage_studio(studio_id, (select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner'])
);

-- Studio roster is visible only to its tenant and platform administrators.
create policy "studio_roster_read" on public.studio_artist_roster
for select to authenticated
using (
  public.can_access_studio(studio_id, (select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner'])
);
create policy "studio_roster_manage" on public.studio_artist_roster
for all to authenticated
using (
  public.can_manage_studio(studio_id, (select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner'])
)
with check (
  public.can_manage_studio(studio_id, (select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner'])
);

-- Media owners may upload only private, unapproved assets. Moderation is staff-only.
drop policy if exists "media_owner_create" on public.media_assets;
create policy "media_owner_create_pending_private" on public.media_assets
for insert to authenticated
with check (
  owner_user_id = (select auth.uid())
  and visibility = 'private'
  and moderation_status = 'pending'
);
create policy "media_staff_moderate" on public.media_assets
for update to authenticated
using (public.has_redplanet_role(array['administrator','platform_owner','editor','moderator','tv_producer']))
with check (public.has_redplanet_role(array['administrator','platform_owner','editor','moderator','tv_producer']));

-- Job posters cannot publish their own listings or modify an already-published listing.
drop policy if exists "job_poster_or_reviewer_update" on public.ai_jobs;
create policy "job_poster_edit_unpublished" on public.ai_jobs
for update to authenticated
using (
  poster_user_id = (select auth.uid())
  and status in ('draft','pending_review','paused','closed','rejected')
)
with check (
  poster_user_id = (select auth.uid())
  and status in ('draft','pending_review','paused','closed','rejected')
);
create policy "job_reviewer_moderate" on public.ai_jobs
for update to authenticated
using (public.has_redplanet_role(array['administrator','platform_owner','jobs_reviewer']))
with check (public.has_redplanet_role(array['administrator','platform_owner','jobs_reviewer']));

-- Applicants may submit and read their own applications, but cannot promote themselves.
drop policy if exists "application_applicant_or_reviewer_update" on public.ai_job_applications;
create policy "application_reviewer_update" on public.ai_job_applications
for update to authenticated
using (public.has_redplanet_role(array['administrator','platform_owner','jobs_reviewer']))
with check (public.has_redplanet_role(array['administrator','platform_owner','jobs_reviewer']));

-- Social account connection state and publication state are server-controlled.
drop policy if exists "social_channels_owner_create" on public.social_channels;
drop policy if exists "social_channels_owner_update" on public.social_channels;
create policy "social_channels_staff_manage" on public.social_channels
for all to authenticated
using (public.has_redplanet_role(array['administrator','platform_owner']))
with check (public.has_redplanet_role(array['administrator','platform_owner']));

drop policy if exists "social_publish_owner_create" on public.social_publish_jobs;
create policy "social_publish_owner_create_draft" on public.social_publish_jobs
for insert to authenticated
with check (
  exists (
    select 1 from public.social_channels sc
    where sc.id = channel_id
      and sc.owner_user_id = (select auth.uid())
  )
  and status in ('draft','awaiting_approval')
  and approved_by is null
  and published_at is null
);
create policy "social_publish_staff_manage" on public.social_publish_jobs
for all to authenticated
using (public.has_redplanet_role(array['administrator','platform_owner']))
with check (public.has_redplanet_role(array['administrator','platform_owner']));
