-- Idempotent audit trail for verified payment-provider webhook deliveries.
create table if not exists public.payment_webhook_events (
  id bigint generated always as identity primary key,
  provider text not null check (provider in ('paypal')),
  provider_event_id text not null,
  event_type text not null,
  processing_status text not null default 'received' check (processing_status in ('received','processed','ignored','failed')),
  related_order_id text,
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(provider, provider_event_id)
);
create index if not exists payment_webhook_events_status_idx
  on public.payment_webhook_events(processing_status, received_at);
alter table public.payment_webhook_events enable row level security;
revoke all on public.payment_webhook_events from anon, authenticated;
-- Only the trusted payment webhook (service role) may write or inspect delivery events.
