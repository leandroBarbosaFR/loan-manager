-- Customer address detail (neighborhood) and referral link.
-- A customer can be linked to the customer who referred them ("indicação").
alter table public.customers add column if not exists neighborhood text;
alter table public.customers
  add column if not exists referred_by_id uuid
  references public.customers (id) on delete set null;

create index if not exists customers_referred_by_id_idx
  on public.customers (referred_by_id);
