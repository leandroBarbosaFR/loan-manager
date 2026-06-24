-- Fixed-term vehicle rentals.
--
-- A rental rents a vehicle to a customer for N periods (daily/weekly/monthly)
-- at a fixed rate, generating one installment per period. Mirrors the loan
-- ledger pattern (installment cache + append-only payments) but in dedicated
-- tables, fully isolated from loans.

create table if not exists public.rentals (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  vehicle_id  uuid not null references public.vehicles (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  period_type text not null check (period_type in ('daily', 'weekly', 'monthly')),
  period_count int not null check (period_count >= 1),
  rate        numeric(12,2) not null check (rate >= 0),
  total       numeric(12,2) not null check (total >= 0),
  deposit     numeric(12,2) not null default 0 check (deposit >= 0),
  start_date  date not null,
  status      text not null default 'active' check (status in ('active', 'closed')),
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists rentals_owner_idx on public.rentals (owner_id);
create index if not exists rentals_vehicle_idx on public.rentals (vehicle_id);
create index if not exists rentals_customer_idx on public.rentals (customer_id);

alter table public.rentals enable row level security;
drop policy if exists "owner access" on public.rentals;
create policy "owner access" on public.rentals
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create table if not exists public.rental_installments (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users (id) on delete cascade,
  rental_id    uuid not null references public.rentals (id) on delete cascade,
  period_index int not null,
  due_date     date not null,
  amount       numeric(12,2) not null,
  paid_amount  numeric(12,2),
  paid_at      date,
  status       text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  created_at   timestamptz not null default now()
);

create index if not exists rental_installments_rental_idx
  on public.rental_installments (rental_id);

alter table public.rental_installments enable row level security;
drop policy if exists "owner access" on public.rental_installments;
create policy "owner access" on public.rental_installments
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create table if not exists public.rental_payments (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid not null references auth.users (id) on delete cascade,
  rental_id             uuid not null references public.rentals (id) on delete cascade,
  rental_installment_id uuid not null references public.rental_installments (id) on delete cascade,
  amount                numeric(12,2) not null check (amount > 0),
  paid_at               date not null,
  note                  text,
  created_at            timestamptz not null default now()
);

create index if not exists rental_payments_rental_idx
  on public.rental_payments (rental_id);
create index if not exists rental_payments_installment_idx
  on public.rental_payments (rental_installment_id);

alter table public.rental_payments enable row level security;
drop policy if exists "owner access" on public.rental_payments;
create policy "owner access" on public.rental_payments
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
