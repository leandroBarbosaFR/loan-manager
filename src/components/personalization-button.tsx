"use client";

import { useState } from "react";
import { Palette } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/modal";
import { PrimaryColorPicker } from "@/components/primary-color-picker";
import { useT } from "@/lib/i18n/context";

/** Icon button that opens a modal to personalize the app's accent color. */
export function PersonalizationButton({
  initialColor = null,
}: {
  initialColor?: string | null;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("settings.appearance")}
        title={t("settings.appearance")}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
      >
        <Palette size={18} />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("settings.appearance")}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          {t("settings.appearanceDesc")}
        </p>
        <PrimaryColorPicker initialColor={initialColor} />
      </Modal>
    </>
  );
}
