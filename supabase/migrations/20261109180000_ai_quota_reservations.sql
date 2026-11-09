-- AI quota is reserved atomically before the provider is called.
--
-- Additive: one nullable column, a widened check constraint and two service-role-only functions.
-- Rollback: docs/OPERATIONS.md, "Откат миграции 20261110090000".

alter table public.ai_usage add column if not exists finished_at timestamptz;

alter table public.ai_usage drop constraint if exists ai_usage_outcome_check;
alter table public.ai_usage add constraint ai_usage_outcome_check
  check (outcome in ('reserved', 'ok', 'invalid_output', 'provider_error', 'timeout'));

-- Every reservation counts towards the daily limits, whatever its final outcome. A reservation that
-- is never finished (crash, accounting failure) stays 'reserved' and keeps counting: the budget
-- errs on the side of fewer provider calls.
create or replace function public.reserve_ai_call(
  p_user_id uuid,
  p_kind text,
  p_daily_per_user integer,
  p_daily_global integer
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day_start timestamptz := date_trunc('day', now(), 'UTC');
  v_id bigint;
begin
  if p_user_id is null or p_daily_per_user is null or p_daily_global is null
     or p_daily_per_user < 1 or p_daily_global < 1 then
    raise exception 'invalid_quota' using errcode = '22023';
  end if;

  -- Serialises reservations so concurrent requests cannot all pass the count. Held until commit.
  perform pg_advisory_xact_lock(hashtextextended('public.ai_usage.quota', 0));

  if (select count(*) from public.ai_usage where created_at >= v_day_start) >= p_daily_global then
    return null;
  end if;
  if (select count(*) from public.ai_usage where user_id = p_user_id and created_at >= v_day_start) >= p_daily_per_user then
    return null;
  end if;

  insert into public.ai_usage (user_id, kind, outcome)
  values (p_user_id, p_kind, 'reserved')
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.finish_ai_call(
  p_id bigint,
  p_outcome text,
  p_input_tokens integer,
  p_output_tokens integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_outcome is null or p_outcome = 'reserved' then
    raise exception 'invalid_outcome' using errcode = '22023';
  end if;
  update public.ai_usage
     set outcome = p_outcome,
         input_tokens = least(greatest(coalesce(p_input_tokens, 0), 0), 1000000),
         output_tokens = least(greatest(coalesce(p_output_tokens, 0), 0), 1000000),
         finished_at = now()
   where id = p_id
     and outcome = 'reserved';
  return found;
end;
$$;

revoke all on function public.reserve_ai_call(uuid, text, integer, integer) from public, anon, authenticated;
revoke all on function public.finish_ai_call(bigint, text, integer, integer) from public, anon, authenticated;
grant execute on function public.reserve_ai_call(uuid, text, integer, integer) to service_role;
grant execute on function public.finish_ai_call(bigint, text, integer, integer) to service_role;
