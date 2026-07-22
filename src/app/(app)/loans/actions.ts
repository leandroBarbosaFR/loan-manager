"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  loanSchema,
  installmentScheduleSchema,
  renegotiateSchema,
} from "@/lib/validations";
import { zodToFieldErrors, type ActionState } from "@/lib/action-state";
import {
  createLoan,
  updateLoan,
  deleteLoan,
  rollOverLoan,
  payInterestOnly,
  renegotiateLoan,
} from "@/lib/repositories/loans";
import { updateInstallmentSchedule } from "@/lib/repositories/installments";
import { settleLoan } from "@/lib/repositories/payments";
import { today } from "@/lib/format";
import { round2 } from "@/lib/calc";

function parseInstallments(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || raw.length === 0) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function parse(formData: FormData) {
  return loanSchema.safeParse({
    customer_id: formData.get("customer_id"),
    principal: formData.get("principal"),
    total_receivable: formData.get("total_receivable"),
    loan_date: formData.get("loan_date"),
    notes: formData.get("notes"),
    late_fee_percent: formData.get("late_fee_percent"),
    late_interest_percent_month: formData.get("late_interest_percent_month"),
    late_daily_fee: formData.get("late_daily_fee"),
    rollover: formData.get("rollover") === "on",
    generate_installments: formData.get("generate_installments") === "on",
    installment_count: formData.get("installment_count") || undefined,
    first_due_date: formData.get("first_due_date") || undefined,
    installments: parseInstallments(formData.get("installments_json")),
  });
}

export async function createLoanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parse(formData);
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  const loan = await createLoan(parsed.data);
  revalidatePath("/loans");
  revalidatePath("/dashboard");
  redirect(`/loans/${loan.id}?flash=loan_created`);
}

export async function updateLoanAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Installment generation only happens on create; ignore those fields here.
  const parsed = loanSchema.safeParse({
    customer_id: formData.get("customer_id"),
    principal: formData.get("principal"),
    total_receivable: formData.get("total_receivable"),
    loan_date: formData.get("loan_date"),
    notes: formData.get("notes"),
    late_fee_percent: formData.get("late_fee_percent"),
    late_interest_percent_month: formData.get("late_interest_percent_month"),
    late_daily_fee: formData.get("late_daily_fee"),
    generate_installments: false,
  });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  await updateLoan(id, parsed.data);
  revalidatePath("/loans");
  revalidatePath(`/loans/${id}`);
  redirect(`/loans/${id}?flash=loan_updated`);
}

export async function updateScheduleAction(
  loanId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("schedule_json") ?? "[]"));
  } catch {
    return { ok: false, error: "Could not read the schedule." };
  }

  const parsed = installmentScheduleSchema.safeParse({ items });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  await updateInstallmentSchedule(loanId, parsed.data);
  revalidatePath("/loans");
  revalidatePath(`/loans/${loanId}`);
  revalidatePath("/installments");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function rollOverLoanAction(id: string): Promise<void> {
  await rollOverLoan(id);
  revalidatePath("/loans");
  revalidatePath(`/loans/${id}`);
  revalidatePath("/installments");
  revalidatePath("/dashboard");
}

/** Ad-hoc "pay interest only" for any loan (interest amount + next due date). */
export async function payInterestOnlyAction(
  id: string,
  formData: FormData,
): Promise<void> {
  const feeRaw = Number(formData.get("fee"));
  const fee = Number.isFinite(feeRaw) && feeRaw > 0 ? round2(feeRaw) : undefined;
  const dateRaw = String(formData.get("next_due_date") ?? "");
  const nextDueDate = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : undefined;

  await payInterestOnly(id, { fee, nextDueDate });
  revalidatePath("/loans");
  revalidatePath(`/loans/${id}`);
  revalidatePath("/installments");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function settleLoanAction(
  id: string,
  formData: FormData,
): Promise<void> {
  const raw = String(formData.get("paid_at") ?? "");
  const paidAt = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : today();
  await settleLoan(id, paidAt);
  revalidatePath("/loans");
  revalidatePath(`/loans/${id}`);
  revalidatePath("/installments");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  redirect(`/loans/${id}?flash=loan_settled`);
}

export async function renegotiateLoanAction(
  oldId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = renegotiateSchema.safeParse({
    include_late_charges: formData.get("include_late_charges") === "on",
    discount: formData.get("discount"),
    total_receivable: formData.get("total_receivable"),
    installment_count: formData.get("installment_count"),
    first_due_date: formData.get("first_due_date"),
  });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  let newLoanId: string;
  try {
    const newLoan = await renegotiateLoan(oldId, parsed.data);
    newLoanId = newLoan.id;
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not renegotiate the loan.",
    };
  }

  revalidatePath("/loans");
  revalidatePath(`/loans/${oldId}`);
  revalidatePath("/installments");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  redirect(`/loans/${newLoanId}?flash=loan_renegotiated`);
}

export async function deleteLoanAction(id: string): Promise<void> {
  await deleteLoan(id);
  revalidatePath("/loans");
  revalidatePath("/dashboard");
  redirect("/loans?flash=loan_deleted");
}
