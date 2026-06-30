import { cn } from "@/lib/utils";

/** "lendly" wordmark in Nanum Pen Script. Size is controlled by font-size. */
export function Brand({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-brand tracking-tight text-foreground",
        className,
      )}
    >
      <span style={{ WebkitTextStroke: "0.04em currentColor" }}>lendly.</span>
    </span>
  );
}
