import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/search-input";
import { Pagination } from "@/components/pagination";
import { FeatureTour } from "@/components/feature-tour";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { listLoans } from "@/lib/repositories/loans";
import { refreshOverdueStatuses } from "@/lib/repositories/installments";
import { formatMoney, formatDate, today } from "@/lib/format";
import { round2, nextDueDate } from "@/lib/calc";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function LoansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await refreshOverdueStatuses();
  const { q, page } = await searchParams;
  const [all, t] = await Promise.all([listLoans(), getT()]);

  const query = (q ?? "").trim().toLowerCase();
  const filtered = query
    ? all.filter((loan) => {
        const name = loan.customer?.name?.toLowerCase() ?? "";
        return (
          name.includes(query) ||
          String(loan.principal).includes(query) ||
          String(loan.total_receivable).includes(query)
        );
      })
    : all;

  // Decorate with each loan's next payment date and sort the most urgent
  // (soonest / overdue) first; loans with nothing outstanding go last.
  const decorated = filtered
    .map((loan) => ({ loan, nextDue: nextDueDate(loan.installments) }))
    .sort((a, b) => {
      if (a.nextDue === b.nextDue) return 0;
      if (a.nextDue === null) return 1;
      if (b.nextDue === null) return -1;
      return a.nextDue.localeCompare(b.nextDue);
    });

  const totalPages = Math.max(1, Math.ceil(decorated.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const loans = decorated.slice(start, start + PAGE_SIZE);
  const todayStr = today();

  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", q!.trim());
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/loans?${qs}` : "/loans";
  };

  return (
    <div>
      <PageHeader
        title={t("loans.title")}
        description={t("loans.description")}
        action={
          <div className="flex items-center gap-2">
            <FeatureTour id="loans" />
            <Link href="/loans/new" data-tour="new-loan">
              <Button>{t("loans.new")}</Button>
            </Link>
          </div>
        }
      />

      {all.length === 0 ? (
        <EmptyState
          title={t("loans.emptyTitle")}
          description={t("loans.emptyDescription")}
          action={
            <Link href="/loans/new">
              <Button>{t("loans.new")}</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-4">
            <SearchInput placeholder={t("loans.searchPlaceholder")} />
          </div>

          {loans.length === 0 ? (
            <EmptyState
              title={t("loans.noMatchTitle")}
              description={t("loans.noMatchDescription")}
            />
          ) : (
            <>
        {/* Mobile: cards */}
        <div className="space-y-3 md:hidden">
          {loans.map(({ loan, nextDue }) => {
            const overdue = nextDue != null && nextDue < todayStr;
            return (
              <Link
                key={loan.id}
                href={`/loans/${loan.id}`}
                className="block rounded-lg border border-border bg-white p-4 shadow-xs transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium">{loan.customer?.name ?? "—"}</span>
                  <StatusBadge status={loan.status} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      {t("loans.colNextPayment")}
                    </dt>
                    <dd
                      className={
                        overdue ? "font-medium text-destructive" : undefined
                      }
                    >
                      {nextDue ? formatDate(nextDue) : t("common.dash")}
                    </dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-xs text-muted-foreground">
                      {t("loans.colAmountLoaned")}
                    </dt>
                    <dd className="tabular-nums">{formatMoney(loan.principal)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      {t("loans.colReceivable")}
                    </dt>
                    <dd className="tabular-nums">
                      {formatMoney(loan.total_receivable)}
                    </dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-xs text-muted-foreground">
                      {t("loans.colProfit")}
                    </dt>
                    <dd className="tabular-nums">
                      {formatMoney(round2(loan.total_receivable - loan.principal))}
                    </dd>
                  </div>
                </dl>
              </Link>
            );
          })}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.customer")}</TableHead>
              <TableHead>{t("loans.colNextPayment")}</TableHead>
              <TableHead className="text-right">{t("loans.colAmountLoaned")}</TableHead>
              <TableHead className="hidden text-right md:table-cell">
                {t("loans.colReceivable")}
              </TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                {t("loans.colProfit")}
              </TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map(({ loan, nextDue }) => {
              const overdue = nextDue != null && nextDue < todayStr;
              const rowClass =
                loan.status === "paid"
                  ? "bg-green-50"
                  : loan.status === "overdue"
                    ? "bg-red-50"
                    : undefined;
              return (
                <TableRow key={loan.id} className={rowClass}>
                  <TableCell className="font-medium">
                    {loan.customer?.name ?? "—"}
                  </TableCell>
                  <TableCell
                    className={
                      overdue ? "font-medium text-destructive" : undefined
                    }
                  >
                    {nextDue ? formatDate(nextDue) : t("common.dash")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(loan.principal)}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums md:table-cell">
                    {formatMoney(loan.total_receivable)}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">
                    {formatMoney(round2(loan.total_receivable - loan.principal))}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={loan.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/loans/${loan.id}`}
                      className="text-sm underline-offset-2 hover:underline"
                    >
                      {t("common.view")}
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                makeHref={makeHref}
                summary={t("pagination.summary", {
                  current: currentPage,
                  total: totalPages,
                })}
                previousLabel={t("pagination.previous")}
                nextLabel={t("pagination.next")}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
