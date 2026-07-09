import "server-only";
import { createClient } from "@/lib/supabase/server";
import { round2 } from "@/lib/calc";

export interface DashboardStats {
  totalPrincipal: number;
  totalReceivable: number;
  totalProfit: number;
  totalCollected: number;
  outstanding: number;
  openLoans: number;
  overdueLoans: number;
  paidLoans: number;
  totalLoans: number;
  totalCustomers: number;
}

/** Optional inclusive date range (YYYY-MM-DD) to scope stats by loan date. */
export interface StatsRange {
  from?: string;
  to?: string;
}

export async function getDashboardStats(
  range?: StatsRange,
): Promise<DashboardStats> {
  const supabase = await createClient();

  // Loans are scoped by loan_date when a range is provided; the remaining
  // figures (collected, outstanding) are derived from these same loans so the
  // whole overview reflects one consistent period.
  let loansQuery = supabase
    .from("loans")
    .select("id, principal, total_receivable, status");
  if (range?.from) loansQuery = loansQuery.gte("loan_date", range.from);
  if (range?.to) loansQuery = loansQuery.lte("loan_date", range.to);

  const [{ data: loans, error: loansError }, { data: installments, error: instError }, { count: customerCount }] =
    await Promise.all([
      loansQuery,
      supabase.from("installments").select("paid_amount, loan_id"),
      supabase.from("customers").select("*", { count: "exact", head: true }),
    ]);

  if (loansError) throw loansError;
  if (instError) throw instError;

  const loanRows = loans ?? [];
  const inScope = new Set(loanRows.map((l) => l.id));

  const totalPrincipal = round2(
    loanRows.reduce((s, l) => s + l.principal, 0),
  );
  const totalReceivable = round2(
    loanRows.reduce((s, l) => s + l.total_receivable, 0),
  );
  const totalCollected = round2(
    (installments ?? [])
      .filter((i) => inScope.has(i.loan_id))
      .reduce((s, i) => s + (i.paid_amount ?? 0), 0),
  );

  return {
    totalPrincipal,
    totalReceivable,
    totalProfit: round2(totalReceivable - totalPrincipal),
    totalCollected,
    outstanding: round2(totalReceivable - totalCollected),
    openLoans: loanRows.filter((l) => l.status === "open").length,
    overdueLoans: loanRows.filter((l) => l.status === "overdue").length,
    paidLoans: loanRows.filter((l) => l.status === "paid").length,
    totalLoans: loanRows.length,
    totalCustomers: customerCount ?? 0,
  };
}
