"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { useActionToast } from "@/components/toast";
import {
  registerRentalPaymentAction,
  clearRentalPaymentAction,
} from "@/app/(app)/rentals/actions";
import type { RentalInstallment } from "@/types/database";
import { today, formatMoney } from "@/lib/format";
import { effectiveInstallmentStatus, round2 } from "@/lib/calc";
import { useT } from "@/lib/i18n/context";

export function RentalPaymentControl({
  installment,
}: {
  installment: RentalInstallment;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const action = registerRentalPaymentAction.bind(
    null,
    installment.id,
    installment.rental_id,
  );
  const [state, formAction] = useActionState(action, null);

  useActionToast(state, t("toast.paymentRegistered"));

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  const isPaid = effectiveInstallmentStatus(installment) === "paid";
  const paidSoFar = installment.paid_amount ?? 0;
  const remaining = round2(installment.amount - paidSoFar);
  const isPartial = !isPaid && paidSoFar > 0;

  const clear = clearRentalPaymentAction.bind(
    null,
    installment.id,
    installment.rental_id,
  );

  if (isPaid) {
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
      <div className="flex items-center justify-end gap-2">
        {isPartial ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatMoney(paidSoFar)} / {formatMoney(installment.amount)}
          </span>
        ) : null}
        <Button size="sm" onClick={() => setOpen(true)}>
          {isPartial ? t("payment.payRemaining") : t("payment.markPaid")}
        </Button>
      </div>
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
          min="0.01"
          max={installment.amount}
          inputMode="decimal"
          defaultValue={remaining}
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
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
