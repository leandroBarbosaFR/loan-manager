import { cn } from "@/lib/utils";

export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string | number;
  emphasis?: "default" | "success" | "destructive" | "warning";
}) {
  return (
    <div className="rounded-lg bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tabular-nums text-foreground",
          emphasis === "success" && "text-success",
          emphasis === "destructive" && "text-destructive",
          emphasis === "warning" && "text-warning",
        )}
      >
        {value}
      </p>
    </div>
  );
}
