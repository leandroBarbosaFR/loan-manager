"use server";

import { revalidatePath } from "next/cache";
import { installmentPaymentSchema } from "@/lib/validations";
import { zodToFieldErrors, type ActionState } from "@/lib/action-state";
import {
  addPayment,
  clearInstallmentPayments,
} from "@/lib/repositories/payments";

function revalidateAll(loanId: string) {
  revalidatePath("/installments");
  revalidatePath("/loans");
  revalidatePath(`/loans/${loanId}`);
  revalidatePath("/");
  revalidatePath("/reports");
}

export async function registerPaymentAction(
  installmentId: string,
  loanId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = installmentPaymentSchema.safeParse({
    paid_amount: formData.get("paid_amount"),
    paid_at: formData.get("paid_at"),
    note: formData.get("note"),
  });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  await addPayment({
    installmentId,
    loanId,
    amount: parsed.data.paid_amount,
    paidAt: parsed.data.paid_at,
    note: parsed.data.note,
  });
  revalidateAll(loanId);
  return { ok: true };
}

export async function clearPaymentAction(
  installmentId: string,
  loanId: string,
): Promise<void> {
  await clearInstallmentPayments(installmentId, loanId);
  revalidateAll(loanId);
}
