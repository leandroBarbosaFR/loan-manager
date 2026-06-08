"use client";

import { useActionState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/lib/action-state";
import { useT } from "@/lib/i18n/context";
import { createUserAction } from "./actions";

export function UserForm() {
  const t = useT();
  const [state, formAction] = useActionState(createUserAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="max-w-lg">
      <FormError message={state?.error} />
      {state?.ok ? (
        <div className="mb-4 border border-border bg-muted px-3 py-2 text-sm">
          {t("users.created")}
        </div>
      ) : null}

      <FormField label={t("users.email")} htmlFor="email" errors={state?.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="off" required />
      </FormField>

      <FormField
        label={t("users.password")}
        htmlFor="password"
        errors={state?.fieldErrors?.password}
      >
        <Input
          id="password"
          name="password"
          type="text"
          autoComplete="off"
          minLength={8}
          required
        />
      </FormField>

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
