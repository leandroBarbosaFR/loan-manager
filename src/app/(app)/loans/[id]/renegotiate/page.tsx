import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { RenegotiateForm } from "../../renegotiate-form";
import { renegotiateLoanAction } from "../../actions";
import { getLoan } from "@/lib/repositories/loans";
import { round2, totalLateCharges } from "@/lib/calc";
import { addMonths, today } from "@/lib/format";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function RenegotiateLoanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [loan, t] = await Promise.all([getLoan(id), getT()]);
  if (!loan) notFound();

  // Already renegotiated, or nothing left to renegotiate → back to the loan.
  const outstanding = round2(
    loan.installments
      .filter((i) => !i.paid_at && i.amount - (i.paid_amount ?? 0) > 0)
      .reduce((s, i) => s + (i.amount - (i.paid_amount ?? 0)), 0),
  );
  if (loan.renegotiated_to_id || outstanding <= 0) {
    redirect(`/loans/${id}`);
  }

  const lateCharges = totalLateCharges(loan.installments, today(), {
    feePercent: loan.late_fee_percent ?? 0,
    interestPercentMonth: loan.late_interest_percent_month ?? 0,
  });

  const action = renegotiateLoanAction.bind(null, id);

  return (
    <div>
      <PageHeader
        title={t("renegotiate.title")}
        description={loan.customer?.name ?? undefined}
      />
      <RenegotiateForm
        action={action}
        outstanding={outstanding}
        lateCharges={lateCharges}
        defaultFirstDueDate={addMonths(today(), 1)}
      />
    </div>
  );
}
