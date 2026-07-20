import { NextResponse, type NextRequest } from "next/server";
import { getUser, isSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildUserExport } from "@/lib/repositories/export";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Downloads a complete ZIP of a user's data.
 *
 * - No `userId` (or your own): exports the signed-in user, via the RLS-scoped
 *   client so it can only ever read your own rows.
 * - `?userId=<other>`: super-admin only; uses the service-role client scoped to
 *   that owner, so an admin can export any single user's data.
 */
export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requested = request.nextUrl.searchParams.get("userId");
  const targetId = requested && requested !== user.id ? requested : user.id;

  let client;
  if (targetId === user.id) {
    client = await createClient(); // RLS-scoped to the signed-in user
  } else {
    if (!(await isSuperAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    client = createAdminClient(); // service role, scoped by ownerId in the query
  }

  try {
    const { zip } = await buildUserExport(client, targetId);
    const date = new Date().toISOString().slice(0, 10);
    const filename = `lendly-dados-${date}.zip`;

    return new NextResponse(Buffer.from(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
