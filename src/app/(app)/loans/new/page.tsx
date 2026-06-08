import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { LoanForm } from "../loan-form";
import { createLoanAction } from "../actions";
import { listCustomers } from "@/lib/repositories/customers";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function NewLoanPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer } = await searchParams;
  const [customers, t] = await Promise.all([listCustomers(), getT()]);

  return (
    <div>
      <PageHeader title={t("loans.new")} />
      {customers.length === 0 ? (
        <EmptyState
          title={t("loans.needCustomerTitle")}
          description={t("loans.needCustomerDescription")}
          action={
            <Link href="/customers/new">
              <Button>{t("customers.new")}</Button>
            </Link>
          }
        />
      ) : (
        <LoanForm
          action={createLoanAction}
          customers={customers}
          defaultCustomerId={customer}
          submitLabel={t("loans.create")}
        />
      )}
    </div>
  );
}
