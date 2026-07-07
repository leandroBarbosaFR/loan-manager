import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const t = await getT();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <Brand className="text-3xl" />
        <Link href="/login">
          <Button variant="outline">{t("landing.login")}</Button>
        </Link>
      </header>

      <main className="flex flex-1 items-center px-6 py-16 sm:py-24">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              {t("landing.eyebrow")}
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {t("landing.headline")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground lg:mx-0">
              {t("landing.subheadline")}
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link href="/login">
                <Button size="lg">{t("landing.cta")}</Button>
              </Link>
            </div>
          </div>

          {/* Product preview — a stylized dashboard, no images */}
          <div className="hidden lg:block">
            <DashboardPreview labels={{
              stats: [
                t("dashboard.principalLent"),
                t("dashboard.collected"),
                t("dashboard.outstanding"),
              ],
            }} />
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardPreview({ labels }: { labels: { stats: string[] } }) {
  const values = ["R$ 48.200", "R$ 31.750", "R$ 16.450"];
  return (
    <div className="rounded-xl bg-surface p-5 shadow-md">
      <div className="mb-4 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {labels.stats.map((label, i) => (
          <div key={label} className="rounded-lg p-3">
            <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p
              className={
                "mt-1.5 text-sm font-semibold tabular-nums " +
                (i === 1 ? "text-success" : i === 2 ? "text-warning" : "text-foreground")
              }
            >
              {values[i]}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-center gap-3">
            <span className="h-8 w-8 shrink-0 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <span className="block h-2 rounded bg-muted" style={{ width: `${70 - row * 8}%` }} />
              <span className="block h-2 w-1/3 rounded bg-muted/70" />
            </div>
            <span
              className={
                "h-5 w-14 rounded-full " + (row % 3 === 0 ? "bg-success/15" : "bg-accent")
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
