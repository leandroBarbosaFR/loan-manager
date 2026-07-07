"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { UnsavedChangesGuard } from "@/components/unsaved-changes-guard";
import type { ActionState } from "@/lib/action-state";
import type { Vehicle } from "@/types/database";
import { useT } from "@/lib/i18n/context";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 py-1.5 text-sm font-medium">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 border-border"
      />
      {label}
    </label>
  );
}

export function VehicleForm({
  action,
  vehicle,
  submitLabel,
}: {
  action: Action;
  vehicle?: Vehicle;
  submitLabel?: string;
}) {
  const t = useT();
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="max-w-3xl">
      <UnsavedChangesGuard />
      <FormError message={state?.error} />

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField label={t("vehicleForm.type")} htmlFor="type">
          <Select id="type" name="type" defaultValue={vehicle?.type ?? "car"}>
            <option value="car">{t("vehicles.car")}</option>
            <option value="motorcycle">{t("vehicles.motorcycle")}</option>
          </Select>
        </FormField>
        <FormField
          label={t("vehicleForm.name")}
          htmlFor="name"
          errors={state?.fieldErrors?.name}
        >
          <Input id="name" name="name" defaultValue={vehicle?.name ?? ""} required />
        </FormField>
      </div>

      <fieldset
        data-tour="vf-specs"
        className="mb-4 rounded-lg bg-white p-4 shadow-sm"
      >
        <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("vehicleForm.specs")}
        </legend>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label={t("vehicleForm.brand")} htmlFor="brand">
            <Input id="brand" name="brand" defaultValue={vehicle?.brand ?? ""} />
          </FormField>
          <FormField label={t("vehicleForm.year")} htmlFor="model_year">
            <Input
              id="model_year"
              name="model_year"
              type="number"
              inputMode="numeric"
              defaultValue={vehicle?.model_year ?? ""}
            />
          </FormField>
          <FormField label={t("vehicleForm.color")} htmlFor="color">
            <Input id="color" name="color" defaultValue={vehicle?.color ?? ""} />
          </FormField>
          <FormField label={t("vehicleForm.doors")} htmlFor="doors">
            <Input
              id="doors"
              name="doors"
              type="number"
              inputMode="numeric"
              defaultValue={vehicle?.doors ?? ""}
            />
          </FormField>
          <FormField label={t("vehicleForm.plate")} htmlFor="plate">
            <Input id="plate" name="plate" defaultValue={vehicle?.plate ?? ""} />
          </FormField>
          <FormField label={t("vehicleForm.chassis")} htmlFor="chassis">
            <Input id="chassis" name="chassis" defaultValue={vehicle?.chassis ?? ""} />
          </FormField>
        </div>
      </fieldset>

      <fieldset
        data-tour="vf-features"
        className="mb-4 rounded-lg bg-white p-4 shadow-sm"
      >
        <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("vehicleForm.features")}
        </legend>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
          <Check name="has_gps" label={t("vehicleForm.hasGps")} defaultChecked={vehicle?.has_gps} />
          <Check
            name="can_remote_block"
            label={t("vehicleForm.canRemoteBlock")}
            defaultChecked={vehicle?.can_remote_block}
          />
          <Check
            name="had_accident"
            label={t("vehicleForm.hadAccident")}
            defaultChecked={vehicle?.had_accident}
          />
        </div>
      </fieldset>

      <fieldset
        data-tour="vf-docs"
        className="mb-4 rounded-lg bg-white p-4 shadow-sm"
      >
        <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("vehicleForm.documentation")}
        </legend>
        <Check
          name="has_insurance"
          label={t("vehicleForm.hasInsurance")}
          defaultChecked={vehicle?.has_insurance}
        />
        <div className="mt-2 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <FormField label={t("vehicleForm.insuranceCompany")} htmlFor="insurance_company">
            <Input
              id="insurance_company"
              name="insurance_company"
              defaultValue={vehicle?.insurance_company ?? ""}
            />
          </FormField>
          <FormField label={t("vehicleForm.insuranceExpiry")} htmlFor="insurance_expiry">
            <Input
              id="insurance_expiry"
              name="insurance_expiry"
              type="date"
              defaultValue={vehicle?.insurance_expiry ?? ""}
            />
          </FormField>
        </div>
        <Check name="ipva_paid" label={t("vehicleForm.ipvaPaid")} defaultChecked={vehicle?.ipva_paid} />
        <FormField label={t("vehicleForm.ipvaDueDate")} htmlFor="ipva_due_date">
          <Input
            id="ipva_due_date"
            name="ipva_due_date"
            type="date"
            defaultValue={vehicle?.ipva_due_date ?? ""}
          />
        </FormField>
      </fieldset>

      <FormField label={t("vehicleForm.status")} htmlFor="status">
        <Select id="status" name="status" defaultValue={vehicle?.status ?? "available"}>
          <option value="available">{t("vehicles.statusAvailable")}</option>
          <option value="rented">{t("vehicles.statusRented")}</option>
          <option value="maintenance">{t("vehicles.statusMaintenance")}</option>
          <option value="inactive">{t("vehicles.statusInactive")}</option>
        </Select>
      </FormField>

      <FormField label={t("vehicleForm.notes")} htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={vehicle?.notes ?? ""} />
      </FormField>

      <SubmitButton>{submitLabel ?? t("vehicleForm.submit")}</SubmitButton>
    </form>
  );
}
