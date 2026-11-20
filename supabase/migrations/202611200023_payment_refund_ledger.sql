-- Auditable Flutterwave refund ledger. A refund webhook is not enough on its own:
-- the webhook handler must re-fetch the refund and its original transaction.
create table if not exists public.payment_refunds (
  id bigint generated always as identity primary key,
  payment_id uuid not null references public.payment_records(id) on delete restrict,
  provider text not null check (provider in ('flutterwave','paypal')),
  provider_refund_id text not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status text not null check (status in ('pending','completed','failed','cancelled')),
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_refund_id)
);

create index if not exists payment_refunds_payment_status_idx
  on public.payment_refunds(payment_id, status);

alter table public.payment_refunds enable row level security;
revoke all on public.payment_refunds from anon, authenticated;
