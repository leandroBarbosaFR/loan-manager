import type { Installment, InstallmentStatus, Loan } from "@/types/database";
import { addMonths, daysBetween, today } from "@/lib/format";

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

export interface InstallmentPaidState {
  paid_amount: number | null;
  paid_at: string | null;
  status: InstallmentStatus;
}

/**
 * Derives an installment's cached payment state from its ledger payments.
 * Partial payments accumulate in `paid_amount` but keep the installment unpaid
 * (`paid_at` stays null, status "pending") until the full amount is covered.
 * Overdue is derived from the due date elsewhere — never stored here.
 */
export function aggregatePayments(
  installmentAmount: number,
  payments: { amount: number; paid_at: string }[],
): InstallmentPaidState {
  if (payments.length === 0) {
    return { paid_amount: null, paid_at: null, status: "pending" };
  }
  const paid = round2(payments.reduce((sum, p) => sum + p.amount, 0));
  if (paid >= round2(installmentAmount)) {
    // All paid_at are non-empty ISO dates, so "" is always the smallest seed.
    const paid_at = payments.reduce(
      (latest, p) => (p.paid_at > latest ? p.paid_at : latest),
      "",
    );
    return { paid_amount: paid, paid_at, status: "paid" };
  }
  return { paid_amount: paid, paid_at: null, status: "pending" };
}

export interface LoanTotals {
  principal: number;
  receivable: number;
  profit: number;
  paid: number;
  outstanding: number;
}

export interface LateChargeConfig {
  /** One-time fine (multa) as a % of the overdue balance. */
  feePercent: number;
  /** Monthly arrears interest (juros de mora), accrued pro-rata per day. */
  interestPercentMonth: number;
  /** Fixed fee in currency charged for each day the installment is late. */
  dailyFee?: number;
}

export interface LateCharge {
  daysLate: number;
  outstanding: number;
  fee: number;
  interest: number;
  /** Accumulated fixed daily fee: dailyFee × daysLate. */
  daily: number;
  total: number;
}

const NO_LATE_CHARGE: LateCharge = {
  daysLate: 0,
  outstanding: 0,
  fee: 0,
  interest: 0,
  daily: 0,
  total: 0,
};

/**
 * Late penalty for a single installment as of `asOf` (YYYY-MM-DD).
 * Fine is one-time on the overdue balance; interest is simple, pro-rata per
 * day (monthly rate × daysLate/30); the daily fee is a fixed amount per day
 * late. Zero when paid or not yet overdue.
 */
export function lateCharge(
  inst: Pick<Installment, "amount" | "due_date" | "paid_amount" | "paid_at">,
  asOf: string,
  config: LateChargeConfig,
): LateCharge {
  if (inst.paid_at) return NO_LATE_CHARGE;
  const outstanding = round2(inst.amount - (inst.paid_amount ?? 0));
  if (outstanding <= 0) return NO_LATE_CHARGE;
  const daysLate = daysBetween(inst.due_date, asOf);
  if (daysLate <= 0) return NO_LATE_CHARGE;

  const fee = round2(outstanding * (config.feePercent / 100));
  const interest = round2(
    outstanding * (config.interestPercentMonth / 100) * (daysLate / 30),
  );
  const daily = round2((config.dailyFee ?? 0) * daysLate);
  return {
    daysLate,
    outstanding,
    fee,
    interest,
    daily,
    total: round2(fee + interest + daily),
  };
}

/** Sum of late charges across a loan's installments as of `asOf`. */
export function totalLateCharges(
  installments: Pick<
    Installment,
    "amount" | "due_date" | "paid_amount" | "paid_at"
  >[],
  asOf: string,
  config: LateChargeConfig,
): number {
  return round2(
    installments.reduce((sum, i) => sum + lateCharge(i, asOf, config).total, 0),
  );
}

/**
 * Principal carried into a renegotiated loan: outstanding balance, optionally
 * plus accrued late charges, minus an optional discount (never below zero).
 */
export function renegotiationPrincipal(
  outstanding: number,
  lateCharges: number,
  opts: { includeLateCharges: boolean; discount: number },
): number {
  const base = outstanding + (opts.includeLateCharges ? lateCharges : 0);
  return round2(Math.max(0, base - opts.discount));
}

export function loanTotals(
  loan: Pick<Loan, "principal" | "total_receivable">,
  installments: Pick<Installment, "amount" | "paid_amount">[],
): LoanTotals {
  const paid = round2(
    installments.reduce((sum, i) => sum + (i.paid_amount ?? 0), 0),
  );
  // A collected late charge shows up as a payment exceeding the installment's
  // scheduled amount. Count that overpayment as earned so it becomes realized
  // profit (and never pushes outstanding below zero). No payment → earned is
  // just the scheduled amounts, so the loan-level receivable is unchanged.
  const earned = round2(
    installments.reduce((sum, i) => sum + Math.max(i.amount, i.paid_amount ?? 0), 0),
  );
  const receivable = round2(Math.max(loan.total_receivable, earned));
  return {
    principal: loan.principal,
    receivable,
    profit: round2(receivable - loan.principal),
    paid,
    outstanding: round2(receivable - paid),
  };
}
