"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/toast";
import { useT } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/dictionaries";

/** Maps the `?flash=` redirect code to a message + tone. */
const FLASH: Record<string, { key: MessageKey; deleted?: boolean }> = {
  customer_created: { key: "toast.customerCreated" },
  customer_updated: { key: "toast.customerUpdated" },
  customer_deleted: { key: "toast.customerDeleted", deleted: true },
  loan_created: { key: "toast.loanCreated" },
  loan_updated: { key: "toast.loanUpdated" },
  loan_deleted: { key: "toast.loanDeleted", deleted: true },
  loan_settled: { key: "toast.loanSettled" },
  loan_renegotiated: { key: "toast.loanRenegotiated" },
  vehicle_created: { key: "toast.vehicleCreated" },
  vehicle_updated: { key: "toast.vehicleUpdated" },
  vehicle_deleted: { key: "toast.vehicleDeleted", deleted: true },
  rental_created: { key: "toast.rentalCreated" },
  rental_closed: { key: "toast.rentalClosed" },
};

/**
 * Shows a toast after a redirecting Server Action by reading the `?flash=`
 * query param, then strips it from the URL.
 */
export function FlashToast() {
  const toast = useToast();
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const flash = params.get("flash");
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!flash || handled.current === flash) return;
    handled.current = flash;

    const entry = FLASH[flash];
    if (entry) toast(t(entry.key), entry.deleted ? "info" : "success");

    const next = new URLSearchParams(params.toString());
    next.delete("flash");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [flash, params, pathname, router, t, toast]);

  return null;
}
