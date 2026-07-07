import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { InstallmentWithRelations, InstallmentStatus } from "@/types/database";
import type { InstallmentScheduleInput } from "@/lib/validations";
import { effectiveInstallmentStatus } from "@/lib/calc";
import { today, addDays } from "@/lib/format";
import { syncLoanStatus } from "@/lib/repositories/loans";

export type InstallmentFilter = "all" | "pending" | "paid" | "overdue";

/**
 * Unpaid installments that are overdue or due within the next 3 days, joined
 * with their loan + customer. Used by the dashboard's upcoming-due panel.
 */
export async function listDueSoon(): Promise<InstallmentWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("installments")
    .select("*, loan:loans(*, customer:customers(*))")
    .is("paid_at", null)
    .lte("due_date", addDays(today(), 3))
    .order("due_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as InstallmentWithRelations[];
}

export async function listInstallments(
  filter: InstallmentFilter = "all",
): Promise<InstallmentWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("installments")
    .select("*, loan:loans(*, customer:customers(*))")
    .order("due_date", { ascending: true });
  if (error) throw error;

  const rows = (data ?? []) as unknown as InstallmentWithRelations[];

  // Apply effective status (overdue is derived from due_date) for filtering.
  if (filter === "all") return rows;
  return rows.filter((r) => effectiveInstallmentStatus(r) === filter);
}

/**
 * Updates the due date and amount of a loan's installments. Does not touch
 * payment status — `refreshOverdueStatuses` re-derives overdue from the new
 * dates afterwards.
 */
export async function updateInstallmentSchedule(
  loanId: string,
  input: InstallmentScheduleInput,
): Promise<void> {
  const supabase = await createClient();
  for (const item of input.items) {
    const { error } = await supabase
      .from("installments")
      .update({ due_date: item.due_date, amount: item.amount })
      .eq("id", item.id)
      .eq("loan_id", loanId);
    if (error) throw error;
  }
  await refreshOverdueStatuses();
  await syncLoanStatus(loanId);
}

/**
 * Persists the derived `overdue` status for any past-due, unpaid installments.
 * Cheap to run before listing dashboards/reports so stored status stays honest.
 */
export async function refreshOverdueStatuses(): Promise<void> {
  const supabase = await createClient();
  const todayStr = today();

  await supabase
    .from("installments")
    .update({ status: "overdue" })
    .lt("due_date", todayStr)
    .is("paid_at", null)
    .neq("status", "overdue");

  // Back to pending if somehow marked overdue but not actually past due.
  await supabase
    .from("installments")
    .update({ status: "pending" })
    .gte("due_date", todayStr)
    .is("paid_at", null)
    .eq("status", "overdue");
}

export function countByStatus(
  rows: { status: InstallmentStatus; due_date: string; paid_at: string | null }[],
): Record<InstallmentFilter, number> {
  const counts: Record<InstallmentFilter, number> = {
    all: rows.length,
    pending: 0,
    paid: 0,
    overdue: 0,
  };
  for (const r of rows) {
    counts[effectiveInstallmentStatus(r)]++;
  }
  return counts;
}
