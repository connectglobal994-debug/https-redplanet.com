-- Red Planet AI knowledge library (retrieval-augmented generation).
-- Admin-curated source material is retrieved at answer time; this does not fine-tune model weights.

create table if not exists public.rp_ai_knowledge (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  body text not null check (char_length(body) between 30 and 30000),
  category text not null default 'General',
  tags text[] not null default '{}',
  source_type text not null default 'manual' check (source_type in ('manual','approved_source')),
  source_name text,
  source_url text,
  rights_basis text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(category,'') || ' ' ||
      array_to_string(tags, ' ') || ' ' || coalesce(body,''))
  ) stored,
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rp_ai_knowledge_search_idx
  on public.rp_ai_knowledge using gin(search_vector);
create index if not exists rp_ai_knowledge_status_idx
  on public.rp_ai_knowledge(status, updated_at desc);

alter table public.rp_ai_knowledge enable row level security;

drop policy if exists rp_ai_knowledge_public_read on public.rp_ai_knowledge;
create policy rp_ai_knowledge_public_read on public.rp_ai_knowledge
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists rp_ai_knowledge_admin_read on public.rp_ai_knowledge;
create policy rp_ai_knowledge_admin_read on public.rp_ai_knowledge
  for select to authenticated
  using (public.has_redplanet_role(array['administrator','editor']));

revoke all on public.rp_ai_knowledge from anon, authenticated;
grant select on public.rp_ai_knowledge to anon, authenticated;
grant all on public.rp_ai_knowledge to service_role;
