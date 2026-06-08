import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Loan, Customer, Installment } from "@/types/database";
import { loanTotals, round2 } from "@/lib/calc";

export type ReportType = "active" | "paid" | "overdue" | "collections";

export const REPORT_LABELS: Record<ReportType, string> = {
  active: "Active loans",
  paid: "Paid loans",
  overdue: "Overdue loans",
  collections: "Monthly collections",
};

export interface LoanReportRow {
  customer: string;
  loan_date: string;
  principal: number;
  receivable: number;
  profit: number;
  paid: number;
  outstanding: number;
  status: string;
}

type LoanJoined = Loan & {
  customer: Customer | null;
  installments: Installment[];
};

async function fetchLoansByStatus(
  statuses: Loan["status"][],
): Promise<LoanReportRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loans")
    .select("*, customer:customers(*), installments(*)")
    .in("status", statuses)
    .order("loan_date", { ascending: false });
  if (error) throw error;

  return ((data ?? []) as unknown as LoanJoined[]).map((loan) => {
    const t = loanTotals(loan, loan.installments);
    return {
      customer: loan.customer?.name ?? "—",
      loan_date: loan.loan_date,
      principal: t.principal,
      receivable: t.receivable,
      profit: t.profit,
      paid: t.paid,
      outstanding: t.outstanding,
      status: loan.status,
    };
  });
}

export function activeLoansReport() {
  return fetchLoansByStatus(["open", "overdue"]);
}

export function paidLoansReport() {
  return fetchLoansByStatus(["paid"]);
}

export function overdueLoansReport() {
  return fetchLoansByStatus(["overdue"]);
}

export interface CollectionsReportRow {
  month: string; // YYYY-MM
  count: number;
  total: number;
}

/** Groups received payments by the month they were paid. */
export async function monthlyCollectionsReport(): Promise<CollectionsReportRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("installments")
    .select("paid_amount, paid_at")
    .not("paid_at", "is", null);
  if (error) throw error;

  const byMonth = new Map<string, { count: number; total: number }>();
  for (const row of data ?? []) {
    if (!row.paid_at) continue;
    const month = row.paid_at.slice(0, 7);
    const entry = byMonth.get(month) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total = round2(entry.total + (row.paid_amount ?? 0));
    byMonth.set(month, entry);
  }

  return [...byMonth.entries()]
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => b.month.localeCompare(a.month));
}

export async function getReport(type: ReportType) {
  switch (type) {
    case "active":
      return activeLoansReport();
    case "paid":
      return paidLoansReport();
    case "overdue":
      return overdueLoansReport();
    case "collections":
      return monthlyCollectionsReport();
  }
}
