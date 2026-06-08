"use client";

import { Badge } from "@/components/ui/badge";
import type { InstallmentStatus, LoanStatus } from "@/types/database";
import { useT } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/dictionaries";

const KEYS: Record<LoanStatus | InstallmentStatus, MessageKey> = {
  open: "status.open",
  pending: "status.pending",
  paid: "status.paid",
  overdue: "status.overdue",
};

export function StatusBadge({
  status,
}: {
  status: LoanStatus | InstallmentStatus;
}) {
  const t = useT();
  const variant =
    status === "paid"
      ? "paid"
      : status === "overdue"
        ? "overdue"
        : status === "pending"
          ? "pending"
          : "open";
  return <Badge variant={variant}>{t(KEYS[status])}</Badge>;
}
