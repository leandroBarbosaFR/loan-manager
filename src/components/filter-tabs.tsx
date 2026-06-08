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
    <div className="mb-4 flex flex-wrap border border-border">
      {options.map((opt, i) => {
        const href =
          opt.value === "all" ? basePath : `${basePath}?${param}=${opt.value}`;
        const isActive = active === opt.value;
        return (
          <Link
            key={opt.value}
            href={href}
            className={cn(
              "border-border px-4 py-2 text-sm",
              i > 0 && "border-l",
              isActive
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-muted",
            )}
          >
            {opt.label}
            {typeof opt.count === "number" ? (
              <span
                className={cn(
                  "ml-2 tabular-nums",
                  isActive ? "text-white/70" : "text-muted-foreground",
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
