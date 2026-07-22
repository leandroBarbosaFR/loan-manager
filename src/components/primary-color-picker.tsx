"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";
import { saveAccentColorAction } from "@/app/(app)/actions";

/** Preset accent colors; the first is the app default. */
const PRESETS = [
  "#7c5cff",
  "#3b82f6",
  "#6366f1",
  "#14b8a6",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#ec4899",
];
const DEFAULT = "#7c5cff";

function triplet(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Overrides the primary/ring/hover CSS variables with the chosen color. */
function applyPrimary(hex: string) {
  const [r, g, b] = triplet(hex);
  const s = document.documentElement.style;
  s.setProperty("--color-primary", `${r} ${g} ${b}`);
  s.setProperty("--color-ring", `${r} ${g} ${b}`);
  const d = (x: number) => Math.max(0, Math.round(x * 0.88));
  s.setProperty("--color-primary-hover", `${d(r)} ${d(g)} ${d(b)}`);
}

function clearPrimary() {
  const s = document.documentElement.style;
  s.removeProperty("--color-primary");
  s.removeProperty("--color-ring");
  s.removeProperty("--color-primary-hover");
}

export function PrimaryColorPicker({
  initialColor = null,
}: {
  initialColor?: string | null;
}) {
  const t = useT();
  const [color, setColor] = useState<string>(initialColor ?? DEFAULT);
  const [, startSave] = useTransition();

  // Persisted to the profile (RLS-scoped) so it follows the user across devices.
  function persist(value: string | null) {
    startSave(async () => {
      try {
        await saveAccentColorAction(value);
      } catch {
        // Non-fatal: the color still applies locally this session.
      }
    });
  }

  function choose(hex: string) {
    setColor(hex);
    applyPrimary(hex);
    persist(hex);
  }

  function reset() {
    setColor(DEFAULT);
    clearPrimary();
    persist(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => choose(hex)}
            aria-label={hex}
            aria-pressed={color.toLowerCase() === hex.toLowerCase()}
            className={cn(
              "h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-surface transition",
              color.toLowerCase() === hex.toLowerCase()
                ? "ring-foreground"
                : "ring-transparent hover:ring-border",
            )}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        {t("appearance.custom")}
        <input
          type="color"
          value={color}
          onChange={(e) => choose(e.target.value)}
          aria-label={t("appearance.custom")}
          className="h-8 w-10 cursor-pointer rounded border border-border bg-surface"
        />
      </label>

      <button
        type="button"
        onClick={reset}
        className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        {t("appearance.reset")}
      </button>
    </div>
  );
}
