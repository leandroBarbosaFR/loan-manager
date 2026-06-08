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

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [{ data: loans, error: loansError }, { data: installments, error: instError }, { count: customerCount }] =
    await Promise.all([
      supabase.from("loans").select("principal, total_receivable, status"),
      supabase.from("installments").select("paid_amount"),
      supabase.from("customers").select("*", { count: "exact", head: true }),
    ]);

  if (loansError) throw loansError;
  if (instError) throw instError;

  const totalPrincipal = round2(
    (loans ?? []).reduce((s, l) => s + l.principal, 0),
  );
  const totalReceivable = round2(
    (loans ?? []).reduce((s, l) => s + l.total_receivable, 0),
  );
  const totalCollected = round2(
    (installments ?? []).reduce((s, i) => s + (i.paid_amount ?? 0), 0),
  );

  return {
    totalPrincipal,
    totalReceivable,
    totalProfit: round2(totalReceivable - totalPrincipal),
    totalCollected,
    outstanding: round2(totalReceivable - totalCollected),
    openLoans: (loans ?? []).filter((l) => l.status === "open").length,
    overdueLoans: (loans ?? []).filter((l) => l.status === "overdue").length,
    paidLoans: (loans ?? []).filter((l) => l.status === "paid").length,
    totalLoans: (loans ?? []).length,
    totalCustomers: customerCount ?? 0,
  };
}
