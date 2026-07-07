"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Brand } from "@/components/brand";
import { Input } from "@/components/ui/input";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { requestResetAction } from "./actions";
import { useT } from "@/lib/i18n/context";

export default function ForgotPasswordPage() {
  const t = useT();
  const [state, formAction] = useActionState(requestResetAction, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface p-6 shadow-md">
        <Brand className="mb-4 text-3xl" />
        {state?.ok ? (
          <>
            <h1 className="text-lg font-semibold">{t("forgot.sentTitle")}</h1>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">
              {t("forgot.sentDesc")}
            </p>
            <Link
              href="/login"
              className="text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              {t("forgot.back")}
            </Link>
          </>
        ) : (
          <>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">
              {t("forgot.description")}
            </p>
            <form action={formAction}>
              <FormError
                message={state?.error === "invalid_email" ? t("login.invalidEmail") : undefined}
              />
              <FormField label={t("login.email")} htmlFor="email">
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </FormField>
              <SubmitButton className="w-full" pendingText={t("common.saving")}>
                {t("forgot.submit")}
              </SubmitButton>
            </form>
            <Link
              href="/login"
              className="mt-4 inline-block text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {t("forgot.back")}
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
