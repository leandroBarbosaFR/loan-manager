-- Free-text referral for when the referrer is NOT a customer. Complements the
-- existing referred_by_id (a link to another customer); only one is set.
--
-- Run this in the Supabase SQL editor (or via the Supabase CLI).
alter table public.customers
  add column if not exists referred_by_name text;
