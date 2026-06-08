"use client";

import Image from "next/image";
import { useActionState } from "react";
import { login } from "./actions";
import { Input } from "@/components/ui/input";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { useT } from "@/lib/i18n/context";

export default function LoginPage() {
  const t = useT();
  const [state, formAction] = useActionState(login, null);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm border border-border p-6">
        <Image
          src="/bank-of-ms-logo.svg"
          alt="Bank of MS"
          width={70}
          height={46}
          priority
          className="mb-4 h-14 w-auto"
        />
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          {t("login.subtitle")}
        </p>

        <form action={formAction}>
          <FormError message={state?.error} />

          <FormField
            label={t("login.email")}
            htmlFor="email"
            errors={state?.fieldErrors?.email}
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
            errors={state?.fieldErrors?.password}
          >
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </FormField>

          <SubmitButton className="w-full" pendingText={t("login.signingIn")}>
            {t("login.signIn")}
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
