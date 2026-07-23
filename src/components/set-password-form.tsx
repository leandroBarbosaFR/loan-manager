"use client";

import { useActionState } from "react";
import { PasswordInput } from "@/components/password-input";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/lib/action-state";
import { useT } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/dictionaries";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const ERROR_KEYS: Record<string, MessageKey> = {
  weak_password: "password.errWeak",
  password_mismatch: "password.errMismatch",
  update_failed: "password.errFailed",
  wrong_current: "password.errWrongCurrent",
};

export function SetPasswordForm({
  action,
  submitLabel,
  requireCurrent = false,
}: {
  action: Action;
  submitLabel: string;
  /** When true, asks for the current password and verifies it before changing. */
  requireCurrent?: boolean;
}) {
  const t = useT();
  const [state, formAction] = useActionState(action, null);
  const errorKey = state?.error ? ERROR_KEYS[state.error] : undefined;
  const errorMsg = errorKey ? t(errorKey) : (state?.error ?? undefined);

  return (
    <form action={formAction}>
      <FormError message={errorMsg} />
      {requireCurrent ? (
        <FormField label={t("password.current")} htmlFor="current_password">
          <PasswordInput
            id="current_password"
            name="current_password"
            autoComplete="current-password"
            required
          />
        </FormField>
      ) : null}
      <FormField label={t("password.new")} htmlFor="password">
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </FormField>
      <FormField label={t("password.confirm")} htmlFor="confirm">
        <PasswordInput
          id="confirm"
          name="confirm"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </FormField>
      <SubmitButton className="w-full">{submitLabel}</SubmitButton>
    </form>
  );
}
