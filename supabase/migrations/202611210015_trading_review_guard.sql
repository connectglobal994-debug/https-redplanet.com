-- Keep trading request review metadata server-controlled and gate successful connection approval.
create or replace function public.guard_trading_connection_review()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  is_admin boolean;
  is_staff boolean;
begin
  is_admin := public.has_redplanet_role(array['administrator']);
  is_staff := public.has_redplanet_role(array['administrator','editor','moderator']);
  if not is_staff then
    raise exception 'Only authorized staff can review trading connection requests';
  end if;
  if new.user_id is distinct from old.user_id
     or new.provider is distinct from old.provider
     or new.broker_name is distinct from old.broker_name
     or new.broker_server is distinct from old.broker_server
     or new.requested_environment is distinct from old.requested_environment
     or new.notes is distinct from old.notes
     or new.created_at is distinct from old.created_at then
    raise exception 'Connection request details cannot be changed during review';
  end if;
  if new.status = 'connected' and not is_admin then
    raise exception 'Only administrators can mark a broker connection as connected';
  end if;
  if new.status is distinct from old.status
     or new.staff_notes is distinct from old.staff_notes
     or new.assigned_to is distinct from old.assigned_to then
    new.reviewed_at := now();
    new.reviewed_by := (select auth.uid());
  end if;
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists guard_trading_connection_review on public.trading_connection_requests;
create trigger guard_trading_connection_review
before update on public.trading_connection_requests
for each row execute function public.guard_trading_connection_review();
revoke all on function public.guard_trading_connection_review() from public, anon;
grant execute on function public.guard_trading_connection_review() to authenticated;
