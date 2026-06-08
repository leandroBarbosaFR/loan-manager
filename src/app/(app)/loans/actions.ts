"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loanSchema, installmentScheduleSchema } from "@/lib/validations";
import { zodToFieldErrors, type ActionState } from "@/lib/action-state";
import {
  createLoan,
  updateLoan,
  deleteLoan,
  rollOverLoan,
} from "@/lib/repositories/loans";
import { updateInstallmentSchedule } from "@/lib/repositories/installments";

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
  revalidatePath("/");
  redirect(`/loans/${loan.id}`);
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
    generate_installments: false,
  });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  await updateLoan(id, parsed.data);
  revalidatePath("/loans");
  revalidatePath(`/loans/${id}`);
  redirect(`/loans/${id}`);
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
  revalidatePath("/");
  return { ok: true };
}

export async function rollOverLoanAction(id: string): Promise<void> {
  await rollOverLoan(id);
  revalidatePath("/loans");
  revalidatePath(`/loans/${id}`);
  revalidatePath("/installments");
  revalidatePath("/");
}

export async function deleteLoanAction(id: string): Promise<void> {
  await deleteLoan(id);
  revalidatePath("/loans");
  revalidatePath("/");
  redirect("/loans");
}
