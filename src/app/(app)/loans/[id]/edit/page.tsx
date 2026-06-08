import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { LoanForm } from "../../loan-form";
import { InstallmentScheduleForm } from "../../installment-schedule-form";
import { updateLoanAction, updateScheduleAction } from "../../actions";
import { getLoan } from "@/lib/repositories/loans";
import { listCustomers } from "@/lib/repositories/customers";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function EditLoanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [loan, customers, t] = await Promise.all([
    getLoan(id),
    listCustomers(),
    getT(),
  ]);
  if (!loan) notFound();

  const action = updateLoanAction.bind(null, id);
  const scheduleAction = updateScheduleAction.bind(null, id);

  return (
    <div>
      <PageHeader title={t("loanDetail.editTitle")} />
      <LoanForm
        action={action}
        customers={customers}
        loan={loan}
        allowInstallments={false}
        submitLabel={t("loanDetail.saveChanges")}
      />

      {loan.installments.length > 0 ? (
        <div className="mt-10 max-w-lg">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {t("schedule.heading")}
          </h2>
          <InstallmentScheduleForm
            action={scheduleAction}
            installments={loan.installments}
          />
        </div>
      ) : null}
    </div>
  );
}
