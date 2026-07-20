"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "./actions";
import { Brand } from "@/components/brand";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { useT } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/dictionaries";

const ERROR_KEYS: Record<string, MessageKey> = {
  invalid_credentials: "login.invalidCredentials",
  invalid_email: "login.invalidEmail",
  password_required: "login.passwordRequired",
};

export default function LoginPage() {
  const t = useT();
  const [state, formAction] = useActionState(login, null);

  // Server returns stable codes; translate them here (fallback to raw text).
  const tr = (code?: string) =>
    code ? (ERROR_KEYS[code] ? t(ERROR_KEYS[code]) : code) : undefined;
  const trList = (codes?: string[]) =>
    codes?.map((c) => tr(c) ?? c);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface p-6 shadow-md">
        <Brand className="mb-4 text-3xl" />
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          {t("login.subtitle")}
        </p>

        <form action={formAction}>
          <FormError message={tr(state?.error)} />

          <FormField
            label={t("login.email")}
            htmlFor="email"
            errors={trList(state?.fieldErrors?.email)}
          >
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </FormField>

          <FormField
            label={t("login.password")}
            htmlFor="password"
            errors={trList(state?.fieldErrors?.password)}
          >
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </FormField>

          <SubmitButton className="w-full" pendingText={t("login.signingIn")}>
            {t("login.signIn")}
          </SubmitButton>
        </form>

        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {t("login.forgot")}
        </Link>
      </div>
    </main>
  );
}

