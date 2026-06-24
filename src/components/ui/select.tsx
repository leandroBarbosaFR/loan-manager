import * as React from "react";
import { cn } from "@/lib/utils";

/** Native select, styled to match the rest of the admin UI. */
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full appearance-none rounded-md border border-border bg-white bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat px-3 py-1 pr-9 text-sm text-foreground shadow-xs transition-shadow focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20fill=%22none%22%20viewBox=%220%200%2024%2024%22%20stroke=%22%236b7280%22%20stroke-width=%222%22%3E%3Cpath%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%20d=%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

export { Select };
