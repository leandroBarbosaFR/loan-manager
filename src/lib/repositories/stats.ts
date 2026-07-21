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
      supabase.from("installments").select("amount, paid_amount, loan_id"),
      supabase.from("customers").select("*", { count: "exact", head: true }),
    ]);

  if (loansError) throw loansError;
  if (instError) throw instError;

  const loanRows = loans ?? [];
  const inScope = new Set(loanRows.map((l) => l.id));

  // Per-loan collected and "earned" (scheduled amount, but bumped by any
  // collected late charge = a payment above the installment's amount).
  const paidByLoan = new Map<string, number>();
  const earnedByLoan = new Map<string, number>();
  for (const i of installments ?? []) {
    if (!inScope.has(i.loan_id)) continue;
    const paid = i.paid_amount ?? 0;
    paidByLoan.set(i.loan_id, (paidByLoan.get(i.loan_id) ?? 0) + paid);
    earnedByLoan.set(
      i.loan_id,
      (earnedByLoan.get(i.loan_id) ?? 0) + Math.max(i.amount, paid),
    );
  }

  const totalPrincipal = round2(
    loanRows.reduce((s, l) => s + l.principal, 0),
  );
  // A loan's receivable is its scheduled total, raised by any late charges
  // actually collected on it — so collected can never exceed receivable.
  const totalReceivable = round2(
    loanRows.reduce(
      (s, l) => s + Math.max(l.total_receivable, earnedByLoan.get(l.id) ?? 0),
      0,
    ),
  );
  const totalCollected = round2(
    loanRows.reduce((s, l) => s + (paidByLoan.get(l.id) ?? 0), 0),
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
