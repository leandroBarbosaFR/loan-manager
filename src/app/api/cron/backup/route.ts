import { NextResponse, type NextRequest } from "next/server";
import { runBackup } from "@/lib/repositories/backup";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Weekly Vercel Cron job: snapshots every table to CSV in Supabase Storage.
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

  // Folder name must be path-safe: 2026-07-09T03-00-00Z
  const timestamp = new Date()
    .toISOString()
    .replace(/\.\d+Z$/, "Z")
    .replace(/:/g, "-");

  try {
    const result = await runBackup(timestamp);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
