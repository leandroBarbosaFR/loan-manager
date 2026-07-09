import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { refreshOverdueStatuses } from "@/lib/repositories/installments";
import { getCapitalStats } from "@/lib/repositories/capital";
import { round2 } from "@/lib/calc";
import { formatMoney, LOCALE } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import type { Translator } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

const pctFmt = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  maximumFractionDigits: 1,
});
const numFmt = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });

function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "success" | "warning";
}) {
  const color =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-foreground";
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1.5 text-3xl font-semibold tabular-nums ${color}`}>
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function AporteForm({ aporte, t }: { aporte?: number; t: Translator }) {
  return (
    <form
      method="get"
      className="mt-6 flex flex-wrap items-end gap-3 border-t border-border pt-4"
    >
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          {t("capital.aporteLabel")}
        </span>
        <input
          type="number"
          name="aporte"
          step="0.01"
          min="0"
          inputMode="decimal"
          defaultValue={aporte != null ? String(aporte) : ""}
          placeholder="0,00"
          className="w-44 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm tabular-nums text-foreground"
        />
      </label>
      <Button type="submit" variant="outline">
        {t("capital.aporteApply")}
      </Button>
      <span className="py-1.5 text-xs text-muted-foreground">
        {t("capital.aporteHint")}
      </span>
    </form>
  );
}

export default async function CapitalPage({
  searchParams,
}: {
  searchParams: Promise<{ aporte?: string }>;
}) {
  await refreshOverdueStatuses();
  const { aporte: aporteRaw } = await searchParams;
  const parsed = aporteRaw != null ? Number(aporteRaw) : NaN;
  const aporte = Number.isFinite(parsed) && parsed > 0 ? round2(parsed) : undefined;

  const [stats, t] = await Promise.all([getCapitalStats(), getT()]);

  const available =
    aporte != null ? round2(aporte - stats.capitalOnStreet) : null;
  const hasVelocity = stats.avgDaysToPayoff != null;

  return (
    <div>
      <PageHeader title={t("capital.title")} />

      {/* ── Bloco 1: Meu capital ── */}
      <div className="rounded-xl bg-surface p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          {t("capital.myCapital")}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <Metric
            label={t("capital.totalLent")}
            value={formatMoney(stats.totalLent)}
          />
          <Metric
            label={t("capital.recovered")}
            value={formatMoney(stats.totalCollected)}
            tone="success"
            hint={t("capital.recoveredHint", {
              pct: pctFmt.format(stats.recoveredRatio),
            })}
          />
          <Metric
            label={t("capital.onStreet")}
            value={formatMoney(stats.capitalOnStreet)}
            tone="warning"
            hint={t("capital.onStreetHint")}
          />
        </div>

        <AporteForm aporte={aporte} t={t} />

        {available != null ? (
          <div className="mt-4">
            <Metric
              label={t("capital.available")}
              value={formatMoney(available)}
              tone={available >= 0 ? "success" : "warning"}
              hint={t("capital.availableHint")}
            />
          </div>
        ) : null}
      </div>

      {/* ── Bloco 2: Velocidade do capital ── */}
      <h2 className="mb-3 mt-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {t("capital.velocity")}
      </h2>

      {hasVelocity ? (
        <div className="rounded-xl bg-surface p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label={t("capital.avgPayoff")}
              value={`${numFmt.format(Math.round(stats.avgDaysToPayoff!))} ${t("capital.daysUnit")}`}
              hint={t("capital.avgPayoffHint")}
            />
            <Metric
              label={t("capital.turnsPerYear")}
              value={`${numFmt.format(stats.turnsPerYear!)}×`}
              hint={t("capital.turnsPerYearHint")}
            />
            <Metric
              label={t("capital.returnPerCycle")}
              value={pctFmt.format(stats.returnPerCycle!)}
              tone="success"
              hint={t("capital.returnPerCycleHint")}
            />
            <Metric
              label={t("capital.annualized")}
              value={pctFmt.format(stats.annualizedReturn!)}
              tone="success"
              hint={t("capital.annualizedHint")}
            />
          </div>
          <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
            {t("capital.basedOn", { count: stats.completedCount })} ·{" "}
            {t("capital.reinvestNote")}
          </p>
        </div>
      ) : (
        <EmptyState title={t("capital.noData")} />
      )}
    </div>
  );
}
