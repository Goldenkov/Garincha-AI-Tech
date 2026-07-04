create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  telegram text,
  business_niche text not null,
  main_goal text not null,
  consent boolean not null default false,
  source text not null default 'website',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.buyers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  status text not null default 'active',
  purchased_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.access_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null,
  buyer_id uuid references public.buyers(id) on delete set null,
  status text not null default 'active',
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  niche text,
  clear_text text,
  stuck_text text,
  result_text text,
  missing_text text,
  rating integer check (rating between 1 and 10),
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.launch_kits (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.buyers(id) on delete cascade,
  niche_id text,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;
alter table public.buyers enable row level security;
alter table public.access_codes enable row level security;
alter table public.feedback enable row level security;
alter table public.launch_kits enable row level security;

-- MVP uses server API routes with the service role key.
-- No public read policies are created for any table.
-- Public inserts are intentionally disabled by default; enable narrow insert policies later only if direct anon writes are required.

revoke all on public.leads from anon, authenticated;
revoke all on public.buyers from anon, authenticated;
revoke all on public.access_codes from anon, authenticated;
revoke all on public.feedback from anon, authenticated;
revoke all on public.launch_kits from anon, authenticated;
