import { PageHeader } from "@/components/page-header";
import { VehicleForm } from "../vehicle-form";
import { createVehicleAction } from "../actions";
import { getT } from "@/lib/i18n/server";

export default async function NewVehiclePage() {
  const t = await getT();
  return (
    <div>
      <PageHeader title={t("vehicles.new")} />
      <VehicleForm
        action={createVehicleAction}
        submitLabel={t("vehicleForm.create")}
      />
    </div>
  );
}
