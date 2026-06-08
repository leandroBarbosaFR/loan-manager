"use client";

import { Button } from "@/components/ui/button";

/**
 * Records a fee-only rollover after a native confirm().
 * `action` should be a Server Action already bound to its loan id.
 */
export function RolloverButton({
  action,
  confirmMessage,
  label = "Roll over (collect fee)",
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        {label}
      </Button>
    </form>
  );
}
