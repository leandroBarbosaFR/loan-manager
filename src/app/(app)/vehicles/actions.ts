"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { vehicleSchema, maintenanceSchema } from "@/lib/validations";
import { zodToFieldErrors, type ActionState } from "@/lib/action-state";
import {
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addMaintenance,
  deleteMaintenance,
} from "@/lib/repositories/vehicles";

function parseVehicle(formData: FormData) {
  return vehicleSchema.safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    brand: formData.get("brand"),
    model_year: formData.get("model_year"),
    color: formData.get("color"),
    plate: formData.get("plate"),
    chassis: formData.get("chassis"),
    doors: formData.get("doors"),
    has_gps: formData.get("has_gps") === "on",
    can_remote_block: formData.get("can_remote_block") === "on",
    had_accident: formData.get("had_accident") === "on",
    has_insurance: formData.get("has_insurance") === "on",
    insurance_company: formData.get("insurance_company"),
    insurance_expiry: formData.get("insurance_expiry"),
    ipva_paid: formData.get("ipva_paid") === "on",
    ipva_due_date: formData.get("ipva_due_date"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  });
}

export async function createVehicleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseVehicle(formData);
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  const vehicle = await createVehicle(parsed.data);
  revalidatePath("/vehicles");
  redirect(`/vehicles/${vehicle.id}?flash=vehicle_created`);
}

export async function updateVehicleAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseVehicle(formData);
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  await updateVehicle(id, parsed.data);
  revalidatePath("/vehicles");
  revalidatePath(`/vehicles/${id}`);
  redirect(`/vehicles/${id}?flash=vehicle_updated`);
}

export async function deleteVehicleAction(id: string): Promise<void> {
  await deleteVehicle(id);
  revalidatePath("/vehicles");
  redirect("/vehicles?flash=vehicle_deleted");
}

export async function addMaintenanceAction(
  vehicleId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = maintenanceSchema.safeParse({
    service_date: formData.get("service_date"),
    description: formData.get("description"),
    cost: formData.get("cost"),
    odometer: formData.get("odometer"),
  });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  await addMaintenance(vehicleId, parsed.data);
  revalidatePath(`/vehicles/${vehicleId}`);
  return { ok: true };
}

export async function deleteMaintenanceAction(
  id: string,
  vehicleId: string,
): Promise<void> {
  await deleteMaintenance(id);
  revalidatePath(`/vehicles/${vehicleId}`);
}
