-- Family Loan Manager — initial schema
-- Run this in the Supabase SQL editor (or via the Supabase CLI).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists customers_name_idx on public.customers (name);

-- ---------------------------------------------------------------------------
-- loans
-- ---------------------------------------------------------------------------
create table if not exists public.loans (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references public.customers (id) on delete cascade,
  principal        numeric(10, 2) not null check (principal >= 0),
  total_receivable numeric(10, 2) not null check (total_receivable >= 0),
  loan_date        date not null,
  status           text not null default 'open'
                     check (status in ('open', 'paid', 'overdue')),
  notes            text,
  created_at       timestamptz not null default now()
);

create index if not exists loans_customer_id_idx on public.loans (customer_id);
create index if not exists loans_status_idx on public.loans (status);

-- ---------------------------------------------------------------------------
-- installments
-- ---------------------------------------------------------------------------
create table if not exists public.installments (
  id           uuid primary key default gen_random_uuid(),
  loan_id      uuid not null references public.loans (id) on delete cascade,
  due_date     date not null,
  amount       numeric(10, 2) not null check (amount >= 0),
  paid_amount  numeric(10, 2),
  paid_at      timestamptz,
  status       text not null default 'pending'
                 check (status in ('pending', 'paid', 'overdue'))
);

create index if not exists installments_loan_id_idx on public.installments (loan_id);
create index if not exists installments_status_idx on public.installments (status);
create index if not exists installments_due_date_idx on public.installments (due_date);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Single-admin internal tool: any authenticated user has full access.
-- ---------------------------------------------------------------------------
alter table public.customers    enable row level security;
alter table public.loans        enable row level security;
alter table public.installments enable row level security;

drop policy if exists "authenticated full access" on public.customers;
create policy "authenticated full access" on public.customers
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated full access" on public.loans;
create policy "authenticated full access" on public.loans
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated full access" on public.installments;
create policy "authenticated full access" on public.installments
  for all to authenticated using (true) with check (true);
