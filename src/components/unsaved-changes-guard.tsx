"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/context";

/**
 * Warns the user before leaving a form with unsaved input. Covers:
 *  - tab close / reload / hard navigation (beforeunload)
 *  - browser back button and trackpad swipe-back (popstate within the SPA)
 *
 * Drop it anywhere inside a <form>; it attaches to the nearest form ancestor
 * and only arms once the user has actually typed something. Submitting the
 * form clears the dirty flag so the post-submit redirect is not blocked.
 */
export function UnsavedChangesGuard() {
  const t = useT();
  const ref = useRef<HTMLSpanElement>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const markDirty = () => setDirty(true);
    const markClean = () => setDirty(false);
    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    form.addEventListener("submit", markClean);
    form.addEventListener("reset", markClean);
    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("change", markDirty);
      form.removeEventListener("submit", markClean);
      form.removeEventListener("reset", markClean);
    };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const message = t("common.unsavedChanges");

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    // Push a sentinel entry so the first back press lands here and we can ask.
    window.history.pushState(null, "", window.location.href);
    const onPopState = () => {
      if (window.confirm(message)) {
        window.removeEventListener("popstate", onPopState);
        window.history.back();
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPopState);
    };
  }, [dirty, t]);

  return <span ref={ref} className="hidden" aria-hidden="true" />;
}
