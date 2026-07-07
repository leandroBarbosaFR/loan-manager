import Link from "next/link";
import { cn } from "@/lib/utils";

export function FilterTabs({
  basePath,
  param = "status",
  active,
  options,
}: {
  basePath: string;
  param?: string;
  active: string;
  options: { value: string; label: string; count?: number }[];
}) {
  return (
    <div className="mb-4 inline-flex flex-wrap gap-1 rounded-lg bg-white p-1 shadow-xs">
      {options.map((opt) => {
        const href =
          opt.value === "all" ? basePath : `${basePath}?${param}=${opt.value}`;
        const isActive = active === opt.value;
        return (
          <Link
            key={opt.value}
            href={href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {opt.label}
            {typeof opt.count === "number" ? (
              <span
                className={cn(
                  "ml-2 tabular-nums",
                  isActive ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {opt.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
