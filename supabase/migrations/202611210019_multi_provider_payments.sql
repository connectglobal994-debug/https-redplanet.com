-- Expand membership payment providers without changing existing membership records.
-- Card data is never stored here; use a PCI-compliant hosted checkout/tokenization provider.
alter table public.memberships
  drop constraint if exists memberships_provider_check;

alter table public.memberships
  add constraint memberships_provider_check
  check (provider in (
    'paypal',
    'mpesa',
    'card',
    'bank_transfer',
    'wise',
    'manual',
    'other'
  ));

-- Keep provider values consistent for payment records as well.
alter table public.payment_records
  add constraint payment_records_provider_check
  check (provider in (
    'paypal',
    'mpesa',
    'card',
    'bank_transfer',
    'wise',
    'manual',
    'other'
  ));

create index if not exists payment_records_provider_status_created_idx
  on public.payment_records(provider, status, created_at desc);
