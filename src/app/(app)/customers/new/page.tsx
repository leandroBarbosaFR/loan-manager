import { PageHeader } from "@/components/page-header";
import { CustomerForm } from "../customer-form";
import { createCustomerAction } from "../actions";
import { getT } from "@/lib/i18n/server";

export default async function NewCustomerPage() {
  const t = await getT();
  return (
    <div>
      <PageHeader title={t("customers.new")} />
      <CustomerForm
        action={createCustomerAction}
        requireDetails
        submitLabel={t("customerForm.create")}
      />
    </div>
  );
}
