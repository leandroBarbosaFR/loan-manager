import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/search-input";
import { Pagination } from "@/components/pagination";
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
          <Link href="/loans/new">
            <Button>{t("loans.new")}</Button>
          </Link>
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
