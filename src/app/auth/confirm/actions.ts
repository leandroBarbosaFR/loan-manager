"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Verifies an email/WhatsApp OTP link and starts a session. Runs ONLY on the
 * user's explicit button click (a POST) — never on a GET — so link-preview
 * crawlers (WhatsApp, Gmail) can't consume the one-time token before the person
 * clicks it.
 */
export async function confirmOtpAction(formData: FormData): Promise<void> {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = String(formData.get("type") ?? "") as EmailOtpType;
  const nextRaw = String(formData.get("next") ?? "/");
  // Only allow same-site relative redirects.
  const next = nextRaw.startsWith("/") ? nextRaw : "/";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(next);
  }

  redirect("/login?error=auth");
}
