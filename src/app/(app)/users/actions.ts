"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { newUserSchema } from "@/lib/validations";
import { zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { requireSuperAdmin } from "@/lib/auth";
import {
  createUser,
  deleteUser,
  getProfileById,
  generateInviteLink,
} from "@/lib/repositories/users";
import { toWhatsappNumber } from "@/lib/whatsapp";
import { getT } from "@/lib/i18n/server";

/** Derives the site origin from proxy headers, or NEXT_PUBLIC_SITE_URL. */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;
}

export type WhatsappInviteResult =
  | { ok: true; url: string }
  | { ok: false; error: "no-phone" | "failed" };

/**
 * Builds a WhatsApp "click to send" link carrying a fresh invite link for the
 * given user. Does not send anything itself — the admin taps send in WhatsApp.
 */
export async function inviteViaWhatsappAction(
  userId: string,
): Promise<WhatsappInviteResult> {
  await requireSuperAdmin();
  try {
    const profile = await getProfileById(userId);
    if (!profile?.email) return { ok: false, error: "failed" };

    const number = toWhatsappNumber(null, profile.phone);
    if (!number) return { ok: false, error: "no-phone" };

    const link = await generateInviteLink(profile.email, await siteOrigin());
    const t = await getT();
    const message = t("users.waInviteMessage", { link });
    return {
      ok: true,
      url: `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
    };
  } catch {
    return { ok: false, error: "failed" };
  }
}

export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSuperAdmin();

  const parsed = newUserSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    street: formData.get("street"),
    city: formData.get("city"),
    country: formData.get("country"),
  });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;

  try {
    await createUser(parsed.data, `${origin}/auth/callback?next=/reset-password`);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not create the user.",
    };
  }

  revalidatePath("/users");
  return { ok: true };
}

export async function deleteUserAction(userId: string): Promise<void> {
  const admin = await requireSuperAdmin();
  // Never let an admin delete their own account from here.
  if (admin.id === userId) return;
  await deleteUser(userId);
  revalidatePath("/users");
}
