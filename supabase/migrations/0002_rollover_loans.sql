-- Family Loan Manager — interest-only / rollover loans
-- Run this in the Supabase SQL editor (or via the Supabase CLI).

-- A rollover loan lets the borrower pay only the recurring fee each period
-- while the principal stays outstanding. `rollover_fee` is the per-period fee;
-- when it is null the loan is a normal fixed-installment loan.
alter table public.loans
  add column if not exists rollover_fee numeric(10, 2) check (rollover_fee >= 0);

-- Distinguishes the kind of installment so rollover loans can keep the
-- principal separate from the recurring fee charges.
alter table public.installments
  add column if not exists kind text not null default 'scheduled'
    check (kind in ('scheduled', 'fee', 'principal'));
