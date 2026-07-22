"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";

type Theme = "light" | "dark";

/** The theme actually showing right now (explicit choice, else OS preference). */
function resolvedTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Sun/moon segmented toggle. Sets an explicit light/dark theme and persists it. */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useT();
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => setTheme(resolvedTheme()), []);

  function choose(next: Theme) {
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  const btn = (active: boolean) =>
    cn(
      "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div
      role="group"
      aria-label={t("app.theme")}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => choose("light")}
        aria-pressed={theme === "light"}
        aria-label={t("theme.light")}
        className={btn(theme === "light")}
      >
        <Sun size={16} weight={theme === "light" ? "fill" : "regular"} />
      </button>
      <button
        type="button"
        onClick={() => choose("dark")}
        aria-pressed={theme === "dark"}
        aria-label={t("theme.dark")}
        className={btn(theme === "dark")}
      >
        <Moon size={16} weight={theme === "dark" ? "fill" : "regular"} />
      </button>
    </div>
  );
}
