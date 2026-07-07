import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Stat, StatGrid } from "@/components/stat";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { DeleteButton } from "@/components/delete-button";
import { RolloverButton } from "@/components/rollover-button";
import { SettleLoanButton } from "@/components/settle-loan-button";
import { PaymentControl } from "@/components/payment-control";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { getLoan } from "@/lib/repositories/loans";
import { listPaymentsByLoan } from "@/lib/repositories/payments";
import {
  deleteLoanAction,
  rollOverLoanAction,
  settleLoanAction,
} from "../actions";
import {
  loanTotals,
  effectiveInstallmentStatus,
  lateCharge,
  totalLateCharges,
  round2,
} from "@/lib/calc";
import { formatMoney, formatDate, today } from "@/lib/format";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [loan, payments, t] = await Promise.all([
    getLoan(id),
    listPaymentsByLoan(id),
    getT(),
  ]);
  if (!loan) notFound();

  const totals = loanTotals(loan, loan.installments);
  const asOf = today();
  const lateConfig = {
    feePercent: loan.late_fee_percent ?? 0,
    interestPercentMonth: loan.late_interest_percent_month ?? 0,
  };
  const lateTotal = totalLateCharges(loan.installments, asOf, lateConfig);
  const hasLate = lateTotal > 0;
  const settleAmount = round2(
    loan.installments
      .filter((i) => !i.paid_at && i.amount - (i.paid_amount ?? 0) > 0)
      .reduce((sum, i) => sum + (i.amount - (i.paid_amount ?? 0)), 0),
  );
  const canSettle = loan.status !== "paid" && settleAmount > 0;
  const deleteAction = deleteLoanAction.bind(null, id);
  const rollOverAction = rollOverLoanAction.bind(null, id);
  const settleAction = settleLoanAction.bind(null, id);
  const isRollover = loan.rollover_fee != null;
  const canRollOver =
    isRollover &&
    loan.status !== "paid" &&
    loan.installments.some(
      (i) => i.kind === "fee" && effectiveInstallmentStatus(i) !== "paid",
    );

  return (
    <div>
      <BackButton fallbackHref="/loans" />
      <PageHeader
        title={loan.customer?.name ?? t("loanDetail.loanTitle")}
        description={t("loanDetail.issued", { date: formatDate(loan.loan_date) })}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={loan.status} />
            {canRollOver ? (
              <RolloverButton
                action={rollOverAction}
                label={t("loanDetail.rolloverButton")}
                confirmMessage={t("loanDetail.rolloverConfirm", {
                  fee: formatMoney(loan.rollover_fee ?? 0),
                })}
              />
            ) : null}
            {canSettle ? (
              <SettleLoanButton
                action={settleAction}
                date={asOf}
                label={t("loanDetail.settleButton")}
                confirmMessage={t("loanDetail.settleConfirm", {
                  amount: formatMoney(settleAmount),
                })}
              />
            ) : null}
            {canSettle ? (
              <Link href={`/loans/${id}/renegotiate`}>
                <Button variant="outline">
                  {t("loanDetail.renegotiateButton")}
                </Button>
              </Link>
            ) : null}
            <Link href={`/loans/${id}/edit`}>
              <Button variant="outline">{t("common.edit")}</Button>
            </Link>
          </div>
        }
      />

      {loan.renegotiated_to_id ? (
        <div className="mb-4 rounded-lg bg-muted px-3 py-2 text-sm">
          {t("renegotiate.toBanner")}{" "}
          <Link
            href={`/loans/${loan.renegotiated_to_id}`}
            className="font-medium underline-offset-2 hover:underline"
          >
            {t("common.view")}
          </Link>
        </div>
      ) : null}
      {loan.renegotiated_from_id ? (
        <div className="mb-4 rounded-lg bg-muted px-3 py-2 text-sm">
          {t("renegotiate.fromBanner")}{" "}
          <Link
            href={`/loans/${loan.renegotiated_from_id}`}
            className="font-medium underline-offset-2 hover:underline"
          >
            {t("common.view")}
          </Link>
        </div>
      ) : null}

      {isRollover ? (
        <div className="mb-4 rounded-lg bg-muted px-3 py-2 text-sm">
          {t("loanDetail.rolloverBannerPrefix")}{" "}
          <span className="font-medium tabular-nums">
            {formatMoney(loan.rollover_fee ?? 0)}
          </span>{" "}
          {t("loanDetail.rolloverBannerSuffix")}
        </div>
      ) : null}

      <StatGrid>
        <Stat label={t("loanDetail.principal")} value={formatMoney(totals.principal)} />
        <Stat label={t("loanDetail.receivable")} value={formatMoney(totals.receivable)} />
        <Stat
          label={t("loanDetail.profit")}
          value={formatMoney(totals.profit)}
          emphasis="success"
        />
        <Stat
          label={t("common.paid")}
          value={formatMoney(totals.paid)}
          emphasis="success"
        />
        <Stat
          label={t("loanDetail.outstanding")}
          value={formatMoney(totals.outstanding)}
          emphasis="warning"
        />
        {hasLate ? (
          <>
            <Stat
              label={t("loanDetail.lateCharges")}
              value={formatMoney(lateTotal)}
              emphasis="destructive"
            />
            <Stat
              label={t("loanDetail.totalToday")}
              value={formatMoney(round2(totals.outstanding + lateTotal))}
              emphasis="warning"
            />
          </>
        ) : null}
        {loan.customer ? (
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("common.customer")}
            </p>
            <Link
              href={`/customers/${loan.customer.id}`}
              className="mt-2 block text-sm underline-offset-2 hover:underline"
            >
              {loan.customer.name}
            </Link>
          </div>
        ) : null}
      </StatGrid>

      {loan.notes ? (
        <div className="mt-6 rounded-lg bg-white p-4 text-sm shadow-sm">
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            {t("loanDetail.notes")}
          </p>
          <p className="whitespace-pre-wrap">{loan.notes}</p>
        </div>
      ) : null}

      <h2 className="mb-3 mt-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {t("loanDetail.installments")}
      </h2>

      {loan.installments.length === 0 ? (
        <EmptyState
          title={t("loanDetail.noInstallmentsTitle")}
          description={t("loanDetail.noInstallmentsDescription")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>{t("loanDetail.colDueDate")}</TableHead>
              <TableHead className="text-right">{t("common.amount")}</TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                {t("common.paid")}
              </TableHead>
              <TableHead className="hidden md:table-cell">
                {t("loanDetail.colPaidOn")}
              </TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loan.installments.map((inst, i) => {
              const lc = lateCharge(inst, asOf, lateConfig);
              return (
              <TableRow key={inst.id}>
                <TableCell className="text-muted-foreground">
                  {inst.kind === "fee"
                    ? t("loanDetail.kindFee")
                    : inst.kind === "principal"
                      ? t("loanDetail.kindPrincipal")
                      : i + 1}
                </TableCell>
                <TableCell>
                  {formatDate(inst.due_date)}
                  {lc.total > 0 ? (
                    <div className="text-xs tabular-nums text-destructive">
                      {t("loanDetail.daysLate", { days: lc.daysLate })} · +
                      {formatMoney(lc.total)}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(inst.amount)}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                  {inst.paid_amount != null
                    ? formatMoney(inst.paid_amount)
                    : t("common.dash")}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(inst.paid_at)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={effectiveInstallmentStatus(inst)} />
                </TableCell>
                <TableCell>
                  <PaymentControl installment={inst} />
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

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

      <div className="mt-8 border-t border-border pt-4">
        <DeleteButton
          action={deleteAction}
          label={t("loanDetail.deleteLabel")}
          confirmMessage={t("loanDetail.deleteConfirm")}
        />
      </div>
    </div>
  );
}
