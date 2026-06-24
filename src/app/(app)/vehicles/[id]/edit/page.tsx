import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { VehicleForm } from "../../vehicle-form";
import { updateVehicleAction } from "../../actions";
import { getVehicle } from "@/lib/repositories/vehicles";
import { getT } from "@/lib/i18n/server";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [vehicle, t] = await Promise.all([getVehicle(id), getT()]);
  if (!vehicle) notFound();

  const action = updateVehicleAction.bind(null, id);

  return (
    <div>
      <PageHeader title={t("vehicleDetail.editTitle")} />
      <VehicleForm
        action={action}
        vehicle={vehicle}
        submitLabel={t("vehicleDetail.saveChanges")}
      />
    </div>
  );
}
