-- Link each successful PayPal payment to exactly one membership.
alter table public.payment_records
  add column if not exists membership_id uuid references public.memberships(id);

create unique index if not exists payment_records_membership_id_uidx
  on public.payment_records(membership_id) where membership_id is not null;

-- The verified webhook calls this function only after checking PayPal's signature,
-- order ID, amount and currency. Row locking makes repeated deliveries idempotent.
create or replace function public.complete_paypal_membership_payment(
  p_payment_id uuid,
  p_capture_id text
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

  select * into payment_row
  from public.payment_records
  where id = p_payment_id and provider = 'paypal'
  for update;

  if not found then
    raise exception 'PayPal payment record not found';
  end if;
  if payment_row.plan_code is null
     or payment_row.membership_period_days is null
     or payment_row.membership_period_days < 1 then
    raise exception 'Payment has no approved membership terms';
  end if;

  if payment_row.membership_id is not null then
    return payment_row.membership_id;
  end if;

  if payment_row.status not in ('pending','created','completed') then
    raise exception 'Payment is not eligible for membership activation';
  end if;

  membership_end := now() + make_interval(days => payment_row.membership_period_days);
  insert into public.memberships (
    user_id, plan_code, status, provider, current_period_start, current_period_end
  ) values (
    payment_row.user_id, payment_row.plan_code, 'active', 'paypal', now(), membership_end
  ) returning * into membership_row;

  update public.payment_records
  set status = 'completed',
      verified_at = now(),
      provider_capture_id = coalesce(p_capture_id, provider_capture_id),
      membership_id = membership_row.id
  where id = payment_row.id;

  return membership_row.id;
end;
$$;

revoke all on function public.complete_paypal_membership_payment(uuid,text) from public, anon, authenticated;
grant execute on function public.complete_paypal_membership_payment(uuid,text) to service_role;
