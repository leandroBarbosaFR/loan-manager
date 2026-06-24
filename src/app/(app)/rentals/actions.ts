"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { rentalSchema, installmentPaymentSchema } from "@/lib/validations";
import { zodToFieldErrors, type ActionState } from "@/lib/action-state";
import {
  createRental,
  closeRental,
  addRentalPayment,
  clearRentalInstallmentPayments,
} from "@/lib/repositories/rentals";

export async function createRentalAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = rentalSchema.safeParse({
    vehicle_id: formData.get("vehicle_id"),
    customer_id: formData.get("customer_id"),
    period_type: formData.get("period_type"),
    period_count: formData.get("period_count"),
    rate: formData.get("rate"),
    deposit: formData.get("deposit"),
    start_date: formData.get("start_date"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  const rental = await createRental(parsed.data);
  revalidatePath("/vehicles");
  revalidatePath(`/vehicles/${parsed.data.vehicle_id}`);
  redirect(`/rentals/${rental.id}?flash=rental_created`);
}

export async function closeRentalAction(rentalId: string): Promise<void> {
  await closeRental(rentalId);
  revalidatePath("/vehicles");
  revalidatePath(`/rentals/${rentalId}`);
  redirect(`/rentals/${rentalId}?flash=rental_closed`);
}

export async function registerRentalPaymentAction(
  installmentId: string,
  rentalId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = installmentPaymentSchema.safeParse({
    paid_amount: formData.get("paid_amount"),
    paid_at: formData.get("paid_at"),
    note: formData.get("note"),
  });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  await addRentalPayment({
    installmentId,
    rentalId,
    amount: parsed.data.paid_amount,
    paidAt: parsed.data.paid_at,
    note: parsed.data.note,
  });
  revalidatePath(`/rentals/${rentalId}`);
  return { ok: true };
}

export async function clearRentalPaymentAction(
  installmentId: string,
  rentalId: string,
): Promise<void> {
  await clearRentalInstallmentPayments(installmentId);
  revalidatePath(`/rentals/${rentalId}`);
}
