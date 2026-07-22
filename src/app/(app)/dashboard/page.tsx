import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FeatureTour } from "@/components/feature-tour";
import { getDashboardStats } from "@/lib/repositories/stats";
import {
  refreshOverdueStatuses,
  listDueSoon,
} from "@/lib/repositories/installments";
import { round2 } from "@/lib/calc";
import { formatMoney, formatDate, today, addDays } from "@/lib/format";
import type { MessageKey, Translator } from "@/lib/i18n/dictionaries";
import type { InstallmentWithRelations } from "@/types/database";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
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
    </div>
  );
}

type BucketKey = "overdue" | "today" | "j1" | "j2" | "j3";

const BUCKETS: { key: BucketKey; label: MessageKey; danger?: boolean; warn?: boolean }[] = [
  { key: "overdue", label: "dashboard.dueOverdue", danger: true },
  { key: "today", label: "dashboard.dueToday", warn: true },
  { key: "j1", label: "dashboard.dueJ1" },
  { key: "j2", label: "dashboard.dueJ2" },
  { key: "j3", label: "dashboard.dueJ3" },
];

function DueBucket({
  bucket,
  items,
  date,
  t,
}: {
  bucket: (typeof BUCKETS)[number];
  items: InstallmentWithRelations[];
  date?: string;
  t: Translator;
}) {
  const total = round2(
    items.reduce((s, i) => s + (i.amount - (i.paid_amount ?? 0)), 0),
  );
  const valueClass = bucket.danger
    ? "text-destructive"
    : bucket.warn
      ? "text-warning"
      : "text-foreground";

  return (
    <div className="rounded-lg bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t(bucket.label)}
          </p>
          {date ? (
            <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground/70">
              {formatDate(date)}
            </p>
          ) : null}
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
          {items.length}
        </span>
      </div>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${valueClass}`}>
        {formatMoney(total)}
      </p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t("common.dash")}</p>
      ) : (
        <ul className="mt-3 space-y-0.5 text-sm">
          {items.map((i) => (
            <li key={i.id}>
              <Link
                href={`/loans/${i.loan_id}`}
                className="-mx-2 flex items-center justify-between gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted"
              >
                <span className="truncate">{i.loan?.customer?.name ?? "—"}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatMoney(round2(i.amount - (i.paid_amount ?? 0)))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function PeriodFilter({
  from,
  to,
  t,
}: {
  from?: string;
  to?: string;
  t: Translator;
}) {
  const active = Boolean(from || to);
  const inputClass =
    "rounded-md border border-border bg-background px-2.5 py-1.5 text-sm tabular-nums text-foreground";
  return (
    <form
      method="get"
      className="flex flex-wrap items-end gap-x-3 gap-y-2 text-sm"
    >
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          {t("dashboard.periodFrom")}
        </span>
        <input type="date" name="from" defaultValue={from} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          {t("dashboard.periodTo")}
        </span>
        <input type="date" name="to" defaultValue={to} className={inputClass} />
      </label>
      <Button type="submit" variant="outline">
        {t("dashboard.periodApply")}
      </Button>
      {active ? (
        <Link
          href="/dashboard"
          className="px-1 py-1.5 text-sm text-muted-foreground underline-offset-2 hover:underline"
        >
          {t("dashboard.periodClear")}
        </Link>
      ) : (
        <span className="py-1.5 text-xs text-muted-foreground">
          {t("dashboard.periodAll")}
        </span>
      )}
    </form>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await refreshOverdueStatuses();
  const { from: fromRaw, to: toRaw } = await searchParams;
  const from = fromRaw && DATE_RE.test(fromRaw) ? fromRaw : undefined;
  const to = toRaw && DATE_RE.test(toRaw) ? toRaw : undefined;

  const [stats, dueSoon, t] = await Promise.all([
    getDashboardStats({ from, to }),
    listDueSoon(),
    getT(),
  ]);

  const todayStr = today();
  const d1 = addDays(todayStr, 1);
  const d2 = addDays(todayStr, 2);
  const d3 = addDays(todayStr, 3);
  // Concrete date shown under each bucket label (overdue is a range → none).
  const bucketDates: Record<BucketKey, string | undefined> = {
    overdue: undefined,
    today: todayStr,
    j1: d1,
    j2: d2,
    j3: d3,
  };
  const bucketed: Record<BucketKey, InstallmentWithRelations[]> = {
    overdue: [],
    today: [],
    j1: [],
    j2: [],
    j3: [],
  };
  for (const inst of dueSoon) {
    const d = inst.due_date;
    const key: BucketKey =
      d < todayStr
        ? "overdue"
        : d === todayStr
          ? "today"
          : d === d1
            ? "j1"
            : d === d2
              ? "j2"
              : "j3";
    bucketed[key].push(inst);
  }

  return (
    <div>
      <PageHeader
        title={t("dashboard.title")}
        // description={t("dashboard.description")}
        action={
          <div className="flex items-center gap-2">
            <FeatureTour id="welcome" />
            <Link href="/loans/new" data-tour="new-loan">
              <Button>{t("loans.new")}</Button>
            </Link>
          </div>
        }
      />

      <div className="rounded-xl bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-sm font-medium text-muted-foreground">
            {t("dashboard.overview")}
          </p>
          <PeriodFilter from={from} to={to} t={t} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label={t("dashboard.principalLent")}
            value={formatMoney(stats.totalPrincipal)}
          />
          <Metric
            label={t("dashboard.expectedReceivable")}
            value={formatMoney(stats.totalReceivable)}
          />
          <Metric
            label={t("dashboard.collected")}
            value={formatMoney(stats.totalCollected)}
            tone="success"
          />
          <Metric
            label={t("dashboard.outstanding")}
            value={formatMoney(stats.outstanding)}
            tone="warning"
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
          <span>
            {t("dashboard.expectedProfit")}:{" "}
            <strong className="font-semibold tabular-nums text-success">
              {formatMoney(stats.totalProfit)}
            </strong>
          </span>
          <span>
            {t("dashboard.openLoans")}:{" "}
            <strong className="font-semibold tabular-nums text-foreground">
              {stats.openLoans}
            </strong>
          </span>
          <span>
            {t("dashboard.overdueLoans")}:{" "}
            <strong
              className={`font-semibold tabular-nums ${stats.overdueLoans > 0 ? "text-destructive" : "text-foreground"}`}
            >
              {stats.overdueLoans}
            </strong>
          </span>
          <span>
            {t("dashboard.paidLoans")}:{" "}
            <strong className="font-semibold tabular-nums text-foreground">
              {stats.paidLoans}
            </strong>
          </span>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {t("dashboard.dueTitle")}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {BUCKETS.map((b) => (
          <DueBucket
            key={b.key}
            bucket={b}
            items={bucketed[b.key]}
            date={bucketDates[b.key]}
            t={t}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span>{t("dashboard.customersCount", { count: stats.totalCustomers })}</span>
        <span>·</span>
        <span>{t("dashboard.loansCount", { count: stats.totalLoans })}</span>
      </div>
    </div>
  );
}
