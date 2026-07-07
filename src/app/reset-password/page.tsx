"use client";

import { Brand } from "@/components/brand";
import { SetPasswordForm } from "@/components/set-password-form";
import { resetPasswordAction } from "./actions";
import { useT } from "@/lib/i18n/context";

export default function ResetPasswordPage() {
  const t = useT();
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-md">
        <Brand className="mb-4 text-3xl" />
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          {t("reset.description")}
        </p>
        <SetPasswordForm action={resetPasswordAction} submitLabel={t("reset.submit")} />
      </div>
    </main>
  );
}
