"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

/**
 * Minimal accessible modal. Renders a full-screen overlay with a centered
 * panel; closes on backdrop click or the Escape key. Dependency-free to match
 * the repo's hand-rolled UI primitives.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-surface p-5 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-base font-medium">{title}</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2 h-8 w-8 text-muted-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
