import { cn } from "@/lib/utils";

/** "payme" wordmark. Size is controlled by font-size. */
export function Brand({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium tracking-tight text-foreground",
        className,
      )}
    >
      <span>payme.</span>
    </span>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
    </svg>
  );
}
