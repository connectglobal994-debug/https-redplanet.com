-- Red Planet unified platform foundation.
-- Adds a platform registry, secure social-account workflow, research workspace,
-- employer profiles, and stricter state transitions for existing job/social tables.
-- Apply after 202611220003_ai_knowledge.sql in the development project first.

-- Add the operational roles referenced by the new RLS policies.
alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles add constraint user_roles_role_check check (
 role in (
  'member','artist','producer','label','collaborator','editor','moderator',
  'finance_operator','administrator','platform_owner','department_manager',
  'studio_owner','studio_manager','tv_producer','jobs_reviewer','support_agent',
  'marketing_manager','research_manager','social_manager'
 )
);

-- Expand the original provider list without claiming every provider is API-ready.
alter table public.social_channels drop constraint if exists social_channels_platform_check;
alter table public.social_channels
  add constraint social_channels_platform_check
  check (platform in (
    'instagram','facebook','tiktok','youtube','x','linkedin','threads',
    'whatsapp','snapchat','pinterest','telegram','discord','reddit',
    'mastodon','bluesky'
  ));

create table if not exists public.social_platform_catalog (
  platform text primary key check (platform in (
    'instagram','facebook','tiktok','youtube','x','linkedin','threads',
    'whatsapp','snapchat','pinterest','telegram','discord','reddit',
    'mastodon','bluesky'
  )),
  display_name text not null,
  integration_status text not null default 'planned'
    check (integration_status in ('planned','developer_setup_required','available','limited','unavailable')),
  connection_method text not null default 'official_oauth_or_business_api',
  supports_publishing boolean not null default false,
  supports_inbox boolean not null default false,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.social_platform_catalog
  (platform,display_name,integration_status,supports_publishing,supports_inbox,notes)
values
 ('instagram','Instagram','developer_setup_required',false,false,'Meta app review, professional account and approved permissions required'),
 ('facebook','Facebook Pages','developer_setup_required',false,false,'Meta app review and Page permissions required'),
 ('whatsapp','WhatsApp Business','developer_setup_required',false,false,'WhatsApp Business Platform, verified business and webhook required; personal WhatsApp is not an API integration'),
 ('tiktok','TikTok','developer_setup_required',false,false,'TikTok developer approval and Content Posting API scopes required'),
 ('youtube','YouTube','developer_setup_required',false,false,'Google OAuth consent and YouTube Data API quota/permissions required'),
 ('x','X','developer_setup_required',false,false,'X developer project and applicable API access tier required'),
 ('linkedin','LinkedIn','developer_setup_required',false,false,'LinkedIn app review and organization/community management permissions required'),
 ('threads','Threads','developer_setup_required',false,false,'Meta Threads API access and approved scopes required'),
 ('snapchat','Snapchat','planned',false,false,'Snap Kit and Public Profile API eligibility must be confirmed'),
 ('pinterest','Pinterest','developer_setup_required',false,false,'Pinterest developer app and approved scopes required'),
 ('telegram','Telegram','developer_setup_required',false,false,'Bot API integration; user account access is not implied'),
 ('discord','Discord','developer_setup_required',false,false,'Bot/OAuth application and server-level consent required'),
 ('reddit','Reddit','planned',false,false,'OAuth app and current API terms/approval must be confirmed'),
 ('mastodon','Mastodon','planned',false,false,'Instance-specific OAuth and server policy required'),
 ('bluesky','Bluesky','planned',false,false,'App-password or OAuth approach must be selected and security reviewed')
on conflict (platform) do update set
 display_name=excluded.display_name,
 notes=excluded.notes,
 updated_at=now();

alter table public.social_platform_catalog enable row level security;
drop policy if exists social_platform_catalog_public_read on public.social_platform_catalog;
create policy social_platform_catalog_public_read
  on public.social_platform_catalog for select to anon,authenticated using (true);
revoke insert,update,delete on public.social_platform_catalog from anon,authenticated;
grant select on public.social_platform_catalog to anon,authenticated;

-- OAuth callback/worker is the only writer of connection state and secret references.
-- Provider tokens must live in a server-side secret manager or encrypted server-only vault,
-- never in browser storage or a client-writable row.
revoke insert,update,delete on public.social_channels from authenticated;
grant select on public.social_channels to authenticated;

create table if not exists public.social_inbox_threads (
 id uuid primary key default gen_random_uuid(),
 channel_id uuid not null references public.social_channels(id) on delete cascade,
 external_thread_id text not null,
 contact_label text,
 contact_external_id text,
 status text not null default 'open' check(status in ('open','pending','resolved','archived')),
 assigned_to uuid references auth.users(id),
 last_message_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(channel_id,external_thread_id)
);
create table if not exists public.social_inbox_messages (
 id uuid primary key default gen_random_uuid(),
 thread_id uuid not null references public.social_inbox_threads(id) on delete cascade,
 external_message_id text,
 direction text not null check(direction in ('inbound','outbound')),
 message_type text not null default 'text' check(message_type in ('text','image','video','audio','file','system')),
 body text,
 media_reference text,
 sent_by_ai boolean not null default false,
 delivery_status text not null default 'received' check(delivery_status in ('received','queued','sent','delivered','read','failed')),
 received_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
alter table public.social_inbox_threads enable row level security;
alter table public.social_inbox_messages enable row level security;
create policy social_inbox_threads_owner_read on public.social_inbox_threads
 for select to authenticated using (
  exists(select 1 from public.social_channels sc where sc.id=channel_id and sc.owner_user_id=(select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner','marketing_manager'])
 );
create policy social_inbox_messages_owner_read on public.social_inbox_messages
 for select to authenticated using (
  exists(select 1 from public.social_inbox_threads t join public.social_channels sc on sc.id=t.channel_id
   where t.id=thread_id and sc.owner_user_id=(select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner','marketing_manager'])
 );
revoke insert,update,delete on public.social_inbox_threads,social_inbox_messages from anon,authenticated;
grant select on public.social_inbox_threads,social_inbox_messages to authenticated;

-- Content approval is required before a server worker can publish.
create or replace function public.guard_social_publish_job()
returns trigger language plpgsql security invoker set search_path=''
as $$
begin
 if auth.role() <> 'service_role'
   and not public.has_redplanet_role(array['administrator','platform_owner','marketing_manager']) then
   if tg_op='INSERT' then
     if new.status not in ('draft','awaiting_approval') then
       raise exception 'Social content must enter the approval queue before publishing';
     end if;
     new.approved_by := null;
     new.published_at := null;
     new.external_post_id := null;
   elsif tg_op='UPDATE' then
     if new.status in ('publishing','published') or new.approved_by is distinct from old.approved_by
       or new.published_at is distinct from old.published_at
       or new.external_post_id is distinct from old.external_post_id then
       raise exception 'Publishing state is controlled by an authorized reviewer or server worker';
     end if;
   end if;
 end if;
 return new;
end;
$$;
drop trigger if exists guard_social_publish_job_trigger on public.social_publish_jobs;
create trigger guard_social_publish_job_trigger
 before insert or update on public.social_publish_jobs
 for each row execute function public.guard_social_publish_job();

-- Prevent applicants and job posters from changing reviewer-controlled workflow states.
create or replace function public.guard_job_workflow_state()
returns trigger language plpgsql security invoker set search_path=''
as $$
begin
 if auth.role() <> 'service_role'
   and not public.has_redplanet_role(array['administrator','platform_owner','jobs_reviewer']) then
   if tg_table_name='ai_jobs' then
     if tg_op='INSERT' then
       if new.poster_user_id is distinct from auth.uid() or new.status not in ('draft','pending_review') then
         raise exception 'New jobs must belong to the signed-in employer and enter review';
       end if;
     elsif new.poster_user_id is distinct from old.poster_user_id
       or new.status is distinct from old.status then
       raise exception 'Job ownership and review status are controlled by Red Planet reviewers';
     end if;
   elsif tg_table_name='ai_job_applications' then
     if tg_op='INSERT' then
       if new.applicant_user_id is distinct from auth.uid() or new.status <> 'submitted' then
         raise exception 'Applications must be submitted by the signed-in applicant';
       end if;
     elsif new.job_id is distinct from old.job_id
       or new.applicant_user_id is distinct from old.applicant_user_id
       or new.status is distinct from old.status then
       raise exception 'Application identity and review status are controlled by Red Planet reviewers';
     end if;
   end if;
 end if;
 return new;
end;
$$;
drop trigger if exists guard_ai_jobs_workflow_state on public.ai_jobs;
create trigger guard_ai_jobs_workflow_state
 before insert or update on public.ai_jobs for each row execute function public.guard_job_workflow_state();
drop trigger if exists guard_ai_job_applications_workflow_state on public.ai_job_applications;
create trigger guard_ai_job_applications_workflow_state
 before insert or update on public.ai_job_applications for each row execute function public.guard_job_workflow_state();

-- Employer identity is separate from the job posting and can be verified by staff.
create table if not exists public.job_employer_profiles (
 id uuid primary key default gen_random_uuid(),
 owner_user_id uuid not null unique references auth.users(id) on delete cascade,
 organization_name text not null check(char_length(trim(organization_name)) between 2 and 160),
 website_url text,
 contact_email text,
 verification_status text not null default 'pending' check(verification_status in ('pending','verified','rejected','suspended')),
 verified_by uuid references auth.users(id),
 verified_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.job_employer_profiles enable row level security;
create policy job_employer_owner_read on public.job_employer_profiles for select to authenticated
 using(owner_user_id=(select auth.uid()) or public.has_redplanet_role(array['administrator','platform_owner','jobs_reviewer']));
create policy job_employer_owner_create on public.job_employer_profiles for insert to authenticated
 with check(owner_user_id=(select auth.uid()) and verification_status='pending');
create policy job_employer_owner_update_pending on public.job_employer_profiles for update to authenticated
 using(owner_user_id=(select auth.uid()) and verification_status='pending')
 with check(owner_user_id=(select auth.uid()) and verification_status='pending');
create policy job_employer_staff_manage on public.job_employer_profiles for all to authenticated
 using(public.has_redplanet_role(array['administrator','platform_owner','jobs_reviewer']))
 with check(public.has_redplanet_role(array['administrator','platform_owner','jobs_reviewer']));

-- Research projects are private to their owner and explicitly shared collaborators.
create table if not exists public.research_projects (
 id uuid primary key default gen_random_uuid(),
 owner_user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(trim(title)) between 3 and 180),
 research_question text not null check(char_length(trim(research_question)) between 10 and 5000),
 status text not null default 'active' check(status in ('active','paused','completed','archived')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.research_project_members (
 project_id uuid not null references public.research_projects(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 member_role text not null default 'viewer' check(member_role in ('editor','viewer')),
 invited_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 primary key(project_id,user_id)
);
create table if not exists public.research_sources (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.research_projects(id) on delete cascade,
 added_by uuid not null references auth.users(id),
 source_url text not null check(char_length(source_url) between 8 and 2048),
 title text,
 publisher text,
 published_at timestamptz,
 accessed_at timestamptz not null default now(),
 notes text,
 evidence_excerpt text,
 source_type text not null default 'web' check(source_type in ('web','paper','book','report','dataset','interview','other')),
 created_at timestamptz not null default now()
);
create table if not exists public.research_findings (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.research_projects(id) on delete cascade,
 created_by uuid not null references auth.users(id),
 title text not null check(char_length(trim(title)) between 3 and 180),
 body text not null check(char_length(trim(body)) between 1 and 12000),
 source_ids uuid[] not null default '{}',
 confidence text not null default 'unrated' check(confidence in ('unrated','low','medium','high')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.research_projects enable row level security;
alter table public.research_project_members enable row level security;
alter table public.research_sources enable row level security;
alter table public.research_findings enable row level security;
create or replace function public.can_access_research_project(target_project_id uuid,target_user_id uuid)
returns boolean language sql stable security definer set search_path=''
as $$
 select exists(select 1 from public.research_projects p where p.id=target_project_id and (
  p.owner_user_id=target_user_id or exists(select 1 from public.research_project_members m where m.project_id=p.id and m.user_id=target_user_id)
 ));
$$;
revoke all on function public.can_access_research_project(uuid,uuid) from public,anon;
grant execute on function public.can_access_research_project(uuid,uuid) to authenticated;
create or replace function public.can_edit_research_project(target_project_id uuid,target_user_id uuid)
returns boolean language sql stable security definer set search_path=''
as $$
 select exists(select 1 from public.research_projects p where p.id=target_project_id and (
  p.owner_user_id=target_user_id or exists(select 1 from public.research_project_members m
   where m.project_id=p.id and m.user_id=target_user_id and m.member_role='editor')
 ));
$$
revoke all on function public.can_edit_research_project(uuid,uuid) from public,anon;
grant execute on function public.can_edit_research_project(uuid,uuid) to authenticated;
create policy research_project_owner_read on public.research_projects for select to authenticated
 using(owner_user_id=(select auth.uid()) or public.can_access_research_project(id,(select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner','research_manager']));
create policy research_project_owner_create on public.research_projects for insert to authenticated
 with check(owner_user_id=(select auth.uid()));
create policy research_project_owner_update on public.research_projects for update to authenticated
 using(owner_user_id=(select auth.uid())) with check(owner_user_id=(select auth.uid()));
create policy research_members_read on public.research_project_members for select to authenticated
 using(user_id=(select auth.uid()) or public.can_access_research_project(project_id,(select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner','research_manager']));
create policy research_members_owner_manage on public.research_project_members for all to authenticated
 using(exists(select 1 from public.research_projects p where p.id=project_id and p.owner_user_id=(select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner','research_manager']))
 with check(exists(select 1 from public.research_projects p where p.id=project_id and p.owner_user_id=(select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner','research_manager']));
create policy research_sources_member_read on public.research_sources for select to authenticated
 using(public.can_access_research_project(project_id,(select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner','research_manager']));
create policy research_sources_member_create on public.research_sources for insert to authenticated
 with check(added_by=(select auth.uid()) and public.can_access_research_project(project_id,(select auth.uid())));
create policy research_sources_member_update on public.research_sources for update to authenticated
 using(public.can_edit_research_project(project_id,(select auth.uid())))
 with check(public.can_edit_research_project(project_id,(select auth.uid())));
create policy research_findings_member_read on public.research_findings for select to authenticated
 using(public.can_access_research_project(project_id,(select auth.uid()))
  or public.has_redplanet_role(array['administrator','platform_owner','research_manager']));
create policy research_findings_member_create on public.research_findings for insert to authenticated
 with check(created_by=(select auth.uid()) and public.can_access_research_project(project_id,(select auth.uid())));
create policy research_findings_member_update on public.research_findings for update to authenticated
 using(public.can_edit_research_project(project_id,(select auth.uid())))
 with check(public.can_edit_research_project(project_id,(select auth.uid())));

grant select,insert,update,delete on public.research_projects to authenticated;
grant select,insert,update,delete on public.research_project_members to authenticated;
grant select,insert,update,delete on public.research_sources to authenticated;
grant select,insert,update,delete on public.research_findings to authenticated;

create index if not exists research_projects_owner_idx on public.research_projects(owner_user_id,updated_at desc);
create index if not exists research_sources_project_idx on public.research_sources(project_id,created_at desc);
create index if not exists research_findings_project_idx on public.research_findings(project_id,created_at desc);
create index if not exists social_inbox_threads_channel_idx on public.social_inbox_threads(channel_id,last_message_at desc);
create index if not exists social_inbox_messages_thread_idx on public.social_inbox_messages(thread_id,created_at);

-- RLS on social publishing: owners can create drafts, but never approve/publish them.
revoke insert,update on public.social_publish_jobs from authenticated;
grant select on public.social_publish_jobs to authenticated;
