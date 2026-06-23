import { NextResponse, type NextRequest } from "next/server";
import { processReminders } from "@/lib/repositories/whatsapp";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Triggered hourly by Vercel Cron. Sends due WhatsApp reminders for any user
 * whose configured send-hour matches the current local hour.
 *
 * Secured with CRON_SECRET: Vercel automatically sends it as a Bearer token.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await processReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
