import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/delete-button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { MaintenanceForm } from "../maintenance-form";
import { getVehicle, listMaintenance } from "@/lib/repositories/vehicles";
import { getActiveRentalForVehicle } from "@/lib/repositories/rentals";
import {
  deleteVehicleAction,
  addMaintenanceAction,
  deleteMaintenanceAction,
} from "../actions";
import { formatMoney, formatDate } from "@/lib/format";
import type { MessageKey } from "@/lib/i18n/dictionaries";
import type { VehicleStatus } from "@/types/database";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

const STATUS_KEY: Record<VehicleStatus, MessageKey> = {
  available: "vehicles.statusAvailable",
  rented: "vehicles.statusRented",
  maintenance: "vehicles.statusMaintenance",
  inactive: "vehicles.statusInactive",
};

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [vehicle, maintenance, activeRental, t] = await Promise.all([
    getVehicle(id),
    listMaintenance(id),
    getActiveRentalForVehicle(id),
    getT(),
  ]);
  if (!vehicle) notFound();

  const yesNo = (v: boolean) => (v ? t("common.yes") : t("common.no"));
  const dash = (v: string | number | null) =>
    v === null || v === "" ? t("common.dash") : String(v);

  const deleteAction = deleteVehicleAction.bind(null, id);
  const addMaintenance = addMaintenanceAction.bind(null, id);

  const specs: [string, string][] = [
    [t("vehicleForm.brand"), dash(vehicle.brand)],
    [t("vehicleForm.year"), dash(vehicle.model_year)],
    [t("vehicleForm.color"), dash(vehicle.color)],
    [t("vehicleForm.plate"), dash(vehicle.plate)],
    [t("vehicleForm.chassis"), dash(vehicle.chassis)],
  ];
  if (vehicle.type === "car") {
    specs.push([t("vehicleForm.doors"), dash(vehicle.doors)]);
  }

  return (
    <div>
      <PageHeader
        title={vehicle.name}
        description={t(
          vehicle.type === "car" ? "vehicles.car" : "vehicles.motorcycle",
        )}
        action={
          <div className="flex items-center gap-2">
            <Badge variant={vehicle.status === "available" ? "paid" : "default"}>
              {t(STATUS_KEY[vehicle.status])}
            </Badge>
            {activeRental ? (
              <Link href={`/rentals/${activeRental.id}`}>
                <Button variant="outline">{t("rentals.viewRental")}</Button>
              </Link>
            ) : vehicle.status === "available" ? (
              <Link href={`/vehicles/${id}/rent`}>
                <Button>{t("vehicleDetail.rentButton")}</Button>
              </Link>
            ) : null}
            <Link href={`/vehicles/${id}/edit`}>
              <Button variant="outline">{t("common.edit")}</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-4 text-sm shadow-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("vehicleDetail.specs")}
          </p>
          <dl className="space-y-1">
            {specs.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 text-sm shadow-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("vehicleDetail.features")}
          </p>
          <dl className="space-y-1">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("vehicleForm.hasGps")}</dt>
              <dd>{yesNo(vehicle.has_gps)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("vehicleForm.canRemoteBlock")}</dt>
              <dd>{yesNo(vehicle.can_remote_block)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("vehicleForm.hadAccident")}</dt>
              <dd>{yesNo(vehicle.had_accident)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 text-sm shadow-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("vehicleDetail.documentation")}
          </p>
          <dl className="space-y-1">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("vehicleForm.hasInsurance")}</dt>
              <dd>{yesNo(vehicle.has_insurance)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("vehicleForm.insuranceCompany")}</dt>
              <dd className="text-right">{dash(vehicle.insurance_company)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("vehicleForm.insuranceExpiry")}</dt>
              <dd>{vehicle.insurance_expiry ? formatDate(vehicle.insurance_expiry) : t("common.dash")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("vehicleForm.ipvaPaid")}</dt>
              <dd>{yesNo(vehicle.ipva_paid)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("vehicleForm.ipvaDueDate")}</dt>
              <dd>{vehicle.ipva_due_date ? formatDate(vehicle.ipva_due_date) : t("common.dash")}</dd>
            </div>
          </dl>
        </div>
      </div>

      {vehicle.notes ? (
        <div className="mt-4 rounded-lg border border-border bg-white p-4 text-sm shadow-sm">
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            {t("vehicleForm.notes")}
          </p>
          <p className="whitespace-pre-wrap">{vehicle.notes}</p>
        </div>
      ) : null}

      <h2 className="mb-3 mt-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {t("vehicleDetail.maintenance")}
      </h2>

      {maintenance.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("vehicleDetail.noMaintenance")}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("maintenance.date")}</TableHead>
              <TableHead>{t("maintenance.description")}</TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                {t("maintenance.odometer")}
              </TableHead>
              <TableHead className="text-right">{t("maintenance.cost")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenance.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{formatDate(m.service_date)}</TableCell>
                <TableCell>{m.description}</TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                  {m.odometer ?? t("common.dash")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(m.cost)}
                </TableCell>
                <TableCell className="text-right">
                  <DeleteButton
                    action={deleteMaintenanceAction.bind(null, m.id, id)}
                    label={t("common.remove")}
                    confirmMessage={t("maintenance.removeConfirm")}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <MaintenanceForm action={addMaintenance} />

      <div className="mt-8 border-t border-border pt-4">
        <DeleteButton
          action={deleteAction}
          label={t("vehicleDetail.deleteLabel")}
          confirmMessage={t("vehicleDetail.deleteConfirm")}
        />
      </div>
    </div>
  );
}
