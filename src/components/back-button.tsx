"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { useT } from "@/lib/i18n/context";

/**
 * "Back" link that returns to the previous page (e.g. the customer profile or
 * the loans list), falling back to `fallbackHref` when there's no history
 * (direct link / fresh tab).
 */
export function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();
  const t = useT();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      className="mb-4 inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-muted"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {t("common.back")}
    </button>
  );
}
