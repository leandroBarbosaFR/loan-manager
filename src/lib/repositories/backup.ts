import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { objectsToCsv } from "@/lib/csv";

/** Every table dumped by a backup run, in restore-friendly order. */
const TABLES = [
  "profiles",
  "customers",
  "customer_documents",
  "loans",
  "installments",
  "payments",
  "vehicles",
  "vehicle_maintenance",
  "rentals",
  "rental_installments",
  "rental_payments",
  "whatsapp_settings",
] as const;

const BUCKET = "backups";
/** How many past runs to keep before pruning the oldest. */
const KEEP_RUNS = 8;

export interface BackupResult {
  folder: string;
  files: { table: string; rows: number }[];
  pruned: string[];
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function ensureBucket(admin: AdminClient): Promise<void> {
  const { data: buckets, error } = await admin.storage.listBuckets();
  if (error) throw error;
  if (buckets?.some((b) => b.name === BUCKET)) return;
  // Private bucket — only the service role (and the dashboard) can read it.
  const { error: createError } = await admin.storage.createBucket(BUCKET, {
    public: false,
  });
  if (createError) throw createError;
}

/** Deletes the oldest run folders, keeping the most recent `KEEP_RUNS`. */
async function pruneOldRuns(admin: AdminClient): Promise<string[]> {
  const { data: entries, error } = await admin.storage
    .from(BUCKET)
    .list("", { limit: 1000 });
  if (error) throw error;

  // Folders come back as entries without an id.
  const folders = (entries ?? [])
    .filter((e) => e.id === null)
    .map((e) => e.name)
    .sort();

  const stale = folders.slice(0, Math.max(0, folders.length - KEEP_RUNS));
  for (const folder of stale) {
    const { data: files } = await admin.storage
      .from(BUCKET)
      .list(folder, { limit: 1000 });
    const paths = (files ?? []).map((f) => `${folder}/${f.name}`);
    if (paths.length > 0) await admin.storage.from(BUCKET).remove(paths);
  }
  return stale;
}

/**
 * Dumps every table to CSV under `backups/<timestamp>/<table>.csv` in Supabase
 * Storage, then prunes the oldest runs. Uses the service role, so it captures
 * all users' data — this is a disaster-recovery snapshot, not a per-user export.
 */
export async function runBackup(timestamp: string): Promise<BackupResult> {
  const admin = createAdminClient();
  await ensureBucket(admin);

  const files: { table: string; rows: number }[] = [];

  for (const table of TABLES) {
    const { data, error } = await admin.from(table).select("*");
    if (error) throw new Error(`${table}: ${error.message}`);

    const rows = (data ?? []) as unknown as Record<string, unknown>[];
    const csv = objectsToCsv(rows);

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(`${timestamp}/${table}.csv`, csv, {
        contentType: "text/csv; charset=utf-8",
        upsert: true,
      });
    if (uploadError) throw new Error(`${table}: ${uploadError.message}`);

    files.push({ table, rows: rows.length });
  }

  const pruned = await pruneOldRuns(admin);
  return { folder: timestamp, files, pruned };
}
