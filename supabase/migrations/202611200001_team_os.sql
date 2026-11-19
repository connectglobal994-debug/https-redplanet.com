-- Red Planet Team OS + AI Academy application tables.
-- Apply in Supabase SQL Editor in DEVELOPMENT only, after 202611190001_core_schema.sql.
create table if not exists public.rp_tasks (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 1 and 140),
 description text,
 status text not null default 'todo' check(status in ('todo','doing','blocked','done')),
 priority text not null default 'normal' check(priority in ('low','normal','high','urgent')),
 assignee_id uuid not null references auth.users(id) on delete cascade,
 created_by uuid not null references auth.users(id),
 due_at date,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.rp_kpis (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null,
 description text,
 target_value numeric not null default 1,
 current_value numeric not null default 0,
 unit text,
 review_period text not null default 'weekly' check(review_period in ('weekly','monthly','quarterly')),
 created_at timestamptz not null default now()
);
create table if not exists public.rp_training_progress (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 course_code text not null,
 status text not null default 'in_progress' check(status in ('in_progress','completed')),
 completed_at timestamptz,
 updated_at timestamptz not null default now(),
 unique(user_id,course_code)
);
create table if not exists public.rp_training_materials (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 course_code text not null,
 body text not null,
 visibility text not null default 'team' check(visibility in ('team','manager','admin')),
 published boolean not null default false,
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now()
);
create index if not exists rp_tasks_assignee_idx on public.rp_tasks(assignee_id,status,due_at);
create index if not exists rp_kpis_owner_idx on public.rp_kpis(owner_id,created_at desc);
alter table public.rp_tasks enable row level security;
alter table public.rp_kpis enable row level security;
alter table public.rp_training_progress enable row level security;
alter table public.rp_training_materials enable row level security;

drop policy if exists rp_tasks_read_own_or_admin on public.rp_tasks;
create policy rp_tasks_read_own_or_admin on public.rp_tasks for select to authenticated
using(assignee_id=(select auth.uid()) or created_by=(select auth.uid()) or public.has_redplanet_role(array['administrator']));
drop policy if exists rp_tasks_insert_self on public.rp_tasks;
create policy rp_tasks_insert_self on public.rp_tasks for insert to authenticated
with check(assignee_id=(select auth.uid()) and created_by=(select auth.uid()));
drop policy if exists rp_tasks_update_own_or_admin on public.rp_tasks;
create policy rp_tasks_update_own_or_admin on public.rp_tasks for update to authenticated
using(assignee_id=(select auth.uid()) or public.has_redplanet_role(array['administrator']))
with check(assignee_id=(select auth.uid()) or public.has_redplanet_role(array['administrator']));

drop policy if exists rp_kpis_read_owner_or_admin on public.rp_kpis;
create policy rp_kpis_read_owner_or_admin on public.rp_kpis for select to authenticated
using(owner_id=(select auth.uid()) or public.has_redplanet_role(array['administrator']));
-- KPI creation/changes are admin-only; do not let users rewrite their own targets.
drop policy if exists rp_kpis_admin_manage on public.rp_kpis;
create policy rp_kpis_admin_manage on public.rp_kpis for all to authenticated
using(public.has_redplanet_role(array['administrator']))
with check(public.has_redplanet_role(array['administrator']));

drop policy if exists rp_training_progress_own on public.rp_training_progress;
create policy rp_training_progress_own on public.rp_training_progress for select to authenticated
using(user_id=(select auth.uid()) or public.has_redplanet_role(array['administrator']));
drop policy if exists rp_training_progress_write_own on public.rp_training_progress;
create policy rp_training_progress_write_own on public.rp_training_progress for insert to authenticated
with check(user_id=(select auth.uid()));
drop policy if exists rp_training_progress_update_own on public.rp_training_progress;
create policy rp_training_progress_update_own on public.rp_training_progress for update to authenticated
using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

drop policy if exists rp_training_materials_read_published on public.rp_training_materials;
create policy rp_training_materials_read_published on public.rp_training_materials for select to authenticated
using(published=true and (visibility='team' or (visibility='manager' and public.has_redplanet_role(array['administrator'])) or (visibility='admin' and public.has_redplanet_role(array['administrator']))));
drop policy if exists rp_training_materials_admin_manage on public.rp_training_materials;
create policy rp_training_materials_admin_manage on public.rp_training_materials for all to authenticated
using(public.has_redplanet_role(array['administrator']))
with check(public.has_redplanet_role(array['administrator']));

revoke all on public.rp_tasks,public.rp_kpis,public.rp_training_progress,public.rp_training_materials from anon,authenticated;
grant select,insert,update on public.rp_tasks to authenticated;
grant select,insert,update on public.rp_kpis to authenticated;
grant select,insert,update on public.rp_training_progress to authenticated;
grant select on public.rp_training_materials to authenticated;
