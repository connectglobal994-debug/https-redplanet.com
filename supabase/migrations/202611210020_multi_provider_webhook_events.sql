-- Permit independently verified M-Pesa callback events in the shared audit ledger.
alter table public.payment_webhook_events
  drop constraint if exists payment_webhook_events_provider_check;

alter table public.payment_webhook_events
  add constraint payment_webhook_events_provider_check
  check (provider in ('paypal','mpesa','card','bank_transfer','wise','manual','other'));
