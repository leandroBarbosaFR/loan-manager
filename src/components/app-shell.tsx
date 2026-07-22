"use client";

import Link from "next/link";
import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { Nav } from "@/components/nav";
import { Brand } from "@/components/brand";
import { SettingsIcon } from "@/components/nav-icons";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { PersonalizationButton } from "@/components/personalization-button";
import { logout } from "@/app/(app)/actions";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function AppShell({
  email,
  isSuperAdmin = false,
  accentColor = null,
  children,
}: {
  email: string;
  isSuperAdmin?: boolean;
  accentColor?: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <div className="min-h-screen bg-canvas">
      <div className="relative bg-canvas flex min-h-screen flex-col md:h-[calc(100vh-2rem)] md:flex-row md:overflow-hidden">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <Brand className="text-3xl" />
        <div className="flex items-center gap-2">
          <PersonalizationButton initialColor={accentColor} />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label={t("app.menu")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-surface"
          >
            <List size={20} />
          </button>
        </div>
      </header>

      {/* Mobile backdrop — blurs the content behind the drawer */}
      {open && (
        <div
          className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Mobile: fixed overlay drawer (80% width) that doesn't push content down
          "absolute inset-y-0 left-0 z-50 flex w-4/5 flex-col overflow-y-auto border-border bg-background transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop: static sidebar in normal flow
          "md:static md:z-auto md:w-56 md:max-w-none md:translate-x-0 md:shrink-0 md:bg-transparent md:transition-none",
        )}
      >
        {/* Mobile drawer header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <Brand className="text-3xl" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("app.close")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>
        {/* Desktop logo + personalization + theme toggle */}
        <div className="hidden items-center justify-between px-4 py-5 md:flex">
          <Brand className="text-4xl" />
          <div className="flex items-center gap-2">
            <PersonalizationButton initialColor={accentColor} />
            <ThemeToggle />
          </div>
        </div>
        <Nav onNavigate={() => setOpen(false)} isSuperAdmin={isSuperAdmin} />
        <div className="mt-auto border-t border-border p-4">
          <nav className="mb-3 flex flex-col gap-0.5">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface/70 hover:text-foreground"
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
      <main className="min-w-0 flex-1 px-4 py-6 md:h-full md:overflow-y-auto md:bg-transparent md:px-8 md:pt-0">
        {children}
      </main>
      </div>
    </div>
  );
}
