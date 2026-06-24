-- Vehicle fleet (cars & motorcycles) for rentals.
--
-- One table holds both types (type = 'car' | 'motorcycle'); car-only fields
-- like `doors` are simply left null for motorcycles. The full "ficha" lives
-- here (specs + GPS/remote-block/accident flags + insurance + IPVA), with a
-- separate maintenance log for revisions.

create table if not exists public.vehicles (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references auth.users (id) on delete cascade,
  type              text not null default 'car' check (type in ('car', 'motorcycle')),
  name              text not null,
  brand             text,
  model_year        int,
  color             text,
  plate             text,
  chassis           text,
  doors             int,
  has_gps           boolean not null default false,
  can_remote_block  boolean not null default false,
  had_accident      boolean not null default false,
  has_insurance     boolean not null default false,
  insurance_company text,
  insurance_expiry  date,
  ipva_paid         boolean not null default false,
  ipva_due_date     date,
  status            text not null default 'available'
                      check (status in ('available', 'rented', 'maintenance', 'inactive')),
  notes             text,
  created_at        timestamptz not null default now()
);

create index if not exists vehicles_owner_idx on public.vehicles (owner_id);
create index if not exists vehicles_type_idx on public.vehicles (type);

alter table public.vehicles enable row level security;
drop policy if exists "owner access" on public.vehicles;
create policy "owner access" on public.vehicles
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Maintenance / revision log (one row per service).
create table if not exists public.vehicle_maintenance (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users (id) on delete cascade,
  vehicle_id   uuid not null references public.vehicles (id) on delete cascade,
  service_date date not null,
  description  text not null,
  cost         numeric(12,2) not null default 0 check (cost >= 0),
  odometer     int,
  created_at   timestamptz not null default now()
);

create index if not exists vehicle_maintenance_vehicle_idx
  on public.vehicle_maintenance (vehicle_id);

alter table public.vehicle_maintenance enable row level security;
drop policy if exists "owner access" on public.vehicle_maintenance;
create policy "owner access" on public.vehicle_maintenance
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
