import { PageHeader } from "@/components/page-header";
import { VehicleForm } from "../vehicle-form";
import { FeatureTour } from "@/components/feature-tour";
import { createVehicleAction } from "../actions";
import { getT } from "@/lib/i18n/server";

export default async function NewVehiclePage() {
  const t = await getT();
  return (
    <div>
      <PageHeader title={t("vehicles.new")} action={<FeatureTour id="vehicleForm" />} />
      <VehicleForm
        action={createVehicleAction}
        submitLabel={t("vehicleForm.create")}
      />
    </div>
  );
}
