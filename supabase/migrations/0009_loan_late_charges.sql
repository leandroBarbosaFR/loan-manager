-- Per-loan late-payment penalties (optional). Conservative Brazilian model:
--   * late_fee_percent          — one-time fine (multa) on an overdue balance
--   * late_interest_percent_month — monthly arrears interest (juros de mora),
--                                   accrued pro-rata per day (simple interest)
-- Both default to 0 (no penalty). Charges are computed/displayed by the app;
-- they do not mutate total_receivable or the payments ledger.
alter table public.loans
  add column if not exists late_fee_percent numeric(6,2) not null default 0
  check (late_fee_percent >= 0);
alter table public.loans
  add column if not exists late_interest_percent_month numeric(6,2) not null default 0
  check (late_interest_percent_month >= 0);
