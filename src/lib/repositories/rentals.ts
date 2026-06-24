import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Rental,
  RentalPayment,
  RentalWithRelations,
} from "@/types/database";
import type { RentalInput } from "@/lib/validations";
import { aggregatePayments, round2 } from "@/lib/calc";
import { addPeriod } from "@/lib/format";

export async function getRental(id: string): Promise<RentalWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rentals")
    .select("*, vehicle:vehicles(*), customer:customers(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { data: insts, error: instErr } = await supabase
    .from("rental_installments")
    .select("*")
    .eq("rental_id", id)
    .order("period_index", { ascending: true });
  if (instErr) throw instErr;

  return {
    ...(data as unknown as RentalWithRelations),
    installments: insts ?? [],
  };
}

export async function getActiveRentalForVehicle(
  vehicleId: string,
): Promise<Rental | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rentals")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createRental(input: RentalInput): Promise<Rental> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = user!.id;

  const total = round2(input.rate * input.period_count);

  const { data: rental, error } = await supabase
    .from("rentals")
    .insert({
      owner_id: ownerId,
      vehicle_id: input.vehicle_id,
      customer_id: input.customer_id,
      period_type: input.period_type,
      period_count: input.period_count,
      rate: input.rate,
      total,
      deposit: input.deposit,
      start_date: input.start_date,
      notes: input.notes,
    })
    .select("*")
    .single();
  if (error) throw error;

  const rows = Array.from({ length: input.period_count }, (_, i) => ({
    owner_id: ownerId,
    rental_id: rental.id,
    period_index: i + 1,
    due_date: addPeriod(input.start_date, input.period_type, i),
    amount: input.rate,
    status: "pending" as const,
  }));
  const { error: instErr } = await supabase
    .from("rental_installments")
    .insert(rows);
  if (instErr) throw instErr;

  // Mark the vehicle as rented.
  await supabase
    .from("vehicles")
    .update({ status: "rented" })
    .eq("id", input.vehicle_id);

  return rental;
}

/** Closes a rental and frees the vehicle. */
export async function closeRental(rentalId: string): Promise<void> {
  const supabase = await createClient();
  const { data: rental, error } = await supabase
    .from("rentals")
    .update({ status: "closed" })
    .eq("id", rentalId)
    .select("vehicle_id")
    .single();
  if (error) throw error;
  await supabase
    .from("vehicles")
    .update({ status: "available" })
    .eq("id", rental.vehicle_id);
}

// ---------------------------------------------------------------------------
// Payments (mirror the loan ledger on rental tables)
// ---------------------------------------------------------------------------

export async function listRentalPayments(
  rentalId: string,
): Promise<RentalPayment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rental_payments")
    .select("*")
    .eq("rental_id", rentalId)
    .order("paid_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function recomputeRentalInstallment(installmentId: string): Promise<void> {
  const supabase = await createClient();
  const { data: inst, error } = await supabase
    .from("rental_installments")
    .select("amount")
    .eq("id", installmentId)
    .single();
  if (error) throw error;
  const { data: pays, error: payErr } = await supabase
    .from("rental_payments")
    .select("amount, paid_at")
    .eq("rental_installment_id", installmentId);
  if (payErr) throw payErr;

  const state = aggregatePayments(inst.amount, pays ?? []);
  const { error: updErr } = await supabase
    .from("rental_installments")
    .update(state)
    .eq("id", installmentId);
  if (updErr) throw updErr;
}

export async function addRentalPayment(opts: {
  installmentId: string;
  rentalId: string;
  amount: number;
  paidAt: string;
  note?: string | null;
}): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("rental_payments").insert({
    owner_id: user!.id,
    rental_id: opts.rentalId,
    rental_installment_id: opts.installmentId,
    amount: opts.amount,
    paid_at: opts.paidAt,
    note: opts.note ?? null,
  });
  if (error) throw error;
  await recomputeRentalInstallment(opts.installmentId);
}

export async function clearRentalInstallmentPayments(
  installmentId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("rental_payments")
    .delete()
    .eq("rental_installment_id", installmentId);
  if (error) throw error;
  await recomputeRentalInstallment(installmentId);
}
