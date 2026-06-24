-- Append-only payments ledger.
--
-- Each payment is an immutable record. An installment's paid_amount / paid_at /
-- status become a CACHE derived from its payments (recomputed in the app after
-- every change). This unlocks partial payments, full payment history and an
-- audit trail, without breaking the many places that read installment.paid_amount.

create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references auth.users (id) on delete cascade,
  loan_id        uuid not null references public.loans (id) on delete cascade,
  installment_id uuid not null references public.installments (id) on delete cascade,
  amount         numeric(12,2) not null check (amount > 0),
  paid_at        date not null,
  note           text,
  created_at     timestamptz not null default now()
);

create index if not exists payments_owner_idx on public.payments (owner_id);
create index if not exists payments_loan_idx on public.payments (loan_id);
create index if not exists payments_installment_idx on public.payments (installment_id);

alter table public.payments enable row level security;

drop policy if exists "owner access" on public.payments;
create policy "owner access" on public.payments
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Backfill: turn each already-paid installment into one payment row so existing
-- history isn't lost. Idempotent (skips installments that already have a row).
insert into public.payments (owner_id, loan_id, installment_id, amount, paid_at)
select owner_id, loan_id, id, paid_amount, coalesce(paid_at, due_date)
from public.installments
where paid_amount is not null
  and paid_amount > 0
  and not exists (
    select 1 from public.payments p where p.installment_id = installments.id
  );
