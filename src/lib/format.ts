/**
 * Formatting helpers. Money is stored as numeric in Postgres and read as
 * `number` here. The app uses BRL by default — change `CURRENCY`/`LOCALE`
 * if you lend in another currency.
 */

export const LOCALE = "pt-BR";
export const CURRENCY = "BRL";

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
});

export function formatMoney(value: number | null | undefined): string {
  return currencyFormatter.format(value ?? 0);
}

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Formats an ISO date (`YYYY-MM-DD`) or timestamp without timezone drift. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  // Treat date-only strings as local calendar dates (no TZ shift).
  const iso = value.length === 10 ? `${value}T00:00:00` : value;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

/** Today's calendar date as `YYYY-MM-DD`. */
export function today(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Adds whole days to a `YYYY-MM-DD` date. */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const base = new Date(y, m - 1, d + days);
  const yy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, "0");
  const dd = String(base.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** Adds whole months to a `YYYY-MM-DD` date, clamping the day. */
export function addMonths(isoDate: string, months: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const base = new Date(y, m - 1 + months, 1);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const day = Math.min(d, lastDay);
  const yy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
