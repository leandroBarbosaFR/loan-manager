"use client";

import { Button } from "@/components/ui/button";

/**
 * Settles a loan's full remaining balance after a native confirm().
 * `action` is a Server Action already bound to its loan id; it reads the
 * settlement date from the hidden `paid_at` field (defaults to today).
 */
export function SettleLoanButton({
  action,
  confirmMessage,
  label,
  date,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  label: string;
  date: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <input type="hidden" name="paid_at" value={date} />
      <Button type="submit" variant="outline">
        {label}
      </Button>
    </form>
  );
}
