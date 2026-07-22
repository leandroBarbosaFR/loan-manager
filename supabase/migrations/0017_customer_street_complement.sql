-- Optional address complement (apt / block / reference) for customers.
--
-- Run this in the Supabase SQL editor (or via the Supabase CLI).
alter table public.customers
  add column if not exists street_complement text;
