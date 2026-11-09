-- Niche Discovery: personal projects, versioned hypotheses, step gates and PRO entitlements.
--
-- Security model
--   * Every personal row carries owner_id and is linked to its project through a composite
--     foreign key (startup_id, owner_id), so a child row can never point at someone else's project.
--   * Row level security limits SELECT to owner_id = auth.uid().
--   * The authenticated role has no INSERT/UPDATE/DELETE privileges on these tables. All writes go
--     through the SECURITY DEFINER functions below, each of which checks auth.uid() explicitly.
--   * Nothing is deleted by the application: projects are archived, hypotheses are superseded.
--
-- Rollback: see docs/OPERATIONS.md ("Откат миграции 20261109100000").

-- ---------------------------------------------------------------------------------------------
-- Catalog of journey steps (content lives in lib/steps.ts; gating rules live here)
-- ---------------------------------------------------------------------------------------------

create table public.journey_steps (
  step_id text primary key,
  spec_version integer not null default 1,
  stage integer not null,
  requires_approved_hypothesis boolean not null default true,
  requires_pro boolean not null default false,
  required_fields text[] not null default '{}',
  depends_on_hypothesis boolean not null default true
);

insert into public.journey_steps (step_id, stage, requires_approved_hypothesis, requires_pro, required_fields) values
  ('demand-check', 0, true, false, array['method', 'plannedCount', 'conductedCount', 'signals', 'decision']),
  ('business-recon', 1, true, false, array['result']),
  ('offer-packaging', 2, true, true, array['result']),
  ('content-boost', 3, true, true, array['result']),
  ('contact-scripts', 4, true, true, array['result']),
  ('objection-battle', 5, true, true, array['result']),
  ('quiz-lead', 6, true, true, array['result']),
  ('landing-route', 7, true, true, array['result']),
  ('market-signals', 8, true, true, array['result']),
  ('launch-check', 9, true, true, array['result']);

-- ---------------------------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------------------------

create table public.startups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  entry_mode text not null check (entry_mode in ('own_idea', 'catalog', 'advisor', 'existing_business')),
  niche_id text check (niche_id is null or niche_id ~ '^[a-z0-9-]{1,40}$'),
  business_model text check (business_model in ('services', 'commerce', 'made_to_order')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, owner_id)
);

create index startups_owner_created_idx on public.startups (owner_id, created_at desc);

create table public.startup_profiles (
  startup_id uuid primary key,
  owner_id uuid not null,
  budget_amount numeric(14, 2) check (budget_amount is null or budget_amount >= 0),
  budget_currency text check (budget_currency is null or budget_currency ~ '^[A-Z]{3}$'),
  region text not null default '' check (char_length(region) <= 200),
  skills text not null default '' check (char_length(skills) <= 1000),
  time_per_week text not null default '' check (char_length(time_per_week) <= 100),
  interests text not null default '' check (char_length(interests) <= 1000),
  constraints text not null default '' check (char_length(constraints) <= 1000),
  goal text not null default '' check (char_length(goal) <= 500),
  unknown_fields text[] not null default '{}',
  confirmed_at timestamptz,
  updated_at timestamptz not null default now(),
  foreign key (startup_id, owner_id) references public.startups (id, owner_id) on delete cascade
);

create table public.startup_hypotheses (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null,
  owner_id uuid not null,
  version integer not null check (version >= 1),
  status text not null check (status in ('draft', 'awaiting_confirmation', 'approved_by_user', 'superseded')),
  based_on_version integer,
  idea_text text not null default '' check (char_length(idea_text) <= 2000),
  niche_id text check (niche_id is null or niche_id ~ '^[a-z0-9-]{1,40}$'),
  business_model text check (business_model in ('services', 'commerce', 'made_to_order')),
  target_customer text not null default '' check (char_length(target_customer) <= 1000),
  customer_problem text not null default '' check (char_length(customer_problem) <= 1000),
  proposed_value text not null default '' check (char_length(proposed_value) <= 1000),
  revenue_model text not null default '' check (char_length(revenue_model) <= 1000),
  startup_budget_amount numeric(14, 2) check (startup_budget_amount is null or startup_budget_amount >= 0),
  startup_budget_currency text check (startup_budget_currency is null or startup_budget_currency ~ '^[A-Z]{3}$'),
  constraints text not null default '' check (char_length(constraints) <= 1000),
  industry_notes text not null default '' check (char_length(industry_notes) <= 2000),
  key_assumptions jsonb not null default '[]'::jsonb check (jsonb_typeof(key_assumptions) = 'array'),
  key_risks jsonb not null default '[]'::jsonb check (jsonb_typeof(key_risks) = 'array'),
  market_evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(market_evidence) = 'array'),
  validation_plan jsonb not null default '{}'::jsonb check (jsonb_typeof(validation_plan) = 'object'),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (startup_id, version),
  check ((status = 'approved_by_user') = (approved_at is not null) or status = 'superseded'),
  foreign key (startup_id, owner_id) references public.startups (id, owner_id) on delete cascade
);

create unique index startup_hypotheses_one_open_idx
  on public.startup_hypotheses (startup_id) where status in ('draft', 'awaiting_confirmation');
create unique index startup_hypotheses_one_approved_idx
  on public.startup_hypotheses (startup_id) where status = 'approved_by_user';

create table public.startup_step_progress (
  startup_id uuid not null,
  owner_id uuid not null,
  step_id text not null references public.journey_steps (step_id),
  spec_version integer not null default 1,
  status text not null check (status in ('locked', 'active', 'submitted', 'needs_revision', 'completed')),
  hypothesis_version integer,
  requires_review boolean not null default false,
  review_reason text,
  missing_fields text[] not null default '{}',
  confirmed_by_user_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (startup_id, step_id),
  foreign key (startup_id, owner_id) references public.startups (id, owner_id) on delete cascade
);

create table public.startup_artifacts (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null,
  owner_id uuid not null,
  step_id text not null references public.journey_steps (step_id),
  content jsonb not null check (jsonb_typeof(content) = 'object' and octet_length(content::text) <= 32768),
  revision integer not null default 1,
  hypothesis_version integer,
  review_status text not null default 'current' check (review_status in ('current', 'requires_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (startup_id, step_id),
  foreign key (startup_id, owner_id) references public.startups (id, owner_id) on delete cascade
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  owner_id uuid references auth.users (id) on delete set null,
  startup_id uuid references public.startups (id) on delete set null,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_owner_idx on public.audit_events (owner_id, created_at desc);

-- ---------------------------------------------------------------------------------------------
-- PRO entitlements (individual, replace the shared PRO code)
-- ---------------------------------------------------------------------------------------------

alter table public.access_codes
  add column if not exists plan text not null default 'pro' check (plan in ('pro')),
  add column if not exists max_uses integer not null default 1 check (max_uses >= 1),
  add column if not exists use_count integer not null default 0 check (use_count >= 0),
  add column if not exists entitlement_days integer check (entitlement_days is null or entitlement_days > 0),
  add column if not exists note text;

create unique index if not exists access_codes_code_hash_idx on public.access_codes (code_hash);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null check (plan in ('pro')),
  source text not null check (source in ('access_code', 'manual')),
  access_code_id uuid references public.access_codes (id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoke_reason text
);

create index entitlements_user_idx on public.entitlements (user_id);
create unique index entitlements_one_per_code_user_idx on public.entitlements (user_id, access_code_id)
  where access_code_id is not null;

-- ---------------------------------------------------------------------------------------------
-- Submissions: idempotency for retries; AI usage accounting
-- ---------------------------------------------------------------------------------------------

alter table public.leads add column if not exists idempotency_key uuid;
alter table public.partners add column if not exists idempotency_key uuid;
alter table public.feedback add column if not exists idempotency_key uuid;
create unique index if not exists leads_idempotency_idx on public.leads (idempotency_key);
create unique index if not exists partners_idempotency_idx on public.partners (idempotency_key);
create unique index if not exists feedback_idempotency_idx on public.feedback (idempotency_key);

create table public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  kind text not null check (kind in ('advisor')),
  outcome text not null check (outcome in ('ok', 'invalid_output', 'provider_error', 'timeout')),
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  created_at timestamptz not null default now()
);

create index ai_usage_user_day_idx on public.ai_usage (user_id, created_at desc);
create index ai_usage_day_idx on public.ai_usage (created_at desc);

-- ---------------------------------------------------------------------------------------------
-- Privileges and row level security
-- ---------------------------------------------------------------------------------------------

alter table public.journey_steps enable row level security;
alter table public.startups enable row level security;
alter table public.startup_profiles enable row level security;
alter table public.startup_hypotheses enable row level security;
alter table public.startup_step_progress enable row level security;
alter table public.startup_artifacts enable row level security;
alter table public.audit_events enable row level security;
alter table public.entitlements enable row level security;
alter table public.ai_usage enable row level security;

revoke all on public.journey_steps, public.startups, public.startup_profiles, public.startup_hypotheses,
  public.startup_step_progress, public.startup_artifacts, public.audit_events, public.entitlements,
  public.ai_usage from anon, authenticated;

grant select on public.journey_steps, public.startups, public.startup_profiles, public.startup_hypotheses,
  public.startup_step_progress, public.startup_artifacts, public.audit_events, public.entitlements
  to authenticated;

create policy journey_steps_read on public.journey_steps for select to authenticated using (true);
create policy startups_owner_read on public.startups for select to authenticated
  using (owner_id = (select auth.uid()));
create policy startup_profiles_owner_read on public.startup_profiles for select to authenticated
  using (owner_id = (select auth.uid()));
create policy startup_hypotheses_owner_read on public.startup_hypotheses for select to authenticated
  using (owner_id = (select auth.uid()));
create policy startup_step_progress_owner_read on public.startup_step_progress for select to authenticated
  using (owner_id = (select auth.uid()));
create policy startup_artifacts_owner_read on public.startup_artifacts for select to authenticated
  using (owner_id = (select auth.uid()));
create policy audit_events_owner_read on public.audit_events for select to authenticated
  using (owner_id = (select auth.uid()));
create policy entitlements_owner_read on public.entitlements for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------------------------

create or replace function public._require_user()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  return v_uid;
end;
$$;

create or replace function public._owned_startup(p_startup_id uuid)
returns public.startups
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_row public.startups;
begin
  select * into v_row from public.startups
  where id = p_startup_id and owner_id = public._require_user() and status = 'active';
  if not found then
    -- Same error for "missing" and "someone else's" so ids cannot be probed.
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  return v_row;
end;
$$;

create or replace function public.has_active_pro(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = p_user_id
      and e.plan = 'pro'
      and e.revoked_at is null
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

create or replace function public._text_field(p jsonb, k text, max_len integer)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v text := coalesce(btrim(p ->> k), '');
begin
  if char_length(v) > max_len then
    raise exception 'field_too_long:%', k using errcode = '22001';
  end if;
  return v;
end;
$$;

create or replace function public._text_list(p jsonb, k text, max_items integer)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  v jsonb := coalesce(p -> k, '[]'::jsonb);
begin
  if jsonb_typeof(v) <> 'array' then
    raise exception 'invalid_list:%', k using errcode = '22023';
  end if;
  if jsonb_array_length(v) > max_items then
    raise exception 'too_many_items:%', k using errcode = '22023';
  end if;
  return v;
end;
$$;

create or replace function public._hypothesis_missing_fields(h public.startup_hypotheses)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array_remove(array[
    case when h.business_model is null then 'businessModel' end,
    case when btrim(h.target_customer) = '' then 'targetCustomer' end,
    case when btrim(h.customer_problem) = '' then 'customerProblem' end,
    case when btrim(h.proposed_value) = '' then 'proposedValue' end,
    case when btrim(h.revenue_model) = '' then 'revenueModel' end,
    case when jsonb_array_length(h.key_assumptions) = 0 then 'keyAssumptions' end,
    case when coalesce(h.validation_plan ->> 'method', '') = '' then 'validationPlan.method' end,
    case when coalesce(btrim(h.validation_plan ->> 'audience'), '') = '' then 'validationPlan.audience' end,
    case when coalesce((h.validation_plan ->> 'targetCount')::numeric, 0) <= 0 then 'validationPlan.targetCount' end,
    case when coalesce(btrim(h.validation_plan ->> 'successSignal'), '') = '' then 'validationPlan.successSignal' end
  ], null);
$$;

-- Material = changes that invalidate work built on the previous approved version.
create or replace function public._hypothesis_change_kind(prev public.startup_hypotheses, next public.startup_hypotheses)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when prev.id is null then 'initial'
    when prev.business_model is distinct from next.business_model
      or prev.niche_id is distinct from next.niche_id
      or btrim(prev.target_customer) is distinct from btrim(next.target_customer)
      or btrim(prev.customer_problem) is distinct from btrim(next.customer_problem)
      or btrim(prev.proposed_value) is distinct from btrim(next.proposed_value)
      or btrim(prev.revenue_model) is distinct from btrim(next.revenue_model)
      or prev.key_assumptions is distinct from next.key_assumptions
      then 'material'
    when prev.validation_plan is distinct from next.validation_plan then 'validation_plan'
    else 'minor'
  end;
$$;

create or replace function public._apply_hypothesis_fields(h public.startup_hypotheses, p jsonb)
returns public.startup_hypotheses
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_model text;
  v_niche text;
  v_amount numeric;
  v_currency text;
  v_plan jsonb;
begin
  if p ? 'ideaText' then h.idea_text := public._text_field(p, 'ideaText', 2000); end if;
  if p ? 'nicheId' then
    v_niche := nullif(btrim(coalesce(p ->> 'nicheId', '')), '');
    h.niche_id := v_niche;
  end if;
  if p ? 'businessModel' then
    v_model := nullif(btrim(coalesce(p ->> 'businessModel', '')), '');
    if v_model is not null and v_model not in ('services', 'commerce', 'made_to_order') then
      raise exception 'invalid_business_model' using errcode = '22023';
    end if;
    h.business_model := v_model;
  end if;
  if p ? 'targetCustomer' then h.target_customer := public._text_field(p, 'targetCustomer', 1000); end if;
  if p ? 'customerProblem' then h.customer_problem := public._text_field(p, 'customerProblem', 1000); end if;
  if p ? 'proposedValue' then h.proposed_value := public._text_field(p, 'proposedValue', 1000); end if;
  if p ? 'revenueModel' then h.revenue_model := public._text_field(p, 'revenueModel', 1000); end if;
  if p ? 'constraints' then h.constraints := public._text_field(p, 'constraints', 1000); end if;
  if p ? 'industryNotes' then h.industry_notes := public._text_field(p, 'industryNotes', 2000); end if;
  if p ? 'budget' then
    v_amount := nullif(p -> 'budget' ->> 'amount', '')::numeric;
    v_currency := nullif(upper(btrim(coalesce(p -> 'budget' ->> 'currency', ''))), '');
    h.startup_budget_amount := v_amount;
    h.startup_budget_currency := v_currency;
  end if;
  if p ? 'keyAssumptions' then h.key_assumptions := public._text_list(p, 'keyAssumptions', 12); end if;
  if p ? 'keyRisks' then h.key_risks := public._text_list(p, 'keyRisks', 12); end if;
  if p ? 'marketEvidence' then h.market_evidence := public._text_list(p, 'marketEvidence', 12); end if;
  if p ? 'validationPlan' then
    v_plan := p -> 'validationPlan';
    if jsonb_typeof(v_plan) <> 'object' or octet_length(v_plan::text) > 4000 then
      raise exception 'invalid_validation_plan' using errcode = '22023';
    end if;
    h.validation_plan := v_plan;
  end if;
  return h;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Write API (the only mutation surface for the authenticated role)
-- ---------------------------------------------------------------------------------------------

create or replace function public.create_startup(
  p_title text,
  p_entry_mode text,
  p_profile jsonb default '{}'::jsonb,
  p_hypothesis jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public._require_user();
  v_startup public.startups;
  v_h public.startup_hypotheses;
  v_count integer;
begin
  select count(*) into v_count from public.startups where owner_id = v_uid and status = 'active';
  if v_count >= 25 then
    raise exception 'too_many_projects' using errcode = '54000';
  end if;

  insert into public.startups (owner_id, title, entry_mode)
  values (v_uid, btrim(coalesce(p_title, '')), p_entry_mode)
  returning * into v_startup;

  perform public._write_profile(v_startup.id, v_uid, coalesce(p_profile, '{}'::jsonb));

  v_h.startup_id := v_startup.id;
  v_h.owner_id := v_uid;
  v_h.version := 1;
  v_h.status := 'draft';
  v_h.idea_text := '';
  v_h.target_customer := '';
  v_h.customer_problem := '';
  v_h.proposed_value := '';
  v_h.revenue_model := '';
  v_h.constraints := '';
  v_h.industry_notes := '';
  v_h.key_assumptions := '[]'::jsonb;
  v_h.key_risks := '[]'::jsonb;
  v_h.market_evidence := '[]'::jsonb;
  v_h.validation_plan := '{}'::jsonb;
  v_h := public._apply_hypothesis_fields(v_h, coalesce(p_hypothesis, '{}'::jsonb));

  insert into public.startup_hypotheses (
    startup_id, owner_id, version, status, idea_text, niche_id, business_model, target_customer,
    customer_problem, proposed_value, revenue_model, startup_budget_amount, startup_budget_currency,
    constraints, industry_notes, key_assumptions, key_risks, market_evidence, validation_plan
  ) values (
    v_h.startup_id, v_h.owner_id, 1, 'draft', v_h.idea_text, v_h.niche_id, v_h.business_model,
    v_h.target_customer, v_h.customer_problem, v_h.proposed_value, v_h.revenue_model,
    v_h.startup_budget_amount, v_h.startup_budget_currency, v_h.constraints, v_h.industry_notes,
    v_h.key_assumptions, v_h.key_risks, v_h.market_evidence, v_h.validation_plan
  );

  update public.startups set niche_id = v_h.niche_id, business_model = v_h.business_model
  where id = v_startup.id;

  insert into public.audit_events (owner_id, startup_id, action, detail)
  values (v_uid, v_startup.id, 'startup.created', jsonb_build_object('entry_mode', p_entry_mode));

  return v_startup.id;
end;
$$;

create or replace function public._write_profile(p_startup_id uuid, p_owner uuid, p jsonb)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_unknown text[];
begin
  select coalesce(array_agg(value), '{}') into v_unknown
  from jsonb_array_elements_text(coalesce(p -> 'unknownFields', '[]'::jsonb)) as value
  where value in ('budget', 'region', 'skills', 'timePerWeek', 'interests', 'constraints', 'goal');

  insert into public.startup_profiles as sp (
    startup_id, owner_id, budget_amount, budget_currency, region, skills, time_per_week, interests,
    constraints, goal, unknown_fields, confirmed_at, updated_at
  ) values (
    p_startup_id, p_owner,
    nullif(p ->> 'budgetAmount', '')::numeric,
    nullif(upper(btrim(coalesce(p ->> 'budgetCurrency', ''))), ''),
    public._text_field(p, 'region', 200),
    public._text_field(p, 'skills', 1000),
    public._text_field(p, 'timePerWeek', 100),
    public._text_field(p, 'interests', 1000),
    public._text_field(p, 'constraints', 1000),
    public._text_field(p, 'goal', 500),
    v_unknown,
    case when coalesce((p ->> 'confirmed')::boolean, false) then now() end,
    now()
  )
  on conflict (startup_id) do update set
    budget_amount = excluded.budget_amount,
    budget_currency = excluded.budget_currency,
    region = excluded.region,
    skills = excluded.skills,
    time_per_week = excluded.time_per_week,
    interests = excluded.interests,
    constraints = excluded.constraints,
    goal = excluded.goal,
    unknown_fields = excluded.unknown_fields,
    confirmed_at = coalesce(excluded.confirmed_at, sp.confirmed_at),
    updated_at = now();
end;
$$;

create or replace function public.update_startup_profile(p_startup_id uuid, p_profile jsonb)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_startup public.startups := public._owned_startup(p_startup_id);
begin
  perform public._write_profile(v_startup.id, v_startup.owner_id, coalesce(p_profile, '{}'::jsonb));
  insert into public.audit_events (owner_id, startup_id, action) values (v_startup.owner_id, v_startup.id, 'profile.updated');
end;
$$;

-- Saves the open draft, or opens a new draft version based on the approved one.
-- p_expected_updated_at protects against two tabs overwriting each other.
create or replace function public.save_hypothesis_draft(
  p_startup_id uuid,
  p_fields jsonb,
  p_expected_updated_at timestamptz default null
)
returns public.startup_hypotheses
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_startup public.startups := public._owned_startup(p_startup_id);
  v_open public.startup_hypotheses;
  v_approved public.startup_hypotheses;
  v_next_version integer;
begin
  select * into v_open from public.startup_hypotheses
  where startup_id = v_startup.id and status in ('draft', 'awaiting_confirmation')
  for update;

  if found then
    if p_expected_updated_at is not null and v_open.updated_at <> p_expected_updated_at then
      raise exception 'conflict' using errcode = '40001';
    end if;
    v_open := public._apply_hypothesis_fields(v_open, coalesce(p_fields, '{}'::jsonb));
    update public.startup_hypotheses set
      status = 'draft',
      idea_text = v_open.idea_text, niche_id = v_open.niche_id, business_model = v_open.business_model,
      target_customer = v_open.target_customer, customer_problem = v_open.customer_problem,
      proposed_value = v_open.proposed_value, revenue_model = v_open.revenue_model,
      startup_budget_amount = v_open.startup_budget_amount, startup_budget_currency = v_open.startup_budget_currency,
      constraints = v_open.constraints, industry_notes = v_open.industry_notes,
      key_assumptions = v_open.key_assumptions, key_risks = v_open.key_risks,
      market_evidence = v_open.market_evidence, validation_plan = v_open.validation_plan,
      updated_at = clock_timestamp()
    where id = v_open.id
    returning * into v_open;
    return v_open;
  end if;

  select * into v_approved from public.startup_hypotheses
  where startup_id = v_startup.id and status = 'approved_by_user';
  if not found then
    raise exception 'no_hypothesis' using errcode = 'P0002';
  end if;
  if p_expected_updated_at is not null and v_approved.updated_at <> p_expected_updated_at then
    raise exception 'conflict' using errcode = '40001';
  end if;

  select max(version) + 1 into v_next_version from public.startup_hypotheses where startup_id = v_startup.id;

  v_open := v_approved;
  v_open.id := gen_random_uuid();
  v_open := public._apply_hypothesis_fields(v_open, coalesce(p_fields, '{}'::jsonb));

  insert into public.startup_hypotheses (
    id, startup_id, owner_id, version, status, based_on_version, idea_text, niche_id, business_model,
    target_customer, customer_problem, proposed_value, revenue_model, startup_budget_amount,
    startup_budget_currency, constraints, industry_notes, key_assumptions, key_risks, market_evidence,
    validation_plan
  ) values (
    v_open.id, v_startup.id, v_startup.owner_id, v_next_version, 'draft', v_approved.version,
    v_open.idea_text, v_open.niche_id, v_open.business_model, v_open.target_customer,
    v_open.customer_problem, v_open.proposed_value, v_open.revenue_model, v_open.startup_budget_amount,
    v_open.startup_budget_currency, v_open.constraints, v_open.industry_notes, v_open.key_assumptions,
    v_open.key_risks, v_open.market_evidence, v_open.validation_plan
  )
  returning * into v_open;

  insert into public.audit_events (owner_id, startup_id, action, detail)
  values (v_startup.owner_id, v_startup.id, 'hypothesis.revision_started', jsonb_build_object('version', v_next_version));

  return v_open;
end;
$$;

-- Discards an unapproved revision of an already approved hypothesis (version 1 drafts stay).
create or replace function public.discard_hypothesis_revision(p_startup_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_startup public.startups := public._owned_startup(p_startup_id);
  v_open public.startup_hypotheses;
begin
  select * into v_open from public.startup_hypotheses
  where startup_id = v_startup.id and status in ('draft', 'awaiting_confirmation');
  if not found or v_open.based_on_version is null then
    raise exception 'nothing_to_discard' using errcode = 'P0002';
  end if;
  update public.startup_hypotheses set status = 'superseded', updated_at = clock_timestamp() where id = v_open.id;
  insert into public.audit_events (owner_id, startup_id, action, detail)
  values (v_startup.owner_id, v_startup.id, 'hypothesis.revision_discarded', jsonb_build_object('version', v_open.version));
end;
$$;

create or replace function public.request_hypothesis_confirmation(p_hypothesis_id uuid)
returns text[]
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public._require_user();
  v_h public.startup_hypotheses;
  v_missing text[];
begin
  select h.* into v_h from public.startup_hypotheses h
  join public.startups s on s.id = h.startup_id and s.owner_id = h.owner_id
  where h.id = p_hypothesis_id and h.owner_id = v_uid and s.status = 'active'
  for update of h;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if v_h.status not in ('draft', 'awaiting_confirmation') then
    raise exception 'invalid_status' using errcode = '22023';
  end if;
  v_missing := public._hypothesis_missing_fields(v_h);
  if cardinality(v_missing) = 0 then
    update public.startup_hypotheses set status = 'awaiting_confirmation', updated_at = clock_timestamp()
    where id = v_h.id;
  end if;
  return v_missing;
end;
$$;

-- The user's explicit confirmation. Not a claim that demand exists.
create or replace function public.approve_hypothesis(p_hypothesis_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public._require_user();
  v_h public.startup_hypotheses;
  v_prev public.startup_hypotheses;
  v_kind text;
  v_flagged integer := 0;
begin
  select h.* into v_h from public.startup_hypotheses h
  join public.startups s on s.id = h.startup_id and s.owner_id = h.owner_id
  where h.id = p_hypothesis_id and h.owner_id = v_uid and s.status = 'active'
  for update of h;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if v_h.status <> 'awaiting_confirmation' then
    raise exception 'invalid_status' using errcode = '22023';
  end if;
  if cardinality(public._hypothesis_missing_fields(v_h)) > 0 then
    raise exception 'incomplete_hypothesis' using errcode = '22023';
  end if;

  select * into v_prev from public.startup_hypotheses
  where startup_id = v_h.startup_id and status = 'approved_by_user'
  for update;

  v_kind := public._hypothesis_change_kind(v_prev, v_h);

  if v_prev.id is not null then
    update public.startup_hypotheses set status = 'superseded', updated_at = clock_timestamp() where id = v_prev.id;
  end if;

  update public.startup_hypotheses
  set status = 'approved_by_user', approved_at = clock_timestamp(), updated_at = clock_timestamp()
  where id = v_h.id;

  update public.startups
  set niche_id = v_h.niche_id, business_model = v_h.business_model, updated_at = now()
  where id = v_h.startup_id;

  if v_kind = 'material' then
    update public.startup_artifacts a set review_status = 'requires_review', updated_at = now()
    from public.journey_steps js
    where a.startup_id = v_h.startup_id and js.step_id = a.step_id and js.depends_on_hypothesis
      and coalesce(a.hypothesis_version, 0) < v_h.version;
    get diagnostics v_flagged = row_count;
    update public.startup_step_progress p
    set requires_review = true,
        review_reason = format('Гипотеза изменена: версия %s', v_h.version),
        updated_at = now()
    where p.startup_id = v_h.startup_id and p.status <> 'locked'
      and coalesce(p.hypothesis_version, 0) < v_h.version;
  elsif v_kind = 'validation_plan' then
    update public.startup_artifacts set review_status = 'requires_review', updated_at = now()
    where startup_id = v_h.startup_id and step_id = 'demand-check'
      and coalesce(hypothesis_version, 0) < v_h.version;
    get diagnostics v_flagged = row_count;
    update public.startup_step_progress
    set requires_review = true, review_reason = format('План проверки изменён: версия %s', v_h.version), updated_at = now()
    where startup_id = v_h.startup_id and step_id = 'demand-check' and status <> 'locked';
  end if;

  insert into public.startup_step_progress (startup_id, owner_id, step_id, status, hypothesis_version)
  values (v_h.startup_id, v_uid, 'demand-check', 'active', v_h.version)
  on conflict (startup_id, step_id) do nothing;

  insert into public.audit_events (owner_id, startup_id, action, detail)
  values (v_uid, v_h.startup_id, 'hypothesis.approved',
    jsonb_build_object('version', v_h.version, 'change', v_kind, 'flagged_artifacts', v_flagged));

  return jsonb_build_object('version', v_h.version, 'change', v_kind, 'flagged_artifacts', v_flagged);
end;
$$;

create or replace function public._step_gate(v_startup public.startups, v_step public.journey_steps)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if v_step.requires_approved_hypothesis and v_startup.entry_mode <> 'existing_business' and not exists (
    select 1 from public.startup_hypotheses
    where startup_id = v_startup.id and status = 'approved_by_user'
  ) then
    raise exception 'hypothesis_not_approved' using errcode = '42501';
  end if;
  if v_step.requires_pro and not public.has_active_pro(v_startup.owner_id) then
    raise exception 'pro_required' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.save_step_result(
  p_startup_id uuid,
  p_step_id text,
  p_content jsonb,
  p_expected_revision integer default null
)
returns public.startup_artifacts
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_startup public.startups := public._owned_startup(p_startup_id);
  v_step public.journey_steps;
  v_artifact public.startup_artifacts;
  v_version integer;
begin
  select * into v_step from public.journey_steps where step_id = p_step_id;
  if not found then
    raise exception 'unknown_step' using errcode = 'P0002';
  end if;
  perform public._step_gate(v_startup, v_step);
  if p_content is null or jsonb_typeof(p_content) <> 'object' or octet_length(p_content::text) > 32768 then
    raise exception 'invalid_content' using errcode = '22023';
  end if;

  select version into v_version from public.startup_hypotheses
  where startup_id = v_startup.id and status = 'approved_by_user';

  select * into v_artifact from public.startup_artifacts
  where startup_id = v_startup.id and step_id = p_step_id
  for update;

  if found then
    if p_expected_revision is not null and v_artifact.revision <> p_expected_revision then
      raise exception 'conflict' using errcode = '40001';
    end if;
    update public.startup_artifacts set
      content = p_content,
      revision = v_artifact.revision + 1,
      hypothesis_version = v_version,
      review_status = 'current',
      updated_at = now()
    where id = v_artifact.id
    returning * into v_artifact;
  else
    if p_expected_revision is not null and p_expected_revision <> 0 then
      raise exception 'conflict' using errcode = '40001';
    end if;
    insert into public.startup_artifacts (startup_id, owner_id, step_id, content, hypothesis_version)
    values (v_startup.id, v_startup.owner_id, p_step_id, p_content, v_version)
    returning * into v_artifact;
  end if;

  insert into public.startup_step_progress as sp (startup_id, owner_id, step_id, spec_version, status, hypothesis_version)
  values (v_startup.id, v_startup.owner_id, p_step_id, v_step.spec_version, 'active', v_version)
  on conflict (startup_id, step_id) do update set
    status = case when sp.status in ('completed') then 'completed' else 'active' end,
    updated_at = now();

  return v_artifact;
end;
$$;

-- The user's confirmation of a step. Server-side check of required fields; no automatic approval.
create or replace function public.complete_step(p_startup_id uuid, p_step_id text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_startup public.startups := public._owned_startup(p_startup_id);
  v_step public.journey_steps;
  v_artifact public.startup_artifacts;
  v_missing text[];
  v_version integer;
begin
  select * into v_step from public.journey_steps where step_id = p_step_id;
  if not found then
    raise exception 'unknown_step' using errcode = 'P0002';
  end if;
  perform public._step_gate(v_startup, v_step);

  select * into v_artifact from public.startup_artifacts where startup_id = v_startup.id and step_id = p_step_id;

  select coalesce(array_agg(f), '{}') into v_missing
  from unnest(v_step.required_fields) as f
  where v_artifact.id is null
     or coalesce(btrim(v_artifact.content -> 'fields' ->> f), '') = '';

  select version into v_version from public.startup_hypotheses
  where startup_id = v_startup.id and status = 'approved_by_user';

  insert into public.startup_step_progress as sp (
    startup_id, owner_id, step_id, spec_version, status, hypothesis_version, missing_fields,
    confirmed_by_user_at, requires_review, review_reason
  ) values (
    v_startup.id, v_startup.owner_id, p_step_id, v_step.spec_version,
    case when cardinality(v_missing) = 0 then 'completed' else 'needs_revision' end,
    v_version, v_missing,
    case when cardinality(v_missing) = 0 then now() end,
    false, null
  )
  on conflict (startup_id, step_id) do update set
    status = excluded.status,
    hypothesis_version = excluded.hypothesis_version,
    missing_fields = excluded.missing_fields,
    confirmed_by_user_at = excluded.confirmed_by_user_at,
    requires_review = case when excluded.status = 'completed' then false else sp.requires_review end,
    review_reason = case when excluded.status = 'completed' then null else sp.review_reason end,
    updated_at = now();

  if cardinality(v_missing) = 0 then
    update public.startup_artifacts set review_status = 'current' where id = v_artifact.id;
    insert into public.audit_events (owner_id, startup_id, action, detail)
    values (v_startup.owner_id, v_startup.id, 'step.completed', jsonb_build_object('step', p_step_id));
  end if;

  return jsonb_build_object(
    'status', case when cardinality(v_missing) = 0 then 'completed' else 'needs_revision' end,
    'missing', to_jsonb(v_missing)
  );
end;
$$;

create or replace function public.archive_startup(p_startup_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_startup public.startups := public._owned_startup(p_startup_id);
begin
  update public.startups set status = 'archived', updated_at = now() where id = v_startup.id;
  insert into public.audit_events (owner_id, startup_id, action) values (v_startup.owner_id, v_startup.id, 'startup.archived');
end;
$$;

create or replace function public.rename_startup(p_startup_id uuid, p_title text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_startup public.startups := public._owned_startup(p_startup_id);
begin
  update public.startups set title = btrim(coalesce(p_title, '')), updated_at = now() where id = v_startup.id;
end;
$$;

-- Codes are stored as SHA-256 hex. A wrong code and an exhausted code return the same error.
create or replace function public.redeem_access_code(p_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public._require_user();
  v_code public.access_codes;
  v_expires timestamptz;
begin
  if p_code is null or char_length(btrim(p_code)) not between 8 and 128 then
    raise exception 'invalid_code' using errcode = '22023';
  end if;

  select * into v_code from public.access_codes
  where code_hash = encode(extensions.digest(btrim(p_code), 'sha256'), 'hex')
  for update;

  if not found or v_code.status <> 'active'
     or (v_code.expires_at is not null and v_code.expires_at <= now())
     or v_code.use_count >= v_code.max_uses then
    raise exception 'invalid_code' using errcode = '22023';
  end if;

  if exists (select 1 from public.entitlements where user_id = v_uid and access_code_id = v_code.id) then
    return jsonb_build_object('status', 'already_redeemed');
  end if;

  v_expires := case when v_code.entitlement_days is not null then now() + make_interval(days => v_code.entitlement_days) end;

  insert into public.entitlements (user_id, plan, source, access_code_id, expires_at)
  values (v_uid, v_code.plan, 'access_code', v_code.id, v_expires);

  update public.access_codes
  set use_count = use_count + 1,
      used_at = coalesce(used_at, now()),
      status = case when use_count + 1 >= max_uses then 'used' else status end
  where id = v_code.id;

  insert into public.audit_events (owner_id, action, detail)
  values (v_uid, 'entitlement.redeemed', jsonb_build_object('plan', v_code.plan));

  return jsonb_build_object('status', 'granted', 'expires_at', v_expires);
end;
$$;

-- Function privileges: helpers are private, the write API is for signed-in users only.
revoke all on function public._require_user() from public, anon, authenticated;
revoke all on function public._owned_startup(uuid) from public, anon, authenticated;
revoke all on function public._text_field(jsonb, text, integer) from public, anon, authenticated;
revoke all on function public._text_list(jsonb, text, integer) from public, anon, authenticated;
revoke all on function public._hypothesis_missing_fields(public.startup_hypotheses) from public, anon, authenticated;
revoke all on function public._hypothesis_change_kind(public.startup_hypotheses, public.startup_hypotheses) from public, anon, authenticated;
revoke all on function public._apply_hypothesis_fields(public.startup_hypotheses, jsonb) from public, anon, authenticated;
revoke all on function public._write_profile(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public._step_gate(public.startups, public.journey_steps) from public, anon, authenticated;
revoke all on function public.has_active_pro(uuid) from public, anon, authenticated;

revoke all on function public.create_startup(text, text, jsonb, jsonb) from public, anon;
revoke all on function public.update_startup_profile(uuid, jsonb) from public, anon;
revoke all on function public.save_hypothesis_draft(uuid, jsonb, timestamptz) from public, anon;
revoke all on function public.discard_hypothesis_revision(uuid) from public, anon;
revoke all on function public.request_hypothesis_confirmation(uuid) from public, anon;
revoke all on function public.approve_hypothesis(uuid) from public, anon;
revoke all on function public.save_step_result(uuid, text, jsonb, integer) from public, anon;
revoke all on function public.complete_step(uuid, text) from public, anon;
revoke all on function public.archive_startup(uuid) from public, anon;
revoke all on function public.rename_startup(uuid, text) from public, anon;
revoke all on function public.redeem_access_code(text) from public, anon;

grant execute on function public.create_startup(text, text, jsonb, jsonb) to authenticated;
grant execute on function public.update_startup_profile(uuid, jsonb) to authenticated;
grant execute on function public.save_hypothesis_draft(uuid, jsonb, timestamptz) to authenticated;
grant execute on function public.discard_hypothesis_revision(uuid) to authenticated;
grant execute on function public.request_hypothesis_confirmation(uuid) to authenticated;
grant execute on function public.approve_hypothesis(uuid) to authenticated;
grant execute on function public.save_step_result(uuid, text, jsonb, integer) to authenticated;
grant execute on function public.complete_step(uuid, text) to authenticated;
grant execute on function public.archive_startup(uuid) to authenticated;
grant execute on function public.rename_startup(uuid, text) to authenticated;
grant execute on function public.redeem_access_code(text) to authenticated;

-- Signed-in users may ask whether they have PRO, only about themselves.
create or replace function public.my_pro_status()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'active', public.has_active_pro(auth.uid()),
    'expires_at', (
      select max(expires_at) from public.entitlements
      where user_id = auth.uid() and revoked_at is null and plan = 'pro'
    )
  );
$$;
revoke all on function public.my_pro_status() from public, anon;
grant execute on function public.my_pro_status() to authenticated;
