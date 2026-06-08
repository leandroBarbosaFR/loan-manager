import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/search-input";
import { EmptyState } from "@/components/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { listCustomers } from "@/lib/repositories/customers";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [customers, t] = await Promise.all([listCustomers(q), getT()]);

  return (
    <div>
      <PageHeader
        title={t("customers.title")}
        description={t("customers.description")}
        action={
          <Link href="/customers/new">
            <Button>{t("customers.new")}</Button>
          </Link>
        }
      />

      <div className="mb-4">
        <SearchInput placeholder={t("customers.searchPlaceholder")} />
      </div>

      {customers.length === 0 ? (
        <EmptyState
          title={q ? t("customers.noMatchTitle") : t("customers.emptyTitle")}
          description={q ? undefined : t("customers.emptyDescription")}
          action={
            !q ? (
              <Link href="/customers/new">
                <Button>{t("customers.new")}</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("customers.colName")}</TableHead>
              <TableHead>{t("customers.colPhone")}</TableHead>
              <TableHead>{t("customers.colNotes")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/customers/${c.id}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {c.name}
                  </Link>
                </TableCell>
                <TableCell>{c.phone ?? t("common.dash")}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {c.notes ?? t("common.dash")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
