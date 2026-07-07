"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useT } from "@/lib/i18n/context";
import { buildTour, type TourId } from "@/components/tours";

/**
 * Renders a small "Help" button that runs a driver.js feature tour, and
 * auto-starts the tour the first time a user lands on the page (remembered in
 * localStorage). Steps whose target element is absent are skipped, so it stays
 * safe across screen sizes.
 */
export function FeatureTour({ id }: { id: TourId }) {
  const t = useT();
  const started = useRef(false);

  const run = useCallback(() => {
    const steps = buildTour(id, t).filter(
      (s) =>
        !s.element ||
        (typeof s.element === "string" && document.querySelector(s.element)),
    );
    if (steps.length === 0) return;
    driver({
      showProgress: true,
      allowClose: true,
      popoverClass: "lendly-tour",
      nextBtnText: t("tour.next"),
      prevBtnText: t("tour.prev"),
      doneBtnText: t("tour.done"),
      steps,
    }).drive();
  }, [id, t]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const key = `tour:${id}`;
    if (localStorage.getItem(key)) return;
    const handle = window.setTimeout(() => {
      run();
      localStorage.setItem(key, "1");
    }, 600);
    return () => window.clearTimeout(handle);
  }, [id, run]);

  return (
    <button
      type="button"
      onClick={run}
      aria-label={t("tour.help")}
      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground"
    >
      <span aria-hidden="true" className="text-base leading-none">
        ?
      </span>
      {t("tour.help")}
    </button>
  );
}
