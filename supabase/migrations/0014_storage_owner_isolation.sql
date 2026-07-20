-- Family Loan Manager — per-owner isolation for customer document files.
--
-- BUG FIXED: the previous storage policy allowed ANY authenticated user to
-- read/write/delete ANY object in the `customer-documents` bucket as long as
-- they knew the path — so one user could download another user's uploaded
-- documents. This replaces it with an owner-scoped policy.
--
-- Document paths are `<customer_id>/<uuid>-<filename>`, so the first path folder
-- is the customer id. Access is granted only when that customer belongs to the
-- current user (customers.owner_id = auth.uid()).
--
-- Run this in the Supabase SQL editor (or via the Supabase CLI).

drop policy if exists "authenticated manage customer docs" on storage.objects;

create policy "own customer docs" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'customer-documents'
    and (storage.foldername(name))[1] in (
      select id::text from public.customers where owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'customer-documents'
    and (storage.foldername(name))[1] in (
      select id::text from public.customers where owner_id = auth.uid()
    )
  );
