"use client";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { SetPasswordForm } from "@/components/set-password-form";
import { changePasswordAction } from "./actions";
import { logout } from "@/app/(app)/actions";
import { useT } from "@/lib/i18n/context";

export default function ChangePasswordPage() {
  const t = useT();
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface p-6 shadow-md">
        <Brand className="mb-4 text-3xl" />
        <h1 className="text-lg font-semibold">{t("changePassword.title")}</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          {t("changePassword.description")}
        </p>
        <SetPasswordForm
          action={changePasswordAction}
          submitLabel={t("changePassword.submit")}
        />
        <form action={logout} className="mt-4">
          <Button variant="ghost" size="sm" type="submit" className="w-full">
            {t("changePassword.signOut")}
          </Button>
        </form>
      </div>
    </main>
  );
}
