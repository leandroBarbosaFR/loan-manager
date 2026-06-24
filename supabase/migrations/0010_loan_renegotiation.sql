-- Loan renegotiation / refinancing.
--
-- Renegotiating closes a loan and carries its outstanding balance (optionally
-- plus accrued late charges, minus an optional discount) into a brand-new loan.
-- The two are linked both ways. No cash payment is recorded for the carried
-- balance, so received/cash reports stay honest.
alter table public.loans
  add column if not exists renegotiated_from_id uuid
  references public.loans (id) on delete set null;
alter table public.loans
  add column if not exists renegotiated_to_id uuid
  references public.loans (id) on delete set null;
alter table public.loans
  add column if not exists renegotiated_at timestamptz;

create index if not exists loans_renegotiated_from_idx
  on public.loans (renegotiated_from_id);
