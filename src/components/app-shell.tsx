"use client";

import Link from "next/link";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Brand } from "@/components/brand";
import { SettingsIcon } from "@/components/nav-icons";
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
    <div className="relative flex min-h-screen flex-col md:h-screen md:flex-row md:overflow-hidden">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <Brand className="text-3xl" />
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
          <Brand className="text-3xl" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            {t("app.close")}
          </Button>
        </div>
        {/* Desktop logo */}
        <div className="hidden px-4 py-5 md:block">
          <Brand className="text-4xl" />
        </div>
        <Nav onNavigate={() => setOpen(false)} isSuperAdmin={isSuperAdmin} />
        <div className="mt-auto border-t border-border p-4">
          <nav className="mb-3 flex flex-col gap-0.5">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <SettingsIcon className="h-4 w-4 shrink-0" />
              {t("nav.settings")}
            </Link>
            <div className="flex gap-3 px-3 pt-1 text-xs text-muted-foreground">
              <Link
                href="/privacy"
                onClick={() => setOpen(false)}
                className="underline-offset-2 hover:text-foreground hover:underline"
              >
                {t("nav.privacy")}
              </Link>
              <Link
                href="/terms"
                onClick={() => setOpen(false)}
                className="underline-offset-2 hover:text-foreground hover:underline"
              >
                {t("nav.terms")}
              </Link>
            </div>
          </nav>
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

      {/* Main content — the only part that scrolls on desktop */}
      <main className="min-w-0 flex-1 px-4 py-6 md:h-screen md:overflow-y-auto md:px-8">
        {children}
      </main>
    </div>
  );
}
