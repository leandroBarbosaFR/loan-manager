import Link from "next/link";
import { Brand } from "@/components/brand";
import { SubmitButton } from "@/components/submit-button";
import { getT } from "@/lib/i18n/server";
import { confirmOtpAction } from "./actions";

export const dynamic = "force-dynamic";

/**
 * Interstitial for email/WhatsApp invite & recovery links. Rendering this page
 * does NOT touch the token — only pressing the button does — so preview
 * crawlers can't burn the one-time token before the user clicks.
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>;
}) {
  const { token_hash, type, next } = await searchParams;
  const t = await getT();
  const valid = Boolean(token_hash && type);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface p-6 text-center shadow-md">
        <Brand className="mb-4 text-3xl" />
        {valid ? (
          <>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">
              {t("confirm.description")}
            </p>
            <form action={confirmOtpAction}>
              <input type="hidden" name="token_hash" value={token_hash} />
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="next" value={next ?? "/reset-password"} />
              <SubmitButton className="w-full" pendingText={t("confirm.pending")}>
                {t("confirm.cta")}
              </SubmitButton>
            </form>
          </>
        ) : (
          <>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">
              {t("confirm.invalid")}
            </p>
            <Link
              href="/login"
              className="text-sm text-primary underline-offset-2 hover:underline"
            >
              {t("confirm.backToLogin")}
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
