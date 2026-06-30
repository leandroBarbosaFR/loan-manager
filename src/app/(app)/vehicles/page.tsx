import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterTabs } from "@/components/filter-tabs";
import { EmptyState } from "@/components/empty-state";
import { FeatureTour } from "@/components/feature-tour";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { listVehicles } from "@/lib/repositories/vehicles";
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

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const vt = type === "car" || type === "motorcycle" ? type : undefined;
  const [vehicles, t] = await Promise.all([listVehicles(vt), getT()]);

  return (
    <div>
      <PageHeader
        title={t("vehicles.title")}
        description={t("vehicles.description")}
        action={
          <div className="flex items-center gap-2">
            <FeatureTour id="vehicles" />
            <Link href="/vehicles/new" data-tour="new-vehicle">
              <Button>{t("vehicles.new")}</Button>
            </Link>
          </div>
        }
      />

      <FilterTabs
        basePath="/vehicles"
        param="type"
        active={vt ?? "all"}
        options={[
          { value: "all", label: t("vehicles.allTypes") },
          { value: "car", label: t("vehicles.car") },
          { value: "motorcycle", label: t("vehicles.motorcycle") },
        ]}
      />

      {vehicles.length === 0 ? (
        <EmptyState
          title={t("vehicles.emptyTitle")}
          description={t("vehicles.emptyDescription")}
          action={
            <Link href="/vehicles/new">
              <Button>{t("vehicles.new")}</Button>
            </Link>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("vehicles.colName")}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("vehicles.colPlate")}
              </TableHead>
              <TableHead>{t("vehicles.colStatus")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/vehicles/${v.id}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {v.name}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {t(v.type === "car" ? "vehicles.car" : "vehicles.motorcycle")}
                  </span>
                </TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">
                  {v.plate ?? t("common.dash")}
                </TableCell>
                <TableCell>
                  <Badge variant={v.status === "available" ? "paid" : "default"}>
                    {t(STATUS_KEY[v.status])}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {v.status === "available" ? (
                    <Link href={`/vehicles/${v.id}/rent`}>
                      <Button size="sm">{t("vehicleDetail.rentButton")}</Button>
                    </Link>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
