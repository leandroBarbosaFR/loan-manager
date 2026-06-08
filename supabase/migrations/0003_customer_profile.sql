-- Family Loan Manager — richer customer profile + proof-of-address documents
-- Run this in the Supabase SQL editor (or via the Supabase CLI).

-- New profile/address fields. All nullable so existing customers stay valid;
-- the UI makes them required for newly created customers.
alter table public.customers add column if not exists birthday      date;
alter table public.customers add column if not exists phone_ddd     text;
alter table public.customers add column if not exists street        text;
alter table public.customers add column if not exists street_number text;
alter table public.customers add column if not exists cep           text;
alter table public.customers add column if not exists city          text;
alter table public.customers add column if not exists state         text;

-- Uploaded documents (proof of address and any extra files) — one customer can
-- have many. Files live in the `customer-documents` storage bucket; `path` is
-- the object key inside it.
create table if not exists public.customer_documents (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  name        text not null,
  path        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists customer_documents_customer_id_idx
  on public.customer_documents (customer_id);

alter table public.customer_documents enable row level security;

drop policy if exists "authenticated full access" on public.customer_documents;
create policy "authenticated full access" on public.customer_documents
  for all to authenticated using (true) with check (true);

-- Private storage bucket for the document files.
insert into storage.buckets (id, name, public)
  values ('customer-documents', 'customer-documents', false)
  on conflict (id) do nothing;

drop policy if exists "authenticated manage customer docs" on storage.objects;
create policy "authenticated manage customer docs" on storage.objects
  for all to authenticated
  using (bucket_id = 'customer-documents')
  with check (bucket_id = 'customer-documents');
