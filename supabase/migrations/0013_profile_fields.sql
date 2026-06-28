-- Richer user profiles + allow users to edit their own profile.
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone     text;
alter table public.profiles add column if not exists street    text;
alter table public.profiles add column if not exists city      text;
alter table public.profiles add column if not exists country   text;

-- A user may update their own profile (the existing policy only allowed select).
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
