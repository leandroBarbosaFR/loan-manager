"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SubmitButton } from "@/components/submit-button";
import { useActionToast } from "@/components/toast";
import {
  registerPaymentAction,
  clearPaymentAction,
} from "@/app/(app)/installments/actions";
import type { Installment } from "@/types/database";
import { today, formatMoney } from "@/lib/format";
import { effectiveInstallmentStatus, round2 } from "@/lib/calc";
import { useT } from "@/lib/i18n/context";

export function PaymentControl({
  installment,
  lateCharge = 0,
}: {
  installment: Installment;
  /** Late charge accrued on this installment as of today (0 = none). */
  lateCharge?: number;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const action = registerPaymentAction.bind(
    null,
    installment.id,
    installment.loan_id,
  );
  const [state, formAction] = useActionState(action, null);

  useActionToast(state, t("toast.paymentRegistered"));

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  const isPaid = effectiveInstallmentStatus(installment) === "paid";
  const paidSoFar = installment.paid_amount ?? 0;
  const remaining = round2(installment.amount - paidSoFar);
  const late = round2(lateCharge);
  // What the borrower owes today, including any late charge.
  const dueToday = round2(remaining + late);
  const isPartial = !isPaid && paidSoFar > 0;

  if (isPaid) {
    const clear = clearPaymentAction.bind(
      null,
      installment.id,
      installment.loan_id,
    );
    return (
      <form action={clear}>
        <Button type="submit" variant="destructive" size="sm">
          {t("payment.undo")}
        </Button>
      </form>
    );
  }

  const title = isPartial ? t("payment.payRemaining") : t("payment.markPaid");

  return (
    <div className="flex items-center justify-end gap-2">
      {isPartial ? (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatMoney(paidSoFar)} / {formatMoney(installment.amount)}
        </span>
      ) : null}
      <Button size="sm" onClick={() => setOpen(true)}>
        {title}
      </Button>
      {isPartial ? (
        <ClearButton
          installmentId={installment.id}
          loanId={installment.loan_id}
          label={t("payment.undo")}
        />
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor={`paid_amount_${installment.id}`}
              className="mb-1 block text-sm font-medium"
            >
              {t("common.amount")}
              <span className="ml-1 text-xs font-normal text-muted-foreground tabular-nums">
                ({t("payment.remaining")} {formatMoney(remaining)})
              </span>
            </label>
            <Input
              id={`paid_amount_${installment.id}`}
              name="paid_amount"
              type="number"
              step="0.01"
              min="0.01"
              max={dueToday}
              inputMode="decimal"
              defaultValue={dueToday}
              autoFocus
              required
            />
            {late > 0 ? (
              <p className="mt-1 text-xs text-warning tabular-nums">
                {t("payment.includesLate", {
                  base: formatMoney(remaining),
                  late: formatMoney(late),
                })}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                {t("payment.amountHelp")}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor={`paid_at_${installment.id}`}
              className="mb-1 block text-sm font-medium"
            >
              {t("payment.paidOn")}
            </label>
            <Input
              id={`paid_at_${installment.id}`}
              name="paid_at"
              type="date"
              defaultValue={today()}
              required
            />
          </div>
          <div>
            <label
              htmlFor={`note_${installment.id}`}
              className="mb-1 block text-sm font-medium"
            >
              {t("payment.note")}
            </label>
            <Input id={`note_${installment.id}`} name="note" />
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <SubmitButton>{t("common.save")}</SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ClearButton({
  installmentId,
  loanId,
  label,
}: {
  installmentId: string;
  loanId: string;
  label: string;
}) {
  const clear = clearPaymentAction.bind(null, installmentId, loanId);
  return (
    <form action={clear}>
      <Button type="submit" variant="destructive" size="sm">
        {label}
      </Button>
    </form>
  );
}
