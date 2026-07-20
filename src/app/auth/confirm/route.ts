import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Verifies an email OTP link (invite, recovery, magic link) and starts a
 * session, then forwards to `next`.
 *
 * This uses `verifyOtp({ token_hash, type })` rather than the PKCE
 * `exchangeCodeForSession` flow on purpose: invite/recovery links are generated
 * server-side, so the recipient's browser never holds the PKCE `code_verifier`
 * cookie that the code exchange requires. `verifyOtp` needs no verifier, so it
 * works when the link is opened on any device — which is the whole point of an
 * emailed link.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
