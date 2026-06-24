"use client";

import { useActionState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/lib/action-state";
import { today } from "@/lib/format";
import { useT } from "@/lib/i18n/context";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function MaintenanceForm({ action }: { action: Action }) {
  const t = useT();
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="mt-3">
      <FormError message={state?.error} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            {t("maintenance.date")}
          </label>
          <Input name="service_date" type="date" defaultValue={today()} className="h-9" required />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">
            {t("maintenance.description")}
          </label>
          <Input name="description" className="h-9" required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            {t("maintenance.cost")}
          </label>
          <Input
            name="cost"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            defaultValue="0"
            className="h-9 w-28"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            {t("maintenance.odometer")}
          </label>
          <Input name="odometer" type="number" inputMode="numeric" className="h-9 w-28" />
        </div>
        <SubmitButton>{t("maintenance.add")}</SubmitButton>
      </div>
    </form>
  );
}
