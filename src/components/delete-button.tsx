"use client";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/context";

/**
 * Submits a bound server action after a native confirm().
 * `action` should be a Server Action already bound to its target id.
 */
export function DeleteButton({
  action,
  confirmMessage,
  label,
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
}) {
  const t = useT();
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage ?? t("common.confirmDelete")))
          e.preventDefault();
      }}
    >
      <Button type="submit" variant="destructive" size="sm">
        {label ?? t("common.delete")}
      </Button>
    </form>
  );
}
