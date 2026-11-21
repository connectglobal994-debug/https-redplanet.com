-- Secure trading workspace foundation. Broker credentials and order execution stay server-side.
create table if not exists public.trading_workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  environment text not null default 'demo' check (environment in ('demo','live_pending')),
  risk_per_trade_pct numeric(5,2) not null default 0.50 check (risk_per_trade_pct between 0.01 and 2.00),
  max_daily_loss_pct numeric(5,2) not null default 2.00 check (max_daily_loss_pct between 0.10 and 5.00),
  max_open_positions integer not null default 3 check (max_open_positions between 1 and 10),
  bot_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trading_connection_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'mt5' check (provider in ('mt5')),
  broker_name text not null check (char_length(broker_name) between 2 and 120),
  broker_server text,
  requested_environment text not null default 'demo' check (requested_environment in ('demo','live')),
  notes text,
  status text not null default 'pending' check (status in ('pending','in_review','action_required','connected','rejected','cancelled')),
  staff_notes text,
  assigned_to uuid references auth.users(id),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trading_activity (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('connection','bot','risk','order','trade','system')),
  event_status text not null,
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists trading_requests_user_idx on public.trading_connection_requests(user_id, created_at desc);
create index if not exists trading_activity_user_idx on public.trading_activity(user_id, occurred_at desc);

alter table public.trading_workspaces enable row level security;
alter table public.trading_connection_requests enable row level security;
alter table public.trading_activity enable row level security;

drop policy if exists trading_workspace_owner_read on public.trading_workspaces;
create policy trading_workspace_owner_read on public.trading_workspaces
for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists trading_workspace_owner_create on public.trading_workspaces;
create policy trading_workspace_owner_create on public.trading_workspaces
for insert to authenticated with check (
  user_id = (select auth.uid()) and environment = 'demo' and bot_enabled = false
);
drop policy if exists trading_workspace_owner_update on public.trading_workspaces;
create policy trading_workspace_owner_update on public.trading_workspaces
for update to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid()) and environment = 'demo' and bot_enabled = false
);

drop policy if exists trading_request_owner_read on public.trading_connection_requests;
create policy trading_request_owner_read on public.trading_connection_requests
for select to authenticated using (
  user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','moderator','editor'])
);
drop policy if exists trading_request_owner_create on public.trading_connection_requests;
create policy trading_request_owner_create on public.trading_connection_requests
for insert to authenticated with check (
  user_id = (select auth.uid()) and status = 'pending'
  and reviewed_at is null and reviewed_by is null and staff_notes is null and assigned_to is null
);
drop policy if exists trading_request_staff_update on public.trading_connection_requests;
create policy trading_request_staff_update on public.trading_connection_requests
for update to authenticated
using (public.has_redplanet_role(array['administrator','moderator','editor']))
with check (public.has_redplanet_role(array['administrator','moderator','editor']));

drop policy if exists trading_activity_owner_read on public.trading_activity;
create policy trading_activity_owner_read on public.trading_activity
for select to authenticated using (
  user_id = (select auth.uid()) or public.has_redplanet_role(array['administrator','moderator'])
);

revoke all on public.trading_workspaces, public.trading_connection_requests, public.trading_activity from anon, authenticated;
grant select, insert, update on public.trading_workspaces to authenticated;
grant select, insert on public.trading_connection_requests to authenticated;
grant update (status, staff_notes, assigned_to, reviewed_at, reviewed_by, updated_at) on public.trading_connection_requests to authenticated;
grant select on public.trading_activity to authenticated;
grant usage, select on sequence public.trading_activity_id_seq to authenticated;

-- There are deliberately no browser write grants for trading activity and no credential columns.
