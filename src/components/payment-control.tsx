"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import {
  registerPaymentAction,
  clearPaymentAction,
} from "@/app/(app)/installments/actions";
import type { Installment } from "@/types/database";
import { today } from "@/lib/format";
import { effectiveInstallmentStatus } from "@/lib/calc";
import { useT } from "@/lib/i18n/context";

export function PaymentControl({ installment }: { installment: Installment }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const action = registerPaymentAction.bind(
    null,
    installment.id,
    installment.loan_id,
  );
  const [state, formAction] = useActionState(action, null);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  const isPaid = effectiveInstallmentStatus(installment) === "paid";

  if (isPaid) {
    const clear = clearPaymentAction.bind(
      null,
      installment.id,
      installment.loan_id,
    );
    return (
      <form action={clear}>
        <Button type="submit" variant="ghost" size="sm">
          {t("payment.undo")}
        </Button>
      </form>
    );
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        {t("payment.markPaid")}
      </Button>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
    >
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          {t("common.amount")}
        </label>
        <Input
          name="paid_amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          defaultValue={installment.amount}
          className="h-8 w-28"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          {t("payment.paidOn")}
        </label>
        <Input
          name="paid_at"
          type="date"
          defaultValue={today()}
          className="h-8 w-40"
          required
        />
      </div>
      <div className="flex gap-2">
        <SubmitButton size="sm">{t("common.save")}</SubmitButton>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
