"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { UnsavedChangesGuard } from "@/components/unsaved-changes-guard";
import type { ActionState } from "@/lib/action-state";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n/context";

type Action = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function RenegotiateForm({
  action,
  outstanding,
  lateCharges,
  defaultFirstDueDate,
}: {
  action: Action;
  outstanding: number;
  lateCharges: number;
  defaultFirstDueDate: string;
}) {
  const t = useT();
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="max-w-lg">
      <UnsavedChangesGuard />
      <FormError message={state?.error} />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-surface p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("renegotiate.currentBalance")}
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {formatMoney(outstanding)}
          </p>
        </div>
        <div className="rounded-lg bg-surface p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("renegotiate.lateCharges")}
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {formatMoney(lateCharges)}
          </p>
        </div>
      </div>

      {lateCharges > 0 ? (
        <label className="mb-4 flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="include_late_charges"
            className="h-4 w-4 border-border"
          />
          {t("renegotiate.includeLate")}
        </label>
      ) : null}

      <FormField
        label={t("renegotiate.discount")}
        htmlFor="discount"
        errors={state?.fieldErrors?.discount}
      >
        <Input
          id="discount"
          name="discount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0"
        />
      </FormField>

      <FormField
        label={t("renegotiate.newTotal")}
        htmlFor="total_receivable"
        hint={t("renegotiate.newTotalHint")}
        errors={state?.fieldErrors?.total_receivable}
      >
        <Input
          id="total_receivable"
          name="total_receivable"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          defaultValue={outstanding}
          required
        />
      </FormField>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField
          label={t("renegotiate.installmentCount")}
          htmlFor="installment_count"
          errors={state?.fieldErrors?.installment_count}
        >
          <Input
            id="installment_count"
            name="installment_count"
            type="number"
            min="1"
            max="120"
            inputMode="numeric"
            defaultValue={1}
            required
          />
        </FormField>
        <FormField
          label={t("renegotiate.firstDueDate")}
          htmlFor="first_due_date"
          errors={state?.fieldErrors?.first_due_date}
        >
          <Input
            id="first_due_date"
            name="first_due_date"
            type="date"
            defaultValue={defaultFirstDueDate}
            required
          />
        </FormField>
      </div>

      <SubmitButton>{t("renegotiate.submit")}</SubmitButton>
    </form>
  );
}
