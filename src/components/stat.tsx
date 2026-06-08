import { cn } from "@/lib/utils";

export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
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
    <div className="border-b border-r border-border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-medium tabular-nums",
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
