import "server-only";
import { createClient } from "@/lib/supabase/server";
import { round2 } from "@/lib/calc";
import { daysBetween } from "@/lib/format";

export interface CapitalStats {
  /** Total principal disbursed across every loan (all time). */
  totalLent: number;
  /** Total collected from installments (all time). */
  totalCollected: number;
  /** Net own-money still out on the street: lent − collected. */
  capitalOnStreet: number;
  /** Share of disbursed capital already returned (0–1). */
  recoveredRatio: number;

  /** Loans that completed a full cash cycle (paid, not renegotiated away). */
  completedCount: number;
  /** Money-weighted average days a real (completed) loan stayed out. */
  avgDaysToPayoff: number | null;
  /** How many times per year the capital turns over (365 / avgDaysToPayoff). */
  turnsPerYear: number | null;
  /** Money-weighted return per cycle: profit / principal on completed loans. */
  returnPerCycle: number | null;
  /** Projected annual return if every cycle is fully reinvested. */
  annualizedReturn: number | null;
}

export async function getCapitalStats(): Promise<CapitalStats> {
  const supabase = await createClient();

  const [{ data: loans, error: loansError }, { data: installments, error: instError }] =
    await Promise.all([
      supabase
        .from("loans")
        .select("id, principal, total_receivable, status, loan_date, renegotiated_to_id"),
      supabase.from("installments").select("loan_id, paid_amount, paid_at"),
    ]);

  if (loansError) throw loansError;
  if (instError) throw instError;

  const loanRows = loans ?? [];
  const instRows = installments ?? [];

  const totalLent = round2(loanRows.reduce((s, l) => s + l.principal, 0));
  const totalCollected = round2(
    instRows.reduce((s, i) => s + (i.paid_amount ?? 0), 0),
  );
  const capitalOnStreet = round2(totalLent - totalCollected);
  const recoveredRatio = totalLent > 0 ? totalCollected / totalLent : 0;

  // Latest payment date per loan — the day that loan was fully paid off.
  const payoffByLoan = new Map<string, string>();
  for (const i of instRows) {
    if (!i.paid_at) continue;
    const current = payoffByLoan.get(i.loan_id);
    if (!current || i.paid_at > current) payoffByLoan.set(i.loan_id, i.paid_at);
  }

  // Velocity is measured only on loans that completed a real cash cycle:
  // marked paid, with actual principal, and NOT rolled into a renegotiation
  // (those never returned cash — they just became a new loan).
  let weightedDays = 0;
  let completedPrincipal = 0;
  let completedProfit = 0;
  let completedCount = 0;

  for (const loan of loanRows) {
    if (loan.status !== "paid") continue;
    if (loan.renegotiated_to_id) continue;
    if (loan.principal <= 0) continue;
    const payoff = payoffByLoan.get(loan.id);
    if (!payoff) continue;

    // Floor at 1 day so same-day payoffs don't blow up the turnover rate.
    const days = Math.max(1, daysBetween(loan.loan_date, payoff.slice(0, 10)));
    weightedDays += loan.principal * days;
    completedPrincipal += loan.principal;
    completedProfit += loan.total_receivable - loan.principal;
    completedCount += 1;
  }

  if (completedCount === 0 || completedPrincipal <= 0) {
    return {
      totalLent,
      totalCollected,
      capitalOnStreet,
      recoveredRatio,
      completedCount,
      avgDaysToPayoff: null,
      turnsPerYear: null,
      returnPerCycle: null,
      annualizedReturn: null,
    };
  }

  const avgDaysToPayoff = weightedDays / completedPrincipal;
  const turnsPerYear = 365 / avgDaysToPayoff;
  const returnPerCycle = completedProfit / completedPrincipal;
  const annualizedReturn = Math.pow(1 + returnPerCycle, turnsPerYear) - 1;

  return {
    totalLent,
    totalCollected,
    capitalOnStreet,
    recoveredRatio,
    completedCount,
    avgDaysToPayoff,
    turnsPerYear,
    returnPerCycle,
    annualizedReturn,
  };
}
