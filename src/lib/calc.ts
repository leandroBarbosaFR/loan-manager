import type { Installment, Loan } from "@/types/database";
import { addMonths, today } from "@/lib/format";

/** Rounds to 2 decimal places, avoiding binary float drift. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface PlannedInstallment {
  due_date: string;
  amount: number;
}

/**
 * Distributes `total` across `count` monthly installments starting at
 * `firstDueDate`.
 *
 * `fixedAmounts` maps an installment index (0-based) to an amount the user has
 * pinned by hand. Pinned installments keep their exact amount; the remaining
 * `total - sum(pinned)` is split evenly across the unpinned ones, with any
 * rounding remainder absorbed by the last unpinned installment so the whole
 * plan still sums exactly to `total`.
 *
 * With no `fixedAmounts` this is a plain even split.
 */
export function distributeInstallments(
  total: number,
  count: number,
  firstDueDate: string,
  fixedAmounts: Record<number, number> = {},
): PlannedInstallment[] {
  if (count <= 0) return [];

  const unpinned: number[] = [];
  let pinnedSum = 0;
  for (let i = 0; i < count; i++) {
    const pinned = fixedAmounts[i];
    if (pinned != null) pinnedSum = round2(pinnedSum + pinned);
    else unpinned.push(i);
  }

  const remaining = round2(total - pinnedSum);
  const base = unpinned.length > 0 ? round2(remaining / unpinned.length) : 0;

  const amounts = new Array<number>(count);
  let accumulated = 0;
  unpinned.forEach((idx, k) => {
    const isLast = k === unpinned.length - 1;
    const amount = isLast ? round2(remaining - accumulated) : base;
    accumulated = round2(accumulated + amount);
    amounts[idx] = amount;
  });

  const result: PlannedInstallment[] = [];
  for (let i = 0; i < count; i++) {
    const pinned = fixedAmounts[i];
    const amount = pinned != null ? round2(pinned) : (amounts[i] ?? 0);
    result.push({ due_date: addMonths(firstDueDate, i), amount });
  }
  return result;
}

/**
 * Splits `total` into `count` monthly installments starting at `firstDueDate`,
 * evenly, with the rounding remainder on the last one.
 */
export function planInstallments(
  total: number,
  count: number,
  firstDueDate: string,
): PlannedInstallment[] {
  return distributeInstallments(total, count, firstDueDate);
}

/** Derives an installment's effective status, accounting for overdue dates. */
export function effectiveInstallmentStatus(
  inst: Pick<Installment, "status" | "due_date" | "paid_at">,
): Installment["status"] {
  if (inst.status === "paid" || inst.paid_at) return "paid";
  if (inst.due_date < today()) return "overdue";
  return "pending";
}

/**
 * The earliest due date among a loan's unpaid installments — its "next
 * payment". Returns null when nothing is outstanding (fully paid / no schedule).
 */
export function nextDueDate(
  installments: Pick<Installment, "status" | "due_date" | "paid_at">[],
): string | null {
  let earliest: string | null = null;
  for (const inst of installments) {
    if (effectiveInstallmentStatus(inst) === "paid") continue;
    if (earliest === null || inst.due_date < earliest) earliest = inst.due_date;
  }
  return earliest;
}

/** Derives a loan's status from its installments. */
export function deriveLoanStatus(
  installments: Pick<Installment, "status" | "due_date" | "paid_at">[],
): Loan["status"] {
  if (installments.length === 0) return "open";
  const allPaid = installments.every(
    (i) => effectiveInstallmentStatus(i) === "paid",
  );
  if (allPaid) return "paid";
  const anyOverdue = installments.some(
    (i) => effectiveInstallmentStatus(i) === "overdue",
  );
  return anyOverdue ? "overdue" : "open";
}

export interface LoanTotals {
  principal: number;
  receivable: number;
  profit: number;
  paid: number;
  outstanding: number;
}

export function loanTotals(
  loan: Pick<Loan, "principal" | "total_receivable">,
  installments: Pick<Installment, "paid_amount">[],
): LoanTotals {
  const paid = round2(
    installments.reduce((sum, i) => sum + (i.paid_amount ?? 0), 0),
  );
  return {
    principal: loan.principal,
    receivable: loan.total_receivable,
    profit: round2(loan.total_receivable - loan.principal),
    paid,
    outstanding: round2(loan.total_receivable - paid),
  };
}
