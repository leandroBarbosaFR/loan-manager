"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login } from "./actions";
import { Brand } from "@/components/brand";
import { Input } from "@/components/ui/input";
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
  const [showPassword, setShowPassword] = useState(false);

  // Server returns stable codes; translate them here (fallback to raw text).
  const tr = (code?: string) =>
    code ? (ERROR_KEYS[code] ? t(ERROR_KEYS[code]) : code) : undefined;
  const trList = (codes?: string[]) =>
    codes?.map((c) => tr(c) ?? c);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-6 shadow-md">
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
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? t("login.hidePassword") : t("login.showPassword")
                }
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
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

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-2.16 2.92" />
      <path d="M6.6 6.6A13.2 13.2 0 0 0 2 12s3.5 7 10 7a9.1 9.1 0 0 0 4.36-1.1" />
      <path d="m2 2 20 20" />
      <path d="M9.5 9.5a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
