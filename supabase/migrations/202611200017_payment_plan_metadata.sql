-- Store the server-approved membership terms on each payment before checkout begins.
-- Historical and manually entered payment records remain valid with NULL plan metadata.
alter table public.payment_records
  add column if not exists plan_code text,
  add column if not exists membership_period_days integer;

alter table public.payment_records
  drop constraint if exists payment_records_membership_period_days_check;
alter table public.payment_records
  add constraint payment_records_membership_period_days_check
  check (membership_period_days is null or membership_period_days between 1 and 3660);

create index if not exists payment_records_plan_status_idx
  on public.payment_records(plan_code, status, created_at desc);
