"use client";

import { useActionState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { UnsavedChangesGuard } from "@/components/unsaved-changes-guard";
import { useActionToast } from "@/components/toast";
import type { ActionState } from "@/lib/action-state";
import { useT } from "@/lib/i18n/context";
import { createUserAction } from "./actions";

export function UserForm() {
  const t = useT();
  const [state, formAction] = useActionState(createUserAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useActionToast(state, t("users.invited"));

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="max-w-3xl">
      <UnsavedChangesGuard />
      <FormError message={state?.error} />

      <FormField
        label={t("users.fullName")}
        htmlFor="full_name"
        errors={state?.fieldErrors?.full_name}
      >
        <Input id="full_name" name="full_name" autoComplete="off" required />
      </FormField>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField label={t("users.email")} htmlFor="email" errors={state?.fieldErrors?.email}>
          <Input id="email" name="email" type="email" autoComplete="off" required />
        </FormField>
        <FormField label={t("users.phone")} htmlFor="phone" errors={state?.fieldErrors?.phone}>
          <Input id="phone" name="phone" type="tel" autoComplete="off" />
        </FormField>
      </div>

      <fieldset className="mb-4 rounded-lg bg-white p-4 shadow-sm">
        <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("users.address")}
        </legend>
        <FormField label={t("users.street")} htmlFor="street">
          <Input id="street" name="street" autoComplete="off" />
        </FormField>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <FormField label={t("users.city")} htmlFor="city" errors={state?.fieldErrors?.city}>
            <Input id="city" name="city" autoComplete="off" required />
          </FormField>
          <FormField
            label={t("users.country")}
            htmlFor="country"
            errors={state?.fieldErrors?.country}
          >
            <Input id="country" name="country" autoComplete="off" required />
          </FormField>
        </div>
      </fieldset>

      <FormField label={t("users.role")} htmlFor="role" errors={state?.fieldErrors?.role}>
        <Select id="role" name="role" defaultValue="user">
          <option value="user">{t("users.roleUser")}</option>
          <option value="super_admin">{t("users.roleSuperAdmin")}</option>
        </Select>
      </FormField>

      <SubmitButton>{t("users.create")}</SubmitButton>
    </form>
  );
}
