import { PageHeader } from "@/components/page-header";
import { CustomerForm } from "../customer-form";
import { createCustomerAction } from "../actions";
import { listCustomers } from "@/lib/repositories/customers";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function NewCustomerPage() {
  const [t, customers] = await Promise.all([getT(), listCustomers()]);
  const referralOptions = customers.map((c) => ({ id: c.id, name: c.name }));
  return (
    <div>
      <PageHeader title={t("customers.new")} />
      <CustomerForm
        action={createCustomerAction}
        requireDetails
        submitLabel={t("customerForm.create")}
        referralOptions={referralOptions}
      />
    </div>
  );
}
