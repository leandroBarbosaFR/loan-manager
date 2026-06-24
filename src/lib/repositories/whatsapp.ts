import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Customer,
  Installment,
  Loan,
  ReminderType,
  WhatsappSettings,
} from "@/types/database";
import {
  renderMessage,
  sendTemplateMessage,
  toWhatsappNumber,
} from "@/lib/whatsapp";
import { addDays, formatDate, formatMoney, today } from "@/lib/format";

// ---------------------------------------------------------------------------
// Per-user settings
// ---------------------------------------------------------------------------
export async function getWhatsappSettings(): Promise<WhatsappSettings | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("whatsapp_settings")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();
  // 42P01 = table doesn't exist yet (migration 0005 not run). Degrade to defaults.
  if (error && error.code !== "42P01") throw error;
  return data ?? null;
}

export async function saveWhatsappSettings(
  input: Omit<WhatsappSettings, "owner_id" | "updated_at">,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("whatsapp_settings")
    .upsert({ owner_id: user!.id, ...input, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/**
 * Sends one test reminder to an arbitrary number using the current user's saved
 * template for that reminder type, with sample values. Used to verify the Meta
 * setup without waiting for a real due date.
 */
export async function sendTestReminder(
  to: string,
  which: ReminderType,
): Promise<void> {
  const settings = await getWhatsappSettings();
  if (!settings) throw new Error("Save your WhatsApp settings first.");

  const template =
    which === "d2"
      ? settings.template_2d
      : which === "d1"
        ? settings.template_1d
        : settings.template_due;
  if (!template) {
    throw new Error("No approved template name is set for this reminder.");
  }

  const number = toWhatsappNumber(null, to);
  if (!number) throw new Error("Enter a valid phone number (with DDD).");

  const phrase =
    which === "d2"
      ? settings.phrase_2d
      : which === "d1"
        ? settings.phrase_1d
        : settings.phrase_due;
  if (!phrase) {
    throw new Error("Write the message text for this reminder first.");
  }

  const offset = which === "d2" ? 2 : which === "d1" ? 1 : 0;
  const body = renderMessage(phrase, {
    nome: "Maria",
    data: formatDate(addDays(today(), offset)),
    valor: formatMoney(100),
  });
  await sendTemplateMessage({
    to: number,
    template,
    lang: settings.lang,
    // Single body variable {{1}} = the full rendered message.
    params: [body],
  });
}

// ---------------------------------------------------------------------------
// Cron processing (service role — runs across all users)
// ---------------------------------------------------------------------------

/** Local date (YYYY-MM-DD), hour (0-23) and minute (0-59) for a timezone, now. */
function localNow(
  timezone: string,
): { date: string; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  let hour = parseInt(get("hour"), 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(get("minute"), 10);
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour, minute };
}

type InstallmentJoined = Installment & {
  loan: (Loan & { customer: Customer | null }) | null;
};

export type ReminderRunResult = {
  processedUsers: number;
  sent: number;
  failed: number;
  skipped: number;
};

/**
 * For each user whose configured send-hour matches the current local hour,
 * sends the appropriate template for installments due in 2 days, 1 day, or
 * today. Idempotent: a reminder is logged and never sent twice.
 */
export async function processReminders(): Promise<ReminderRunResult> {
  const admin = createAdminClient();
  const result: ReminderRunResult = {
    processedUsers: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  const { data: settingsRows, error } = await admin
    .from("whatsapp_settings")
    .select("*")
    .eq("enabled", true);
  if (error) throw error;

  for (const settings of settingsRows ?? []) {
    const { date, hour, minute } = localNow(settings.timezone);
    // Cron fires every 15 min; all timezone offsets are 15-min multiples, so
    // the local minute is always 0/15/30/45 and matches the chosen step.
    if (hour !== settings.send_hour || minute !== settings.send_minute) continue;
    result.processedUsers++;

    const targets: {
      type: ReminderType;
      date: string;
      template: string | null;
      phrase: string | null;
    }[] = [
      {
        type: "d2",
        date: addDays(date, 2),
        template: settings.template_2d,
        phrase: settings.phrase_2d,
      },
      {
        type: "d1",
        date: addDays(date, 1),
        template: settings.template_1d,
        phrase: settings.phrase_1d,
      },
      {
        type: "due",
        date,
        template: settings.template_due,
        phrase: settings.phrase_due,
      },
    ];

    const dates = targets.map((t) => t.date);
    const { data: insts, error: instErr } = await admin
      .from("installments")
      .select("*, loan:loans(*, customer:customers(*))")
      .eq("owner_id", settings.owner_id)
      .in("due_date", dates)
      .neq("status", "paid")
      .is("paid_at", null);
    if (instErr) throw instErr;
    const installments = (insts ?? []) as unknown as InstallmentJoined[];
    if (installments.length === 0) continue;

    // Which reminders were already sent for these installments?
    const ids = installments.map((i) => i.id);
    const { data: logs } = await admin
      .from("whatsapp_reminders_log")
      .select("installment_id, reminder_type")
      .in("installment_id", ids);
    const alreadySent = new Set(
      (logs ?? []).map((l) => `${l.installment_id}:${l.reminder_type}`),
    );

    for (const inst of installments) {
      const target = targets.find((t) => t.date === inst.due_date);
      if (!target || !target.template || !target.phrase) {
        result.skipped++;
        continue;
      }
      if (alreadySent.has(`${inst.id}:${target.type}`)) continue;

      const customer = inst.loan?.customer ?? null;
      const to = toWhatsappNumber(customer?.phone_ddd ?? null, customer?.phone ?? null);
      if (!customer || !to) {
        result.skipped++;
        continue;
      }

      const firstName = customer.name.split(" ")[0] ?? customer.name;
      const body = renderMessage(target.phrase, {
        nome: firstName,
        data: formatDate(inst.due_date),
        valor: formatMoney(inst.amount),
      });

      try {
        await sendTemplateMessage({
          to,
          template: target.template,
          lang: settings.lang,
          // Single body variable {{1}} = the full rendered message.
          params: [body],
        });
        await admin.from("whatsapp_reminders_log").insert({
          owner_id: settings.owner_id,
          installment_id: inst.id,
          reminder_type: target.type,
          status: "sent",
        });
        result.sent++;
      } catch (e) {
        await admin.from("whatsapp_reminders_log").insert({
          owner_id: settings.owner_id,
          installment_id: inst.id,
          reminder_type: target.type,
          status: "failed",
          error: e instanceof Error ? e.message : String(e),
        });
        result.failed++;
      }
    }
  }

  return result;
}
