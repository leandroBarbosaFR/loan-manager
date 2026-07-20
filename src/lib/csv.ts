/** Minimal RFC-4180-ish CSV serialization. */

export type CsvValue = string | number | null | undefined;

function escapeCell(value: CsvValue): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  // Prepend BOM so Excel reads UTF-8 correctly.
  return "﻿" + lines.join("\r\n");
}

/**
 * Serializes a list of row objects to CSV. Column order follows the first row's
 * keys; booleans become true/false and nested objects/arrays are JSON-encoded
 * so no field is silently dropped. Returns a header-only CSV when empty.
 */
export function objectsToCsv(rows: Record<string, unknown>[]): string {
  const first = rows[0];
  if (!first) return toCsv([], []);
  const headers = Object.keys(first);
  const body: CsvValue[][] = rows.map((row) =>
    headers.map((h) => {
      const v = row[h];
      if (v === null || v === undefined) return null;
      if (typeof v === "boolean") return v ? "true" : "false";
      if (typeof v === "object") return JSON.stringify(v);
      return v as CsvValue;
    }),
  );
  return toCsv(headers, body);
}
