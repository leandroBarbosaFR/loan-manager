-- Per-user accent color, so a user's personalization follows them across
-- devices. Stored as a #rrggbb hex string; null = app default.
--
-- Run this in the Supabase SQL editor (or via the Supabase CLI).
alter table public.profiles
  add column if not exists accent_color text
  check (accent_color is null or accent_color ~ '^#[0-9a-fA-F]{6}$');
