-- Family Loan Manager — multi-tenant SaaS (per-user data isolation + roles)
-- Run this in the Supabase SQL editor (or via the Supabase CLI).
--
-- After this migration, every customer/loan/installment/document belongs to the
-- user who created it, and Row Level Security ensures each user sees ONLY their
-- own rows. A `super_admin` role can manage user accounts (via the app's Users
-- page) but does not gain access to other users' data.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, holding their role
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  role       text not null default 'user' check (role in ('super_admin', 'user')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user can read and update only their own profile. Account management is done
-- with the service-role key (which bypasses RLS) from the app's admin actions.
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for select to authenticated using (id = auth.uid());

-- Auto-create a profile whenever a new auth user is created. The role can be
-- seeded through user metadata (set by the admin "create user" flow).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed profiles for users that already exist; make the oldest one super_admin.
insert into public.profiles (id, email, role)
  select id, email, 'user' from auth.users
  on conflict (id) do nothing;

update public.profiles set role = 'super_admin'
  where id = (select id from auth.users order by created_at asc limit 1);

-- ---------------------------------------------------------------------------
-- Ownership column on every data table
-- ---------------------------------------------------------------------------
alter table public.customers          add column if not exists owner_id uuid references auth.users (id) on delete cascade;
alter table public.loans              add column if not exists owner_id uuid references auth.users (id) on delete cascade;
alter table public.installments       add column if not exists owner_id uuid references auth.users (id) on delete cascade;
alter table public.customer_documents add column if not exists owner_id uuid references auth.users (id) on delete cascade;

-- Backfill existing rows to the oldest user (the new super_admin / you).
update public.customers          set owner_id = (select id from auth.users order by created_at asc limit 1) where owner_id is null;
update public.loans              set owner_id = (select id from auth.users order by created_at asc limit 1) where owner_id is null;
update public.installments       set owner_id = (select id from auth.users order by created_at asc limit 1) where owner_id is null;
update public.customer_documents set owner_id = (select id from auth.users order by created_at asc limit 1) where owner_id is null;

create index if not exists customers_owner_id_idx          on public.customers (owner_id);
create index if not exists loans_owner_id_idx              on public.loans (owner_id);
create index if not exists installments_owner_id_idx       on public.installments (owner_id);
create index if not exists customer_documents_owner_id_idx on public.customer_documents (owner_id);

-- ---------------------------------------------------------------------------
-- Replace the shared "authenticated full access" policies with owner-scoped ones
-- ---------------------------------------------------------------------------
drop policy if exists "authenticated full access" on public.customers;
create policy "owner access" on public.customers
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "authenticated full access" on public.loans;
create policy "owner access" on public.loans
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "authenticated full access" on public.installments;
create policy "owner access" on public.installments
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "authenticated full access" on public.customer_documents;
create policy "owner access" on public.customer_documents
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
