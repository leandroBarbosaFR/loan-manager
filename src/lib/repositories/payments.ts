import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Payment } from "@/types/database";
import { aggregatePayments, round2 } from "@/lib/calc";
import { syncLoanStatus } from "@/lib/repositories/loans";

export async function listPaymentsByLoan(loanId: string): Promise<Payment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("loan_id", loanId)
    .order("paid_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/**
 * Recomputes an installment's cached paid state (paid_amount/paid_at/status)
 * from its ledger payments. Call after any insert/delete of its payments.
 */
export async function recomputeInstallment(installmentId: string): Promise<void> {
  const supabase = await createClient();

  const { data: inst, error: instErr } = await supabase
    .from("installments")
    .select("amount")
    .eq("id", installmentId)
    .single();
  if (instErr) throw instErr;

  const { data: pays, error: payErr } = await supabase
    .from("payments")
    .select("amount, paid_at")
    .eq("installment_id", installmentId);
  if (payErr) throw payErr;

  const state = aggregatePayments(inst.amount, pays ?? []);
  const { error: updErr } = await supabase
    .from("installments")
    .update(state)
    .eq("id", installmentId);
  if (updErr) throw updErr;
}

/** Records a payment (full or partial) and refreshes the derived caches. */
export async function addPayment(opts: {
  installmentId: string;
  loanId: string;
  amount: number;
  paidAt: string;
  note?: string | null;
}): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("payments").insert({
    owner_id: user!.id,
    loan_id: opts.loanId,
    installment_id: opts.installmentId,
    amount: opts.amount,
    paid_at: opts.paidAt,
    note: opts.note ?? null,
  });
  if (error) throw error;

  await recomputeInstallment(opts.installmentId);
  await syncLoanStatus(opts.loanId);
}

/** Reverses a single payment from the ledger. */
export async function reversePayment(
  paymentId: string,
  installmentId: string,
  loanId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("payments").delete().eq("id", paymentId);
  if (error) throw error;
  await recomputeInstallment(installmentId);
  await syncLoanStatus(loanId);
}

/**
 * Early settlement: pays off the full remaining balance of every open
 * installment as of `paidAt`, closing the loan. Recorded as real ledger
 * payments so history/totals stay consistent.
 */
export async function settleLoan(
  loanId: string,
  paidAt: string,
  note?: string | null,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: insts, error } = await supabase
    .from("installments")
    .select("id, amount, paid_amount, paid_at")
    .eq("loan_id", loanId);
  if (error) throw error;

  const rows = (insts ?? []).filter(
    (i) => !i.paid_at && round2(i.amount - (i.paid_amount ?? 0)) > 0,
  );
  if (rows.length === 0) {
    await syncLoanStatus(loanId);
    return;
  }

  const payments = rows.map((i) => ({
    owner_id: user!.id,
    loan_id: loanId,
    installment_id: i.id,
    amount: round2(i.amount - (i.paid_amount ?? 0)),
    paid_at: paidAt,
    note: note ?? null,
  }));
  const { error: insErr } = await supabase.from("payments").insert(payments);
  if (insErr) throw insErr;

  for (const i of rows) await recomputeInstallment(i.id);
  await syncLoanStatus(loanId);
}

/** Removes ALL payments of an installment (full undo) and resets its cache. */
export async function clearInstallmentPayments(
  installmentId: string,
  loanId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("installment_id", installmentId);
  if (error) throw error;
  await recomputeInstallment(installmentId);
  await syncLoanStatus(loanId);
}
