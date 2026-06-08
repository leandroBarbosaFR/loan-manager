"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_COOKIE, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { useLocale, useT } from "@/lib/i18n/context";
import { Select } from "@/components/ui/select";

export function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const [, startTransition] = useTransition();

  function onChange(next: string) {
    // 1 year, site-wide cookie; server components read it on the next render.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">
        {t("app.language")}
      </span>
      <Select
        value={locale}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm"
        aria-label={t("app.language")}
      >
        {LOCALES.map((l: Locale) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l]}
          </option>
        ))}
      </Select>
    </label>
  );
}
