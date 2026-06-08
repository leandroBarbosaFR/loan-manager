import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Stat, StatGrid } from "@/components/stat";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { DeleteButton } from "@/components/delete-button";
import { RolloverButton } from "@/components/rollover-button";
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
import { deleteLoanAction, rollOverLoanAction } from "../actions";
import { loanTotals, effectiveInstallmentStatus } from "@/lib/calc";
import { formatMoney, formatDate } from "@/lib/format";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [loan, t] = await Promise.all([getLoan(id), getT()]);
  if (!loan) notFound();

  const totals = loanTotals(loan, loan.installments);
  const deleteAction = deleteLoanAction.bind(null, id);
  const rollOverAction = rollOverLoanAction.bind(null, id);
  const isRollover = loan.rollover_fee != null;
  const canRollOver =
    isRollover &&
    loan.status !== "paid" &&
    loan.installments.some(
      (i) => i.kind === "fee" && effectiveInstallmentStatus(i) !== "paid",
    );

  return (
    <div>
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
            <Link href={`/loans/${id}/edit`}>
              <Button variant="outline">{t("common.edit")}</Button>
            </Link>
          </div>
        }
      />

      {isRollover ? (
        <div className="mb-4 border border-border bg-muted px-3 py-2 text-sm">
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
        {loan.customer ? (
          <div className="border-b border-r border-border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
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
        <div className="mt-6 border border-border p-4 text-sm">
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
              <TableHead className="text-right">{t("common.paid")}</TableHead>
              <TableHead>{t("loanDetail.colPaidOn")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loan.installments.map((inst, i) => (
              <TableRow key={inst.id}>
                <TableCell className="text-muted-foreground">
                  {inst.kind === "fee"
                    ? t("loanDetail.kindFee")
                    : inst.kind === "principal"
                      ? t("loanDetail.kindPrincipal")
                      : i + 1}
                </TableCell>
                <TableCell>{formatDate(inst.due_date)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(inst.amount)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {inst.paid_amount != null
                    ? formatMoney(inst.paid_amount)
                    : t("common.dash")}
                </TableCell>
                <TableCell>{formatDate(inst.paid_at)}</TableCell>
                <TableCell>
                  <StatusBadge status={effectiveInstallmentStatus(inst)} />
                </TableCell>
                <TableCell>
                  <PaymentControl installment={inst} />
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
