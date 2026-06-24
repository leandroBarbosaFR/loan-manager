import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { RentalForm } from "../../../rentals/rental-form";
import { createRentalAction } from "../../../rentals/actions";
import { getVehicle } from "@/lib/repositories/vehicles";
import { getActiveRentalForVehicle } from "@/lib/repositories/rentals";
import { listCustomers } from "@/lib/repositories/customers";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function RentVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [vehicle, active, customers, t] = await Promise.all([
    getVehicle(id),
    getActiveRentalForVehicle(id),
    listCustomers(),
    getT(),
  ]);
  if (!vehicle) notFound();
  // Already rented out → send to the active rental.
  if (active) redirect(`/rentals/${active.id}`);

  return (
    <div>
      <PageHeader
        title={t("rentalForm.title")}
        description={vehicle.name}
      />
      <RentalForm
        action={createRentalAction}
        vehicleId={id}
        customers={customers.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
