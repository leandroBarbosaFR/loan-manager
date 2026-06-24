import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { CustomerForm } from "../../customer-form";
import { updateCustomerAction } from "../../actions";
import { getCustomer, listCustomers } from "@/lib/repositories/customers";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customer, customers, t] = await Promise.all([
    getCustomer(id),
    listCustomers(),
    getT(),
  ]);
  if (!customer) notFound();

  const action = updateCustomerAction.bind(null, id);
  // A customer cannot refer themselves.
  const referralOptions = customers
    .filter((c) => c.id !== id)
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <div>
      <PageHeader title={t("customerDetail.editTitle")} />
      <CustomerForm
        action={action}
        customer={customer}
        submitLabel={t("customerDetail.saveChanges")}
        referralOptions={referralOptions}
      />
    </div>
  );
}
