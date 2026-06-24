import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Stat, StatGrid } from "@/components/stat";
import { StatusBadge } from "@/components/status-badge";
import { RolloverButton } from "@/components/rollover-button";
import { RentalPaymentControl } from "@/components/rental-payment-control";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { getRental, listRentalPayments } from "@/lib/repositories/rentals";
import { closeRentalAction } from "../actions";
import { loanTotals, effectiveInstallmentStatus } from "@/lib/calc";
import { formatMoney, formatDate } from "@/lib/format";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function RentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [rental, payments, t] = await Promise.all([
    getRental(id),
    listRentalPayments(id),
    getT(),
  ]);
  if (!rental) notFound();

  const totals = loanTotals(
    { principal: rental.total, total_receivable: rental.total },
    rental.installments,
  );
  const periodLabel = t(`rentalForm.${rental.period_type}`);
  const closeAction = closeRentalAction.bind(null, id);

  return (
    <div>
      <PageHeader
        title={rental.vehicle?.name ?? t("rentals.title")}
        description={rental.customer?.name ?? undefined}
        action={
          <div className="flex items-center gap-2">
            {rental.status === "active" ? (
              <RolloverButton
                action={closeAction}
                label={t("rentals.closeButton")}
                confirmMessage={t("rentals.closeConfirm")}
              />
            ) : (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {t("rentals.closed")}
              </span>
            )}
          </div>
        }
      />

      <StatGrid>
        <Stat
          label={t("rentalForm.rate")}
          value={`${formatMoney(rental.rate)} / ${periodLabel}`}
        />
        <Stat label={t("rentals.total")} value={formatMoney(rental.total)} />
        <Stat
          label={t("common.paid")}
          value={formatMoney(totals.paid)}
          emphasis="success"
        />
        <Stat
          label={t("rentals.outstanding")}
          value={formatMoney(totals.outstanding)}
          emphasis="warning"
        />
      </StatGrid>

      {rental.deposit > 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("rentalForm.deposit")}:{" "}
          <span className="font-medium tabular-nums text-foreground">
            {formatMoney(rental.deposit)}
          </span>
        </p>
      ) : null}

      <h2 className="mb-3 mt-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {t("rentals.schedule")}
      </h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>{t("loanDetail.colDueDate")}</TableHead>
            <TableHead className="text-right">{t("common.amount")}</TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              {t("common.paid")}
            </TableHead>
            <TableHead>{t("common.status")}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rental.installments.map((inst) => (
            <TableRow key={inst.id}>
              <TableCell className="text-muted-foreground">
                {inst.period_index}
              </TableCell>
              <TableCell>{formatDate(inst.due_date)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(inst.amount)}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">
                {inst.paid_amount != null
                  ? formatMoney(inst.paid_amount)
                  : t("common.dash")}
              </TableCell>
              <TableCell>
                <StatusBadge status={effectiveInstallmentStatus(inst)} />
              </TableCell>
              <TableCell>
                <RentalPaymentControl installment={inst} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2 className="mb-3 mt-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {t("payment.history")}
      </h2>
      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("payment.noPayments")}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("payment.paidOn")}</TableHead>
              <TableHead className="text-right">{t("common.amount")}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("payment.note")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{formatDate(p.paid_at)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(p.amount)}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {p.note ?? t("common.dash")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="mt-8">
        <Link
          href={`/vehicles/${rental.vehicle_id}`}
          className="text-sm underline-offset-2 hover:underline"
        >
          {rental.vehicle?.name}
        </Link>
      </div>
    </div>
  );
}
