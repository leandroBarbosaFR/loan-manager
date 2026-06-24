"use client";

import { useActionState, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { UnsavedChangesGuard } from "@/components/unsaved-changes-guard";
import type { ActionState } from "@/lib/action-state";
import { round2 } from "@/lib/calc";
import { formatMoney, today } from "@/lib/format";
import { useT } from "@/lib/i18n/context";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function RentalForm({
  action,
  vehicleId,
  customers,
}: {
  action: Action;
  vehicleId: string;
  customers: { id: string; name: string }[];
}) {
  const t = useT();
  const [state, formAction] = useActionState(action, null);
  const [rate, setRate] = useState("");
  const [count, setCount] = useState("1");

  const total = useMemo(
    () => round2((Number(rate) || 0) * (Number(count) || 0)),
    [rate, count],
  );

  return (
    <form action={formAction} className="max-w-lg">
      <UnsavedChangesGuard />
      <FormError message={state?.error} />
      <input type="hidden" name="vehicle_id" value={vehicleId} />

      <FormField
        label={t("rentalForm.customer")}
        htmlFor="customer_id"
        errors={state?.fieldErrors?.customer_id}
      >
        <Select id="customer_id" name="customer_id" defaultValue="" required>
          <option value="" disabled>
            {t("rentalForm.selectCustomer")}
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField label={t("rentalForm.periodType")} htmlFor="period_type">
          <Select id="period_type" name="period_type" defaultValue="monthly">
            <option value="daily">{t("rentalForm.daily")}</option>
            <option value="weekly">{t("rentalForm.weekly")}</option>
            <option value="monthly">{t("rentalForm.monthly")}</option>
          </Select>
        </FormField>
        <FormField
          label={t("rentalForm.periodCount")}
          htmlFor="period_count"
          errors={state?.fieldErrors?.period_count}
        >
          <Input
            id="period_count"
            name="period_count"
            type="number"
            min="1"
            max="365"
            inputMode="numeric"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField
          label={t("rentalForm.rate")}
          htmlFor="rate"
          errors={state?.fieldErrors?.rate}
        >
          <Input
            id="rate"
            name="rate"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
          />
        </FormField>
        <FormField label={t("rentalForm.deposit")} htmlFor="deposit">
          <Input
            id="deposit"
            name="deposit"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0"
          />
        </FormField>
      </div>

      <FormField
        label={t("rentalForm.startDate")}
        htmlFor="start_date"
        errors={state?.fieldErrors?.start_date}
      >
        <Input
          id="start_date"
          name="start_date"
          type="date"
          defaultValue={today()}
          required
        />
      </FormField>

      <p className="mb-4 text-sm text-muted-foreground">
        {t("rentalForm.total")}:{" "}
        <span className="font-medium tabular-nums text-foreground">
          {formatMoney(total)}
        </span>
      </p>

      <FormField label={t("rentalForm.notes")} htmlFor="notes">
        <Textarea id="notes" name="notes" />
      </FormField>

      <SubmitButton>{t("rentalForm.submit")}</SubmitButton>
    </form>
  );
}
