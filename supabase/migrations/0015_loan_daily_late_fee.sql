-- Adds a fixed per-day late fee (in currency) to loans, alongside the existing
-- percentage-based fine and monthly arrears interest. Charged as
-- `late_daily_fee × days_late` per overdue installment. Defaults to 0 (none).
--
-- Run this in the Supabase SQL editor (or via the Supabase CLI).
alter table public.loans
  add column if not exists late_daily_fee numeric(12,2) not null default 0
  check (late_daily_fee >= 0);
