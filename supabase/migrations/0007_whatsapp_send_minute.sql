-- Allow reminders to be sent at a specific minute (e.g. 23:30), not just on
-- the hour. The cron runs every 15 minutes and matches hour + minute, so the
-- send time is chosen in 15-minute steps (:00, :15, :30, :45).
alter table public.whatsapp_settings
  add column if not exists send_minute smallint not null default 0
  check (send_minute between 0 and 59);
