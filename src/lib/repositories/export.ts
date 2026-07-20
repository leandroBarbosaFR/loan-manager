import "server-only";
import { zipSync, strToU8 } from "fflate";
import { objectsToCsv } from "@/lib/csv";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

/**
 * Single source of truth for a per-user data export. EVERY table that carries
 * user-owned data must be listed here — the export test cross-checks this list
 * against the schema so a new owned table can't be silently left out.
 *
 * `owner` is the column that scopes rows to a user (`profiles` is keyed by `id`,
 * everything else by `owner_id`). `label` is the friendly CSV filename.
 */
export const EXPORT_TABLES = [
  { name: "profiles", owner: "id", label: "perfil" },
  { name: "customers", owner: "owner_id", label: "clientes" },
  { name: "customer_documents", owner: "owner_id", label: "documentos-registros" },
  { name: "loans", owner: "owner_id", label: "emprestimos" },
  { name: "installments", owner: "owner_id", label: "parcelas" },
  { name: "payments", owner: "owner_id", label: "pagamentos" },
  { name: "vehicles", owner: "owner_id", label: "veiculos" },
  { name: "vehicle_maintenance", owner: "owner_id", label: "veiculos-manutencao" },
  { name: "rentals", owner: "owner_id", label: "alugueis" },
  { name: "rental_installments", owner: "owner_id", label: "alugueis-parcelas" },
  { name: "rental_payments", owner: "owner_id", label: "alugueis-pagamentos" },
  { name: "whatsapp_settings", owner: "owner_id", label: "whatsapp" },
] as const;

const DOCUMENTS_BUCKET = "customer-documents";

export interface ExportResult {
  zip: Uint8Array;
  manifest: { table: string; rows: number }[];
  documents: number;
}

/**
 * Builds a complete ZIP of one user's data: a CSV per table, a faithful
 * `dados-completos.json`, the actual uploaded document files, and a RESUMO.txt
 * manifest with per-table row counts.
 *
 * `ownerId` scopes every query explicitly. Pass an RLS-scoped client for
 * self-service (double protection) or the service-role client when an admin
 * exports another user — either way only `ownerId`'s rows are read.
 */
export async function buildUserExport(
  client: Client,
  ownerId: string,
): Promise<ExportResult> {
  const files: Record<string, Uint8Array> = {};
  const fullJson: Record<string, unknown[]> = {};
  const manifest: { table: string; rows: number }[] = [];

  // The table name is dynamic, so the typed-client's per-table column inference
  // collapses to `never`. Use an untyped view for the generic loop.
  const db = client as unknown as SupabaseClient;

  for (const table of EXPORT_TABLES) {
    const { data, error } = await db
      .from(table.name)
      .select("*")
      .eq(table.owner, ownerId);
    if (error) throw new Error(`${table.name}: ${error.message}`);

    const rows = (data ?? []) as Record<string, unknown>[];
    files[`csv/${table.label}.csv`] = strToU8(objectsToCsv(rows));
    fullJson[table.name] = rows;
    manifest.push({ table: table.name, rows: rows.length });
  }

  // Faithful, lossless copy of everything.
  files["dados-completos.json"] = strToU8(JSON.stringify(fullJson, null, 2));

  // The actual uploaded files, fetched by the paths in the user's own
  // customer_documents rows (already scoped to this owner above).
  const docs = (fullJson.customer_documents ?? []) as {
    path?: string;
    name?: string;
  }[];
  let documents = 0;
  for (const doc of docs) {
    if (!doc.path) continue;
    const { data: blob, error } = await client.storage
      .from(DOCUMENTS_BUCKET)
      .download(doc.path);
    if (error || !blob) continue;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    files[`documentos/${doc.path}`] = bytes;
    documents += 1;
  }

  const summary = [
    "Lendly — exportação de dados",
    `Usuário (owner_id): ${ownerId}`,
    "",
    "Registros por tabela:",
    ...manifest.map((m) => `  ${m.table}: ${m.rows}`),
    "",
    `Documentos incluídos: ${documents}`,
    "",
    "Este pacote contém TODOS os seus dados. Cada tabela está em /csv (abre no",
    "Excel) e em dados-completos.json (cópia fiel). Os arquivos enviados estão",
    "em /documentos.",
  ].join("\n");
  files["RESUMO.txt"] = strToU8(summary);

  const zip = zipSync(files, { level: 6 });
  return { zip, manifest, documents };
}
