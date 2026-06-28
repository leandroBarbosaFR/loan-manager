"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { UnsavedChangesGuard } from "@/components/unsaved-changes-guard";
import { useActionToast } from "@/components/toast";
import type { ActionState } from "@/lib/action-state";
import type { Profile } from "@/types/database";
import { useT } from "@/lib/i18n/context";
import { updateProfileAction } from "./actions";

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const t = useT();
  const [state, formAction] = useActionState(updateProfileAction, null);
  useActionToast(state, t("settings.profileSaved"));

  return (
    <form action={formAction} className="max-w-3xl">
      <UnsavedChangesGuard />
      <FormError message={state?.error} />

      <FormField
        label={t("users.fullName")}
        htmlFor="full_name"
        errors={state?.fieldErrors?.full_name}
      >
        <Input
          id="full_name"
          name="full_name"
          defaultValue={profile?.full_name ?? ""}
          required
        />
      </FormField>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField label={t("settings.emailReadonly")} htmlFor="email_ro">
          <Input id="email_ro" defaultValue={profile?.email ?? ""} disabled />
        </FormField>
        <FormField label={t("users.phone")} htmlFor="phone" errors={state?.fieldErrors?.phone}>
          <Input id="phone" name="phone" type="tel" defaultValue={profile?.phone ?? ""} />
        </FormField>
      </div>

      <fieldset className="mb-4 rounded-lg border border-border bg-white p-4 shadow-sm">
        <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("users.address")}
        </legend>
        <FormField label={t("users.street")} htmlFor="street">
          <Input id="street" name="street" defaultValue={profile?.street ?? ""} />
        </FormField>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <FormField label={t("users.city")} htmlFor="city" errors={state?.fieldErrors?.city}>
            <Input id="city" name="city" defaultValue={profile?.city ?? ""} required />
          </FormField>
          <FormField
            label={t("users.country")}
            htmlFor="country"
            errors={state?.fieldErrors?.country}
          >
            <Input
              id="country"
              name="country"
              defaultValue={profile?.country ?? ""}
              required
            />
          </FormField>
        </div>
      </fieldset>

      <SubmitButton>{t("common.save")}</SubmitButton>
    </form>
  );
}
