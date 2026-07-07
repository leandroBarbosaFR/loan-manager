import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  htmlFor,
  errors,
  hint,
  children,
  className,
  ...rest
}: {
  label: string;
  htmlFor: string;
  errors?: string[];
  hint?: string;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...rest}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {errors && errors.length > 0 ? (
        <p className="mt-1 text-xs text-destructive">{errors[0]}</p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-4 border border-destructive bg-surface px-3 py-2 text-sm text-destructive">
      {message}
    </div>
  );
}
