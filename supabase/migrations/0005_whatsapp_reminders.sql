-- Family Loan Manager — WhatsApp payment reminders (Meta Cloud API)
-- Run this in the Supabase SQL editor (or via the Supabase CLI).
--
-- Each user configures their own reminders: a send hour, timezone, and the
-- three message templates (2 days before / 1 day before / on the due date).
-- A cron job sends the matching template to each customer and logs it so the
-- same reminder is never sent twice.

create table if not exists public.whatsapp_settings (
  owner_id     uuid primary key references auth.users (id) on delete cascade,
  enabled      boolean not null default false,
  send_hour    int not null default 9 check (send_hour between 0 and 23),
  timezone     text not null default 'America/Sao_Paulo',
  lang         text not null default 'pt_BR',
  template_2d  text,
  template_1d  text,
  template_due text,
  phrase_2d    text,
  phrase_1d    text,
  phrase_due   text,
  updated_at   timestamptz not null default now()
);

alter table public.whatsapp_settings enable row level security;

drop policy if exists "owner access" on public.whatsapp_settings;
create policy "owner access" on public.whatsapp_settings
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create table if not exists public.whatsapp_reminders_log (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references auth.users (id) on delete cascade,
  installment_id uuid not null references public.installments (id) on delete cascade,
  reminder_type  text not null check (reminder_type in ('d2', 'd1', 'due')),
  status         text not null default 'sent' check (status in ('sent', 'failed')),
  error          text,
  created_at     timestamptz not null default now(),
  unique (installment_id, reminder_type)
);

create index if not exists whatsapp_log_owner_idx
  on public.whatsapp_reminders_log (owner_id);

alter table public.whatsapp_reminders_log enable row level security;

drop policy if exists "owner access" on public.whatsapp_reminders_log;
create policy "owner access" on public.whatsapp_reminders_log
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
