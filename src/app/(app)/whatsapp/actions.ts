"use server";

import { revalidatePath } from "next/cache";
import { whatsappSettingsSchema } from "@/lib/validations";
import { zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import {
  saveWhatsappSettings,
  sendTestReminder,
} from "@/lib/repositories/whatsapp";
import type { ReminderType } from "@/types/database";

export async function saveWhatsappSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  // The form sends a single "HH:MM" time; split it into hour + minute.
  const [sendHour, sendMinute] = String(formData.get("send_time") ?? "")
    .split(":");

  const parsed = whatsappSettingsSchema.safeParse({
    enabled: formData.get("enabled") === "on",
    send_hour: sendHour,
    send_minute: sendMinute,
    timezone: formData.get("timezone"),
    lang: formData.get("lang"),
    template_2d: formData.get("template_2d"),
    template_1d: formData.get("template_1d"),
    template_due: formData.get("template_due"),
    phrase_2d: formData.get("phrase_2d"),
    phrase_1d: formData.get("phrase_1d"),
    phrase_due: formData.get("phrase_due"),
  });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  await saveWhatsappSettings(parsed.data);
  revalidatePath("/whatsapp");
  return { ok: true };
}

export async function sendTestMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const to = String(formData.get("test_to") ?? "").trim();
  const whichRaw = String(formData.get("test_which") ?? "due");
  const which: ReminderType =
    whichRaw === "d2" || whichRaw === "d1" ? whichRaw : "due";

  if (!to) {
    return { ok: false, error: "Enter a phone number to send the test to." };
  }

  try {
    await sendTestReminder(to, which);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not send the test message.",
    };
  }
  return { ok: true };
}
