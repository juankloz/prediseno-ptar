-- PREDISEÑO PTAR — ESQUEMA INICIAL SEGURO
-- Proyecto Supabase independiente
-- Ejecutar una sola vez en SQL Editor.

begin;

create extension if not exists pgcrypto;

create table if not exists public.ptar_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  privacy_consent_at timestamptz,
  privacy_policy_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ptar_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'draft'
    check (status in ('draft','calculated','paid','archived')),
  activity_code text not null,
  discharge_point text not null
    check (discharge_point in ('cuerpo_agua','alcantarillado','suelo')),
  input_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ptar_projects_user_updated_idx
  on public.ptar_projects(user_id, updated_at desc);

create table if not exists public.ptar_products (
  code text primary key,
  name text not null,
  report_tier text not null check (report_tier in ('basic','complete')),
  amount_in_cents integer not null check (amount_in_cents > 0),
  currency text not null default 'COP' check (currency = 'COP'),
  active boolean not null default true,
  payment_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ptar_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.ptar_projects(id) on delete restrict,
  product_code text not null references public.ptar_products(code),
  amount_in_cents integer not null check (amount_in_cents > 0),
  currency text not null default 'COP' check (currency = 'COP'),
  status text not null default 'created'
    check (status in ('created','pending','approved','declined','voided','error','refunded')),
  provider text not null default 'wompi',
  provider_transaction_id text unique,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ptar_payment_events (
  id bigint generated always as identity primary key,
  event_key text not null unique,
  provider text not null default 'wompi',
  event_type text not null,
  environment text not null check (environment in ('test','prod')),
  transaction_id text,
  transaction_status text,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.ptar_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.ptar_projects(id) on delete cascade,
  order_id uuid unique references public.ptar_orders(id) on delete restrict,
  source text not null default 'payment'
    check (source in ('payment','manual','promotion')),
  report_tier text not null check (report_tier in ('basic','complete')),
  active boolean not null default true,
  remaining_regenerations integer not null default 3
    check (remaining_regenerations >= 0),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, project_id, report_tier)
);

create table if not exists public.ptar_calculation_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ptar_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  engine_version text not null,
  normative_version text not null,
  cost_basis_date date,
  input_snapshot jsonb not null,
  public_output jsonb not null,
  input_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists ptar_runs_project_created_idx
  on public.ptar_calculation_runs(project_id, created_at desc);

create table if not exists public.ptar_calculation_details (
  run_id uuid primary key references public.ptar_calculation_runs(id) on delete cascade,
  premium_output jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ptar_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.ptar_projects(id) on delete cascade,
  run_id uuid not null references public.ptar_calculation_runs(id) on delete restrict,
  order_id uuid references public.ptar_orders(id) on delete restrict,
  report_tier text not null check (report_tier in ('basic','complete')),
  status text not null default 'queued'
    check (status in ('queued','generating','ready','failed','revoked')),
  storage_path text unique,
  sha256 text,
  created_at timestamptz not null default now(),
  ready_at timestamptz
);

create table if not exists public.ptar_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.ptar_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.ptar_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.ptar_profiles (id, email)
  values (new.id, lower(coalesce(new.email, '')))
  on conflict (id) do update
    set email = excluded.email, updated_at = now();
  return new;
end;
$$;

revoke all on function public.ptar_handle_new_user() from public, anon, authenticated;

drop trigger if exists ptar_on_auth_user on auth.users;
create trigger ptar_on_auth_user
after insert or update of email on auth.users
for each row execute function public.ptar_handle_new_user();

insert into public.ptar_profiles (id, email)
select id, lower(coalesce(email, '')) from auth.users
on conflict (id) do nothing;

-- Actualización automática de updated_at.
drop trigger if exists ptar_profiles_touch on public.ptar_profiles;
create trigger ptar_profiles_touch before update on public.ptar_profiles
for each row execute function public.ptar_touch_updated_at();

drop trigger if exists ptar_projects_touch on public.ptar_projects;
create trigger ptar_projects_touch before update on public.ptar_projects
for each row execute function public.ptar_touch_updated_at();

drop trigger if exists ptar_products_touch on public.ptar_products;
create trigger ptar_products_touch before update on public.ptar_products
for each row execute function public.ptar_touch_updated_at();

drop trigger if exists ptar_orders_touch on public.ptar_orders;
create trigger ptar_orders_touch before update on public.ptar_orders
for each row execute function public.ptar_touch_updated_at();

-- RLS
alter table public.ptar_profiles enable row level security;
alter table public.ptar_projects enable row level security;
alter table public.ptar_products enable row level security;
alter table public.ptar_orders enable row level security;
alter table public.ptar_payment_events enable row level security;
alter table public.ptar_entitlements enable row level security;
alter table public.ptar_calculation_runs enable row level security;
alter table public.ptar_calculation_details enable row level security;
alter table public.ptar_reports enable row level security;
alter table public.ptar_audit_log enable row level security;

create policy ptar_profiles_select_own on public.ptar_profiles
for select to authenticated using ((select auth.uid()) = id);
create policy ptar_profiles_update_own on public.ptar_profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy ptar_projects_select_own on public.ptar_projects
for select to authenticated using ((select auth.uid()) = user_id);
create policy ptar_projects_insert_own on public.ptar_projects
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy ptar_projects_update_own on public.ptar_projects
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy ptar_projects_delete_own on public.ptar_projects
for delete to authenticated using ((select auth.uid()) = user_id);

create policy ptar_products_read_active on public.ptar_products
for select to anon, authenticated using (active = true);

create policy ptar_orders_select_own on public.ptar_orders
for select to authenticated using ((select auth.uid()) = user_id);

create policy ptar_entitlements_select_own on public.ptar_entitlements
for select to authenticated using ((select auth.uid()) = user_id);

create policy ptar_runs_select_own on public.ptar_calculation_runs
for select to authenticated using ((select auth.uid()) = user_id);
create policy ptar_runs_insert_own on public.ptar_calculation_runs
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.ptar_projects p
    where p.id = project_id and p.user_id = (select auth.uid())
  )
);

create policy ptar_reports_select_own on public.ptar_reports
for select to authenticated using ((select auth.uid()) = user_id);

-- Permisos explícitos. Las tablas administrativas no reciben escrituras del navegador.
grant select, update on public.ptar_profiles to authenticated;
grant select, insert, update, delete on public.ptar_projects to authenticated;
grant select on public.ptar_products to anon, authenticated;
grant select on public.ptar_orders to authenticated;
grant select on public.ptar_entitlements to authenticated;
grant select, insert on public.ptar_calculation_runs to authenticated;
grant select on public.ptar_reports to authenticated;

revoke all on public.ptar_payment_events from anon, authenticated;
revoke all on public.ptar_calculation_details from anon, authenticated;
revoke all on public.ptar_audit_log from anon, authenticated;

insert into public.ptar_products (
  code, name, report_tier, amount_in_cents, currency, active, payment_enabled
)
values
  ('report_basic', 'Informe básico de prediseño PTAR', 'basic', 1000000, 'COP', true, false),
  ('report_complete', 'Informe completo de prediseño PTAR', 'complete', 25000000, 'COP', true, false)
on conflict (code) do update set
  name = excluded.name,
  report_tier = excluded.report_tier,
  amount_in_cents = excluded.amount_in_cents,
  active = excluded.active,
  payment_enabled = false,
  updated_at = now();

insert into storage.buckets (id, name, public)
values ('ptar-reports', 'ptar-reports', false)
on conflict (id) do update set public = false;

create policy ptar_reports_storage_read_own
on storage.objects for select to authenticated
using (
  bucket_id = 'ptar-reports'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Acceso manual de prueba. Solo puede ejecutarse desde SQL Editor con rol administrador.
create or replace function public.admin_grant_ptar_test_access(
  p_email text,
  p_tier text default 'complete'
)
returns table (user_id uuid, project_id uuid, entitlement_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_project_id uuid;
  v_entitlement_id uuid;
begin
  if p_tier not in ('basic','complete') then
    raise exception 'Nivel inválido';
  end if;

  select id into v_user_id
  from auth.users
  where lower(email) = lower(p_email)
  limit 1;

  if v_user_id is null then
    raise exception 'El usuario aún no existe. Debe iniciar sesión primero.';
  end if;

  select id into v_project_id
  from public.ptar_projects
  where user_id = v_user_id
  order by updated_at desc
  limit 1;

  if v_project_id is null then
    raise exception 'El usuario todavía no ha guardado un proyecto.';
  end if;

  insert into public.ptar_entitlements (
    user_id, project_id, source, report_tier, active, remaining_regenerations
  )
  values (v_user_id, v_project_id, 'manual', p_tier, true, 20)
  on conflict (user_id, project_id, report_tier) do update
  set active = true, remaining_regenerations = 20, expires_at = null
  returning id into v_entitlement_id;

  return query select v_user_id, v_project_id, v_entitlement_id;
end;
$$;

revoke all on function public.admin_grant_ptar_test_access(text, text)
from public, anon, authenticated;

commit;
