-- Modelo inicial multi-tenant para um SaaS de barbearia.
-- Cada barbearia e um tenant com equipe, clientes, servicos e agendamentos.

create extension if not exists "pgcrypto";

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  brand_color text default '#c46a2f',
  plan text not null default 'start',
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (role in ('owner', 'manager', 'barber', 'reception')),
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table barbers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  display_name text not null,
  specialty text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null check (price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  barber_id uuid not null references barbers(id) on delete restrict,
  service_id uuid not null references services(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  source text not null default 'dashboard' check (source in ('dashboard', 'public_booking', 'whatsapp')),
  notes text,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references organizations(id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'trialing',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index appointments_org_time_idx on appointments (organization_id, starts_at);
create index clients_org_name_idx on clients (organization_id, full_name);
create index services_org_active_idx on services (organization_id, active);

