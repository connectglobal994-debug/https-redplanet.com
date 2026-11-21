-- Add Flutterwave as a hosted-checkout provider for supported local and international
-- payment channels. The provider still requires merchant KYC, server secrets and testing.
alter table public.memberships drop constraint if exists memberships_provider_check;
alter table public.memberships add constraint memberships_provider_check
  check (provider in ('paypal','flutterwave','mpesa','card','bank_transfer','wise','manual','other'));

alter table public.payment_records drop constraint if exists payment_records_provider_check;
alter table public.payment_records add constraint payment_records_provider_check
  check (provider in ('paypal','flutterwave','mpesa','card','bank_transfer','wise','manual','other'));

alter table public.payment_webhook_events drop constraint if exists payment_webhook_events_provider_check;
alter table public.payment_webhook_events add constraint payment_webhook_events_provider_check
  check (provider in ('paypal','flutterwave','mpesa','card','bank_transfer','wise','manual','other'));

create or replace function public.complete_verified_provider_membership_payment(
  p_payment_id uuid,
  p_capture_id text,
  p_provider text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  payment_row public.payment_records%rowtype;
  membership_row public.memberships%rowtype;
  membership_end timestamptz;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Service role required';
  end if;
  if p_provider not in ('flutterwave','mpesa','card','bank_transfer','wise','manual','other') then
    raise exception 'Unsupported provider for shared activation';
  end if;
  select * into payment_row
  from public.payment_records
  where id = p_payment_id and provider = p_provider
  for update;
  if not found then raise exception 'Verified provider payment record not found'; end if;
  if payment_row.plan_code is null or payment_row.membership_period_days is null
     or payment_row.membership_period_days < 1 then
    raise exception 'Payment has no approved membership terms';
  end if;
  if payment_row.membership_id is not null then return payment_row.membership_id; end if;
  if payment_row.status not in ('pending','created','completed') then
    raise exception 'Payment is not eligible for membership activation';
  end if;
  membership_end := now() + make_interval(days => payment_row.membership_period_days);
  insert into public.memberships (
    user_id, plan_code, status, provider, current_period_start, current_period_end
  ) values (
    payment_row.user_id, payment_row.plan_code, 'active', p_provider, now(), membership_end
  ) returning * into membership_row;
  update public.payment_records
  set status = 'completed', verified_at = now(),
      provider_capture_id = coalesce(p_capture_id, provider_capture_id),
      membership_id = membership_row.id
  where id = payment_row.id;
  return membership_row.id;
end;
$$;
revoke all on function public.complete_verified_provider_membership_payment(uuid,text,text)
  from public, anon, authenticated;
grant execute on function public.complete_verified_provider_membership_payment(uuid,text,text)
  to service_role;
