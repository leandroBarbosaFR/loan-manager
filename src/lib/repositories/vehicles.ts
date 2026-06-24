import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Vehicle, VehicleMaintenance, VehicleType } from "@/types/database";
import type { VehicleInput, MaintenanceInput } from "@/lib/validations";

export async function listVehicles(type?: VehicleType): Promise<Vehicle[]> {
  const supabase = await createClient();
  let query = supabase.from("vehicles").select("*").order("name");
  if (type) query = query.eq("type", type);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("vehicles")
    .insert({ ...input, owner_id: user!.id })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateVehicle(
  id: string,
  input: VehicleInput,
): Promise<Vehicle> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteVehicle(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Maintenance / revision log
// ---------------------------------------------------------------------------

export async function listMaintenance(
  vehicleId: string,
): Promise<VehicleMaintenance[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicle_maintenance")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("service_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addMaintenance(
  vehicleId: string,
  input: MaintenanceInput,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("vehicle_maintenance").insert({
    owner_id: user!.id,
    vehicle_id: vehicleId,
    service_date: input.service_date,
    description: input.description,
    cost: input.cost,
    odometer: input.odometer,
  });
  if (error) throw error;
}

export async function deleteMaintenance(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("vehicle_maintenance")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
