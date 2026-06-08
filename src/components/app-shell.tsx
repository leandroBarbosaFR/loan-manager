"use client";

import Image from "next/image";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { logout } from "@/app/(app)/actions";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function AppShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Image
            src="/bank-of-ms-logo.svg"
            alt="Bank of MS"
            width={70}
            height={46}
            priority
            className="h-7 w-auto"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? t("app.close") : t("app.menu")}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "w-full shrink-0 border-border md:flex md:w-56 md:flex-col md:border-r",
          open ? "block border-b" : "hidden md:block",
        )}
      >
        <div className="hidden items-center gap-2 px-4 py-4 md:flex">
          <Image
            src="/bank-of-ms-logo.svg"
            alt="Bank of MS"
            width={70}
            height={46}
            priority
            className="h-8 w-auto"
          />
        </div>
        <Nav onNavigate={() => setOpen(false)} />
        <div className="mt-auto border-t border-border p-4">
          <div className="mb-3">
            <LanguageSwitcher />
          </div>
          <p className="mb-2 truncate text-xs text-muted-foreground" title={email}>
            {email}
          </p>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit" className="w-full">
              {t("app.signOut")}
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
