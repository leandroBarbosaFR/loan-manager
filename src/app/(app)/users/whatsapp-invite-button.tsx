"use client";

import { useState, useTransition } from "react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { inviteViaWhatsappAction } from "./actions";
import { useT } from "@/lib/i18n/context";

export function WhatsappInviteButton({ userId }: { userId: string }) {
  const t = useT();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    setError(null);
    // Open the tab synchronously so the browser doesn't block it after the
    // async round-trip, then point it at the wa.me link once we have it.
    const win = window.open("", "_blank");
    start(async () => {
      const res = await inviteViaWhatsappAction(userId);
      if (res.ok) {
        if (win) win.location.href = res.url;
      } else {
        win?.close();
        setError(res.error === "no-phone" ? t("users.waNoPhone") : t("users.waFailed"));
      }
    });
  };

  return (
    <div className="inline-flex flex-col items-end">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={pending}
      >
        <WhatsappLogo size={16} className="mr-1" />
        {t("users.waInvite")}
      </Button>
      {error ? (
        <span className="mt-1 text-xs text-destructive">{error}</span>
      ) : null}
    </div>
  );
}
