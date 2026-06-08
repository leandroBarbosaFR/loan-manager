import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { CustomerForm } from "../../customer-form";
import { updateCustomerAction } from "../../actions";
import { getCustomer } from "@/lib/repositories/customers";
import { getT } from "@/lib/i18n/server";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customer, t] = await Promise.all([getCustomer(id), getT()]);
  if (!customer) notFound();

  const action = updateCustomerAction.bind(null, id);

  return (
    <div>
      <PageHeader title={t("customerDetail.editTitle")} />
      <CustomerForm
        action={action}
        customer={customer}
        submitLabel={t("customerDetail.saveChanges")}
      />
    </div>
  );
}
