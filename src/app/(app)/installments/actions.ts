"use server";

import { revalidatePath } from "next/cache";
import { installmentPaymentSchema } from "@/lib/validations";
import { zodToFieldErrors, type ActionState } from "@/lib/action-state";
import {
  registerPayment,
  clearPayment,
} from "@/lib/repositories/installments";

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
  });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  await registerPayment(installmentId, loanId, parsed.data);
  revalidateAll(loanId);
  return { ok: true };
}

export async function clearPaymentAction(
  installmentId: string,
  loanId: string,
): Promise<void> {
  await clearPayment(installmentId, loanId);
  revalidateAll(loanId);
}
