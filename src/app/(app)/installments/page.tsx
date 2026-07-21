import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { FilterTabs } from "@/components/filter-tabs";
import { PaymentControl } from "@/components/payment-control";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  listInstallments,
  refreshOverdueStatuses,
  countByStatus,
  type InstallmentFilter,
} from "@/lib/repositories/installments";
import { effectiveInstallmentStatus, lateCharge } from "@/lib/calc";
import { formatMoney, formatDate, today } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import type { InstallmentWithRelations } from "@/types/database";

export const dynamic = "force-dynamic";

/** Late charge accrued on an installment as of today, from its loan's config. */
function lateChargeFor(inst: InstallmentWithRelations): number {
  const loan = inst.loan;
  if (!loan) return 0;
  return lateCharge(inst, today(), {
    feePercent: loan.late_fee_percent ?? 0,
    interestPercentMonth: loan.late_interest_percent_month ?? 0,
    dailyFee: loan.late_daily_fee ?? 0,
  }).total;
}

const FILTERS: InstallmentFilter[] = ["all", "pending", "paid", "overdue"];

export default async function InstallmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await refreshOverdueStatuses();
  const { status } = await searchParams;
  const t = await getT();
  const filter: InstallmentFilter = FILTERS.includes(status as InstallmentFilter)
    ? (status as InstallmentFilter)
    : "all";

  // Load all once for counts, then filter in-memory for the view.
  const all = await listInstallments("all");
  const counts = countByStatus(all);
  const rows =
    filter === "all"
      ? all
      : all.filter((r) => effectiveInstallmentStatus(r) === filter);

  return (
    <div>
      <PageHeader title={t("installments.title")}>
        <FilterTabs
          basePath="/installments"
          active={filter}
          options={[
            { value: "all", label: t("installments.filterAll"), count: counts.all },
            {
              value: "pending",
              label: t("installments.filterPending"),
              count: counts.pending,
            },
            { value: "paid", label: t("installments.filterPaid"), count: counts.paid },
            {
              value: "overdue",
              label: t("installments.filterOverdue"),
              count: counts.overdue,
            },
          ]}
        />
      </PageHeader>

      {rows.length === 0 ? (
        <EmptyState title={t("installments.empty")} />
      ) : (
        <>
        {/* Mobile: cards */}
        <div className="space-y-3 md:hidden">
          {rows.map((inst) => (
            <div
              key={inst.id}
              className="rounded-lg bg-surface p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium">
                  {inst.loan?.customer ? (
                    <Link
                      href={`/customers/${inst.loan.customer.id}`}
                      className="underline-offset-2 hover:underline"
                    >
                      {inst.loan.customer.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </span>
                <StatusBadge status={effectiveInstallmentStatus(inst)} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t("installments.colDueDate")}
                  </dt>
                  <dd>{formatDate(inst.due_date)}</dd>
                </div>
                <div className="text-right">
                  <dt className="text-xs text-muted-foreground">
                    {t("common.amount")}
                  </dt>
                  <dd className="tabular-nums">{formatMoney(inst.amount)}</dd>
                </div>
                <div className="text-right">
                  <dt className="text-xs text-muted-foreground">{t("common.paid")}</dt>
                  <dd className="tabular-nums">
                    {inst.paid_amount != null
                      ? formatMoney(inst.paid_amount)
                      : t("common.dash")}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                {inst.loan ? (
                  <Link
                    href={`/loans/${inst.loan.id}`}
                    className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                  >
                    {t("installments.loanLink")}
                  </Link>
                ) : (
                  <span />
                )}
                <PaymentControl installment={inst} lateCharge={lateChargeFor(inst)} />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.customer")}</TableHead>
              <TableHead>{t("installments.colDueDate")}</TableHead>
              <TableHead className="text-right">{t("common.amount")}</TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                {t("common.paid")}
              </TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((inst) => (
              <TableRow key={inst.id}>
                <TableCell className="font-medium">
                  {inst.loan?.customer ? (
                    <Link
                      href={`/customers/${inst.loan.customer.id}`}
                      className="underline-offset-2 hover:underline"
                    >
                      {inst.loan.customer.name}
                    </Link>
                  ) : (
                    "—"
                  )}
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
                  <div className="flex items-center justify-end gap-2">
                    {inst.loan ? (
                      <Link
                        href={`/loans/${inst.loan.id}`}
                        className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                      >
                        {t("installments.loanLink")}
                      </Link>
                    ) : null}
                    <PaymentControl installment={inst} lateCharge={lateChargeFor(inst)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
        </>
      )}
    </div>
  );
}
