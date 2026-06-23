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
  isSuperAdmin = false,
  children,
}: {
  email: string;
  isSuperAdmin?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <div className="relative flex min-h-screen flex-col md:flex-row">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Image
            src="/bank-of-ms-logo.svg"
            alt="Bank of MS"
            width={70}
            height={46}
            priority
            className="h-10 w-auto"
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

      {/* Mobile backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Mobile: fixed overlay drawer that doesn't push content down
          "absolute inset-y-0 left-0 z-50 flex w-72 max-w-[85%] flex-col overflow-y-auto border-border bg-background transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop: static sidebar in normal flow
          "md:static md:z-auto md:w-56 md:max-w-none md:translate-x-0 md:shrink-0 md:border-r md:transition-none",
        )}
      >
        {/* Mobile drawer header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <Image
            src="/bank-of-ms-logo.svg"
            alt="Bank of MS"
            width={70}
            height={46}
            priority
            className="h-10 w-auto"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            {t("app.close")}
          </Button>
        </div>
        {/* Desktop logo */}
        <div className="hidden items-center gap-2 px-4 py-4 md:flex">
          <Image
            src="/bank-of-ms-logo.svg"
            alt="Bank of MS"
            width={70}
            height={46}
            priority
            className="h-14 w-auto"
          />
        </div>
        <Nav onNavigate={() => setOpen(false)} isSuperAdmin={isSuperAdmin} />
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
