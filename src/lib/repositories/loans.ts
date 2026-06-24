import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Loan,
  LoanWithRelations,
  Customer,
  Installment,
} from "@/types/database";
import type { LoanInput, RenegotiateInput } from "@/lib/validations";
import {
  deriveLoanStatus,
  planInstallments,
  round2,
  totalLateCharges,
  renegotiationPrincipal,
} from "@/lib/calc";
import { addMonths, today } from "@/lib/format";

type LoanListRow = Loan & {
  customer: Customer | null;
  installments: Installment[];
};

export async function listLoans(): Promise<LoanListRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loans")
    .select("*, customer:customers(*), installments(*)")
    .order("loan_date", { ascending: false });
  if (error) throw error;
  // Embedded FK joins are resolved by Postgres at runtime; cast to our shape.
  return (data ?? []) as unknown as LoanListRow[];
}

export async function listLoansByCustomer(
  customerId: string,
): Promise<LoanWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loans")
    .select("*, customer:customers(*), installments(*)")
    .eq("customer_id", customerId)
    .order("loan_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as LoanWithRelations[];
}

export async function getLoan(id: string): Promise<LoanWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loans")
    .select("*, customer:customers(*), installments(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const loan = data as unknown as LoanWithRelations;
  loan.installments.sort((a, b) => a.due_date.localeCompare(b.due_date));
  return loan;
}

export async function createLoan(input: LoanInput): Promise<Loan> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = user!.id;

  const rolloverFee =
    input.rollover && input.first_due_date
      ? round2(input.total_receivable - input.principal)
      : null;

  const { data: loan, error } = await supabase
    .from("loans")
    .insert({
      owner_id: ownerId,
      customer_id: input.customer_id,
      principal: input.principal,
      total_receivable: input.total_receivable,
      loan_date: input.loan_date,
      notes: input.notes,
      rollover_fee: rolloverFee,
      late_fee_percent: input.late_fee_percent,
      late_interest_percent_month: input.late_interest_percent_month,
      status: "open",
    })
    .select("*")
    .single();
  if (error) throw error;

  // Rollover loan: one recurring-fee installment + the outstanding principal.
  if (rolloverFee != null && input.first_due_date) {
    const { error: instError } = await supabase.from("installments").insert([
      {
        owner_id: ownerId,
        loan_id: loan.id,
        due_date: input.first_due_date,
        amount: rolloverFee,
        status: "pending" as const,
        kind: "fee" as const,
      },
      {
        owner_id: ownerId,
        loan_id: loan.id,
        due_date: input.first_due_date,
        amount: input.principal,
        status: "pending" as const,
        kind: "principal" as const,
      },
    ]);
    if (instError) throw instError;
    await syncLoanStatus(loan.id);
    return loan;
  }

  if (input.generate_installments && input.installment_count && input.first_due_date) {
    const planned =
      input.installments && input.installments.length > 0
        ? input.installments
        : planInstallments(
            input.total_receivable,
            input.installment_count,
            input.first_due_date,
          );
    const rows = planned.map((p) => ({
      owner_id: ownerId,
      loan_id: loan.id,
      due_date: p.due_date,
      amount: p.amount,
      status: "pending" as const,
    }));
    const { error: instError } = await supabase
      .from("installments")
      .insert(rows);
    if (instError) throw instError;
    await syncLoanStatus(loan.id);
  }

  return loan;
}

export async function updateLoan(
  id: string,
  input: Pick<
    LoanInput,
    | "customer_id"
    | "principal"
    | "total_receivable"
    | "loan_date"
    | "notes"
    | "late_fee_percent"
    | "late_interest_percent_month"
  >,
): Promise<Loan> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loans")
    .update({
      customer_id: input.customer_id,
      principal: input.principal,
      total_receivable: input.total_receivable,
      loan_date: input.loan_date,
      notes: input.notes,
      late_fee_percent: input.late_fee_percent,
      late_interest_percent_month: input.late_interest_percent_month,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLoan(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("loans").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Records a fee-only payment on a rollover loan: collects the current period's
 * fee, charges a fresh fee for next period, and carries the principal forward.
 */
export async function rollOverLoan(loanId: string): Promise<void> {
  const supabase = await createClient();

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("*")
    .eq("id", loanId)
    .single();
  if (loanError) throw loanError;
  if (loan.rollover_fee == null) {
    throw new Error("This loan is not a rollover loan");
  }
  const fee = loan.rollover_fee;

  const { data: insts, error: instError } = await supabase
    .from("installments")
    .select("*")
    .eq("loan_id", loanId);
  if (instError) throw instError;
  const rows = (insts ?? []) as Installment[];

  // The current period's fee: the latest still-unpaid fee installment.
  const pendingFee = rows
    .filter((r) => r.kind === "fee" && r.paid_at == null)
    .sort((a, b) => b.due_date.localeCompare(a.due_date))[0];
  if (!pendingFee) {
    throw new Error("No outstanding fee to roll over");
  }
  const nextDue = addMonths(pendingFee.due_date, 1);

  // 1. Mark this period's fee collected — record it in the ledger and update
  //    the installment cache to match.
  const { error: ledgerError } = await supabase.from("payments").insert({
    owner_id: loan.owner_id,
    loan_id: loanId,
    installment_id: pendingFee.id,
    amount: fee,
    paid_at: today(),
  });
  if (ledgerError) throw ledgerError;
  const { error: payError } = await supabase
    .from("installments")
    .update({ paid_amount: fee, paid_at: today(), status: "paid" })
    .eq("id", pendingFee.id);
  if (payError) throw payError;

  // 2. Charge a fresh fee for next period.
  const { error: newFeeError } = await supabase.from("installments").insert({
    owner_id: loan.owner_id,
    loan_id: loanId,
    due_date: nextDue,
    amount: fee,
    status: "pending",
    kind: "fee",
  });
  if (newFeeError) throw newFeeError;

  // 3. Carry the principal forward to the new period.
  const principalRow = rows.find((r) => r.kind === "principal");
  if (principalRow) {
    const { error: prinError } = await supabase
      .from("installments")
      .update({ due_date: nextDue })
      .eq("id", principalRow.id);
    if (prinError) throw prinError;
  }

  // 4. The collected fee is new profit — grow the total receivable by it.
  const { error: updError } = await supabase
    .from("loans")
    .update({ total_receivable: round2(loan.total_receivable + fee) })
    .eq("id", loanId);
  if (updError) throw updError;

  await syncLoanStatus(loanId);
}

/** Recomputes and persists a loan's status from its installments. */
/**
 * Renegotiates a loan: carries its outstanding balance (optionally + late
 * charges, − discount) into a NEW loan with a fresh schedule, then closes the
 * old loan at what was actually collected. No cash payment is recorded for the
 * carried balance, so received/cash reports stay accurate.
 */
export async function renegotiateLoan(
  oldId: string,
  input: RenegotiateInput,
): Promise<Loan> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = user!.id;

  const { data: oldLoan, error } = await supabase
    .from("loans")
    .select("*")
    .eq("id", oldId)
    .single();
  if (error) throw error;
  if (oldLoan.renegotiated_to_id) {
    throw new Error("This loan was already renegotiated.");
  }

  const { data: insts, error: instErr } = await supabase
    .from("installments")
    .select("*")
    .eq("loan_id", oldId);
  if (instErr) throw instErr;
  const rows = (insts ?? []) as Installment[];

  const asOf = today();
  const lateCfg = {
    feePercent: oldLoan.late_fee_percent ?? 0,
    interestPercentMonth: oldLoan.late_interest_percent_month ?? 0,
  };
  const lateTotal = totalLateCharges(rows, asOf, lateCfg);
  const outstanding = round2(
    rows
      .filter((i) => !i.paid_at && i.amount - (i.paid_amount ?? 0) > 0)
      .reduce((s, i) => s + (i.amount - (i.paid_amount ?? 0)), 0),
  );

  const principal = renegotiationPrincipal(outstanding, lateTotal, {
    includeLateCharges: input.include_late_charges,
    discount: input.discount,
  });
  if (principal <= 0) throw new Error("There is no balance to renegotiate.");
  if (input.total_receivable < principal) {
    throw new Error(
      "The new total must be at least the carried balance.",
    );
  }

  // 1. Create the new loan, linked to the old one.
  const { data: newLoan, error: createErr } = await supabase
    .from("loans")
    .insert({
      owner_id: ownerId,
      customer_id: oldLoan.customer_id,
      principal,
      total_receivable: input.total_receivable,
      loan_date: asOf,
      late_fee_percent: oldLoan.late_fee_percent,
      late_interest_percent_month: oldLoan.late_interest_percent_month,
      renegotiated_from_id: oldId,
      status: "open",
    })
    .select("*")
    .single();
  if (createErr) throw createErr;

  // 2. Fresh schedule for the new loan.
  const planned = planInstallments(
    input.total_receivable,
    input.installment_count,
    input.first_due_date,
  );
  const { error: newInstErr } = await supabase.from("installments").insert(
    planned.map((p) => ({
      owner_id: ownerId,
      loan_id: newLoan.id,
      due_date: p.due_date,
      amount: p.amount,
      status: "pending" as const,
    })),
  );
  if (newInstErr) throw newInstErr;
  await syncLoanStatus(newLoan.id);

  // 3. Close the old loan at what was actually collected.
  const paidSoFar = round2(rows.reduce((s, i) => s + (i.paid_amount ?? 0), 0));
  for (const i of rows) {
    if (i.paid_at) continue;
    if ((i.paid_amount ?? 0) <= 0) {
      // Fully unpaid (no ledger payments) → safe to remove.
      await supabase.from("installments").delete().eq("id", i.id);
    } else {
      // Partially paid → close it at the collected amount; the remainder is
      // carried into the new loan. Keeps the real payments intact.
      await supabase
        .from("installments")
        .update({ amount: i.paid_amount ?? 0, paid_at: asOf, status: "paid" })
        .eq("id", i.id);
    }
  }
  const { error: closeErr } = await supabase
    .from("loans")
    .update({
      total_receivable: paidSoFar,
      status: "paid",
      renegotiated_to_id: newLoan.id,
      renegotiated_at: new Date().toISOString(),
    })
    .eq("id", oldId);
  if (closeErr) throw closeErr;

  return newLoan;
}

export async function syncLoanStatus(loanId: string): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("installments")
    .select("status, due_date, paid_at")
    .eq("loan_id", loanId);
  if (error) throw error;

  const status = deriveLoanStatus((data ?? []) as Installment[]);
  const { error: updateError } = await supabase
    .from("loans")
    .update({ status })
    .eq("id", loanId);
  if (updateError) throw updateError;
}
