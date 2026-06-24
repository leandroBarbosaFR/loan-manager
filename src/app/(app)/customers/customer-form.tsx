"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { CustomerSearchSelect } from "@/components/customer-search-select";
import type { ActionState } from "@/lib/action-state";
import type { Customer } from "@/types/database";
import { useT } from "@/lib/i18n/context";

type Action = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function CustomerForm({
  action,
  customer,
  requireDetails = false,
  submitLabel,
  referralOptions = [],
}: {
  action: Action;
  customer?: Customer;
  /** When true (new customers), profile/address fields are required in the UI. */
  requireDetails?: boolean;
  submitLabel?: string;
  /** Other customers that can be picked as the referrer ("indicação"). */
  referralOptions?: { id: string; name: string }[];
}) {
  const t = useT();
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="max-w-lg">
      <FormError message={state?.error} />

      <FormField
        label={t("customerForm.fullName")}
        htmlFor="name"
        errors={state?.fieldErrors?.name}
      >
        <Input id="name" name="name" defaultValue={customer?.name ?? ""} required />
      </FormField>

      <FormField
        label={t("customerForm.birthday")}
        htmlFor="birthday"
        errors={state?.fieldErrors?.birthday}
      >
        <Input
          id="birthday"
          name="birthday"
          type="date"
          defaultValue={customer?.birthday ?? ""}
          required={requireDetails}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[6rem_1fr]">
        <FormField
          label={t("customerForm.ddd")}
          htmlFor="phone_ddd"
          errors={state?.fieldErrors?.phone_ddd}
        >
          <Input
            id="phone_ddd"
            name="phone_ddd"
            type="tel"
            inputMode="numeric"
            placeholder="11"
            defaultValue={customer?.phone_ddd ?? ""}
            required={requireDetails}
          />
        </FormField>
        <FormField
          label={t("customerForm.phoneNumber")}
          htmlFor="phone"
          errors={state?.fieldErrors?.phone}
        >
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="91234-5678"
            defaultValue={customer?.phone ?? ""}
            required={requireDetails}
          />
        </FormField>
      </div>

      <fieldset className="mb-4 border border-border p-4">
        <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("customerForm.address")}
        </legend>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[1fr_8rem]">
          <FormField
            label={t("customerForm.street")}
            htmlFor="street"
            errors={state?.fieldErrors?.street}
          >
            <Input
              id="street"
              name="street"
              defaultValue={customer?.street ?? ""}
              required={requireDetails}
            />
          </FormField>
          <FormField
            label={t("customerForm.number")}
            htmlFor="street_number"
            errors={state?.fieldErrors?.street_number}
          >
            <Input
              id="street_number"
              name="street_number"
              defaultValue={customer?.street_number ?? ""}
              required={requireDetails}
            />
          </FormField>
        </div>

        <FormField
          label={t("customerForm.neighborhood")}
          htmlFor="neighborhood"
          errors={state?.fieldErrors?.neighborhood}
        >
          <Input
            id="neighborhood"
            name="neighborhood"
            defaultValue={customer?.neighborhood ?? ""}
            required={requireDetails}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
          <FormField
            label={t("customerForm.cep")}
            htmlFor="cep"
            errors={state?.fieldErrors?.cep}
          >
            <Input
              id="cep"
              name="cep"
              inputMode="numeric"
              placeholder="00000-000"
              defaultValue={customer?.cep ?? ""}
              required={requireDetails}
            />
          </FormField>
          <FormField
            label={t("customerForm.city")}
            htmlFor="city"
            errors={state?.fieldErrors?.city}
          >
            <Input
              id="city"
              name="city"
              defaultValue={customer?.city ?? ""}
              required={requireDetails}
            />
          </FormField>
          <FormField
            label={t("customerForm.state")}
            htmlFor="state"
            errors={state?.fieldErrors?.state}
          >
            <Input
              id="state"
              name="state"
              placeholder="SP"
              defaultValue={customer?.state ?? ""}
              required={requireDetails}
            />
          </FormField>
        </div>
      </fieldset>

      <FormField
        label={t("customerForm.referredBy")}
        htmlFor="referred_by_id"
        hint={t("customerForm.referredByHint")}
        errors={state?.fieldErrors?.referred_by_id}
      >
        <CustomerSearchSelect
          name="referred_by_id"
          options={referralOptions}
          defaultId={customer?.referred_by_id ?? null}
          placeholder={t("customerForm.referredByPlaceholder")}
          clearLabel={t("common.clear")}
        />
      </FormField>

      <FormField
        label={t("customerForm.documents")}
        htmlFor="documents"
        hint={t("customerForm.documentsHint")}
        errors={state?.fieldErrors?.documents}
      >
        <Input
          id="documents"
          name="documents"
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="h-auto py-1.5"
        />
      </FormField>

      <FormField
        label={t("customerForm.notes")}
        htmlFor="notes"
        errors={state?.fieldErrors?.notes}
      >
        <Textarea id="notes" name="notes" defaultValue={customer?.notes ?? ""} />
      </FormField>

      <SubmitButton>{submitLabel ?? t("customerForm.submit")}</SubmitButton>
    </form>
  );
}
