-- Collaboration CRM intake and staff review.
create table if not exists public.collaboration_inquiries (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 contact_name text not null check(char_length(trim(contact_name)) between 2 and 120),
 organization text,
 email text not null check(char_length(trim(email)) between 5 and 254),
 inquiry_type text not null check(inquiry_type in ('artist','label','brand','organization','technology','media','other')),
 subject text not null check(char_length(trim(subject)) between 3 and 160),
 message text not null check(char_length(trim(message)) between 20 and 5000),
 status text not null default 'new' check(status in ('new','reviewing','awaiting_reply','in_discussion','accepted','declined','closed')),
 staff_notes text,
 assigned_to uuid references auth.users(id),
 reviewed_at timestamptz,
 reviewed_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists collaboration_inquiries_user_idx on public.collaboration_inquiries(user_id,created_at desc);
create index if not exists collaboration_inquiries_queue_idx on public.collaboration_inquiries(status,created_at asc);
alter table public.collaboration_inquiries enable row level security;
drop policy if exists collaboration_inquiries_owner_read on public.collaboration_inquiries;
create policy collaboration_inquiries_owner_read on public.collaboration_inquiries
 for select to authenticated using(user_id=(select auth.uid()) or public.has_redplanet_role(array['administrator','editor','moderator']));
drop policy if exists collaboration_inquiries_owner_create on public.collaboration_inquiries;
create policy collaboration_inquiries_owner_create on public.collaboration_inquiries
 for insert to authenticated with check(user_id=(select auth.uid()));
drop policy if exists collaboration_inquiries_staff_update on public.collaboration_inquiries;
create policy collaboration_inquiries_staff_update on public.collaboration_inquiries
 for update to authenticated using(public.has_redplanet_role(array['administrator','editor','moderator']))
 with check(public.has_redplanet_role(array['administrator','editor','moderator']));
revoke all on public.collaboration_inquiries from anon,authenticated;
grant select,insert on public.collaboration_inquiries to authenticated;
grant update(status,staff_notes,assigned_to,reviewed_at,reviewed_by,updated_at) on public.collaboration_inquiries to authenticated;
