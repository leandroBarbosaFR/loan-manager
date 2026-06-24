import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Stat, StatGrid } from "@/components/stat";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { DeleteButton } from "@/components/delete-button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  getCustomer,
  listCustomerDocuments,
  getDocumentUrl,
} from "@/lib/repositories/customers";
import { listLoansByCustomer } from "@/lib/repositories/loans";
import { deleteCustomerAction, deleteCustomerDocumentAction } from "../actions";
import { loanTotals, round2 } from "@/lib/calc";
import { formatMoney, formatDate } from "@/lib/format";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customer, loans, documents, t] = await Promise.all([
    getCustomer(id),
    listLoansByCustomer(id),
    listCustomerDocuments(id),
    getT(),
  ]);
  if (!customer) notFound();

  const referredBy = customer.referred_by_id
    ? await getCustomer(customer.referred_by_id)
    : null;

  const docs = await Promise.all(
    documents.map(async (doc) => ({
      ...doc,
      url: await getDocumentUrl(doc.path),
    })),
  );

  const phone = customer.phone_ddd
    ? `(${customer.phone_ddd}) ${customer.phone ?? ""}`.trim()
    : customer.phone;

  const addressLines = [
    [customer.street, customer.street_number].filter(Boolean).join(", "),
    customer.neighborhood,
    [customer.city, customer.state].filter(Boolean).join(" - "),
    customer.cep,
  ].filter((line) => line && line.length > 0);

  const totals = loans.reduce(
    (acc, loan) => {
      const t = loanTotals(loan, loan.installments);
      return {
        borrowed: round2(acc.borrowed + t.principal),
        expected: round2(acc.expected + t.receivable),
        paid: round2(acc.paid + t.paid),
        outstanding: round2(acc.outstanding + t.outstanding),
      };
    },
    { borrowed: 0, expected: 0, paid: 0, outstanding: 0 },
  );

  const deleteAction = deleteCustomerAction.bind(null, id);

  return (
    <div>
      <PageHeader
        title={customer.name}
        description={phone ?? undefined}
        action={
          <div className="flex gap-2">
            <Link href={`/customers/${id}/edit`}>
              <Button variant="outline">{t("common.edit")}</Button>
            </Link>
            <Link href={`/loans/new?customer=${id}`}>
              <Button>{t("customerDetail.newLoan")}</Button>
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-4 text-sm shadow-sm">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            {t("customerDetail.profile")}
          </p>
          <dl className="space-y-1">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("customerDetail.birthday")}</dt>
              <dd>
                {customer.birthday
                  ? formatDate(customer.birthday)
                  : t("common.dash")}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("customerDetail.phone")}</dt>
              <dd>{phone || t("common.dash")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("customerDetail.address")}</dt>
              <dd className="text-right">
                {addressLines.length > 0
                  ? addressLines.map((line, i) => <div key={i}>{line}</div>)
                  : t("common.dash")}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("customerDetail.referredBy")}</dt>
              <dd className="text-right">
                {referredBy ? (
                  <Link
                    href={`/customers/${referredBy.id}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {referredBy.name}
                  </Link>
                ) : (
                  t("common.dash")
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 text-sm shadow-sm">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            {t("customerDetail.documents")}
          </p>
          {docs.length === 0 ? (
            <p className="text-muted-foreground">{t("customerDetail.noDocuments")}</p>
          ) : (
            <ul className="space-y-1">
              {docs.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-2">
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate underline-offset-2 hover:underline"
                    >
                      {doc.name}
                    </a>
                  ) : (
                    <span className="truncate">{doc.name}</span>
                  )}
                  <DeleteButton
                    action={deleteCustomerDocumentAction.bind(null, doc.id, id)}
                    label={t("common.remove")}
                    confirmMessage={t("customerDetail.removeDocConfirm")}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {customer.notes ? (
        <div className="mb-6 rounded-lg border border-border bg-white p-4 text-sm shadow-sm">
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            {t("loanDetail.notes")}
          </p>
          <p className="whitespace-pre-wrap">{customer.notes}</p>
        </div>
      ) : null}

      <StatGrid>
        <Stat label={t("customerDetail.totalBorrowed")} value={formatMoney(totals.borrowed)} />
        <Stat label={t("customerDetail.totalExpected")} value={formatMoney(totals.expected)} />
        <Stat
          label={t("customerDetail.totalPaid")}
          value={formatMoney(totals.paid)}
          emphasis="success"
        />
        <Stat
          label={t("customerDetail.outstanding")}
          value={formatMoney(totals.outstanding)}
          emphasis="warning"
        />
      </StatGrid>

      <h2 className="mb-3 mt-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {t("customerDetail.loanHistory")}
      </h2>

      {loans.length === 0 ? (
        <EmptyState
          title={t("customerDetail.noLoansTitle")}
          action={
            <Link href={`/loans/new?customer=${id}`}>
              <Button>{t("customerDetail.newLoan")}</Button>
            </Link>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.date")}</TableHead>
              <TableHead className="text-right">{t("customerDetail.colPrincipal")}</TableHead>
              <TableHead className="hidden text-right md:table-cell">
                {t("customerDetail.colReceivable")}
              </TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                {t("common.paid")}
              </TableHead>
              <TableHead className="text-right">{t("customerDetail.colOutstanding")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => {
              const lt = loanTotals(loan, loan.installments);
              return (
                <TableRow key={loan.id}>
                  <TableCell>{formatDate(loan.loan_date)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(lt.principal)}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums md:table-cell">
                    {formatMoney(lt.receivable)}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">
                    {formatMoney(lt.paid)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(lt.outstanding)}
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
      )}

      <div className="mt-8 border-t border-border pt-4">
        <DeleteButton
          action={deleteAction}
          label={t("customerDetail.deleteLabel")}
          confirmMessage={t("customerDetail.deleteConfirm")}
        />
      </div>
    </div>
  );
}
