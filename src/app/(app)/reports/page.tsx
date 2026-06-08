import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { refreshOverdueStatuses } from "@/lib/repositories/installments";
import {
  activeLoansReport,
  paidLoansReport,
  overdueLoansReport,
  monthlyCollectionsReport,
  type LoanReportRow,
} from "@/lib/repositories/reports";
import { formatMoney, formatDate } from "@/lib/format";
import type { LoanStatus } from "@/types/database";
import { getT } from "@/lib/i18n/server";
import type { Translator } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

function DownloadLink({ type, label }: { type: string; label: string }) {
  return (
    <a href={`/api/reports?type=${type}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
      {label}
    </a>
  );
}

function LoanReportTable({ rows, t }: { rows: LoanReportRow[]; t: Translator }) {
  if (rows.length === 0) return <EmptyState title={t("reports.nothing")} />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("common.customer")}</TableHead>
          <TableHead>{t("reports.colDate")}</TableHead>
          <TableHead className="text-right">{t("reports.colPrincipal")}</TableHead>
          <TableHead className="text-right">{t("reports.colReceivable")}</TableHead>
          <TableHead className="text-right">{t("reports.colPaid")}</TableHead>
          <TableHead className="text-right">{t("reports.colOutstanding")}</TableHead>
          <TableHead>{t("common.status")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            <TableCell className="font-medium">{r.customer}</TableCell>
            <TableCell>{formatDate(r.loan_date)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatMoney(r.principal)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatMoney(r.receivable)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatMoney(r.paid)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatMoney(r.outstanding)}
            </TableCell>
            <TableCell>
              <StatusBadge status={r.status as LoanStatus} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ReportSection({
  title,
  type,
  exportLabel,
  children,
}: {
  title: string;
  type: string;
  exportLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <DownloadLink type={type} label={exportLabel} />
      </div>
      {children}
    </section>
  );
}

export default async function ReportsPage() {
  await refreshOverdueStatuses();
  const [active, paid, overdue, collections, t] = await Promise.all([
    activeLoansReport(),
    paidLoansReport(),
    overdueLoansReport(),
    monthlyCollectionsReport(),
    getT(),
  ]);
  const exportLabel = t("reports.exportCsv");

  return (
    <div>
      <PageHeader
        title={t("reports.title")}
        description={t("reports.description")}
      />

      <ReportSection
        title={t("reports.activeLoans")}
        type="active"
        exportLabel={exportLabel}
      >
        <LoanReportTable rows={active} t={t} />
      </ReportSection>

      <ReportSection
        title={t("reports.overdueLoans")}
        type="overdue"
        exportLabel={exportLabel}
      >
        <LoanReportTable rows={overdue} t={t} />
      </ReportSection>

      <ReportSection
        title={t("reports.paidLoans")}
        type="paid"
        exportLabel={exportLabel}
      >
        <LoanReportTable rows={paid} t={t} />
      </ReportSection>

      <ReportSection
        title={t("reports.monthlyCollections")}
        type="collections"
        exportLabel={exportLabel}
      >
        {collections.length === 0 ? (
          <EmptyState title={t("reports.noPayments")} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("reports.colMonth")}</TableHead>
                <TableHead className="text-right">{t("reports.colPayments")}</TableHead>
                <TableHead className="text-right">{t("reports.colTotalCollected")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((r) => (
                <TableRow key={r.month}>
                  <TableCell className="font-medium">{r.month}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.count}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(r.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ReportSection>
    </div>
  );
}
