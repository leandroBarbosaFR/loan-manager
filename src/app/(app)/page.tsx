import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Stat, StatGrid } from "@/components/stat";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/lib/repositories/stats";
import { refreshOverdueStatuses } from "@/lib/repositories/installments";
import { formatMoney } from "@/lib/format";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await refreshOverdueStatuses();
  const [stats, t] = await Promise.all([getDashboardStats(), getT()]);

  return (
    <div>
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
        action={
          <Link href="/loans/new">
            <Button>{t("loans.new")}</Button>
          </Link>
        }
      />

      <StatGrid>
        <Stat
          label={t("dashboard.principalLent")}
          value={formatMoney(stats.totalPrincipal)}
        />
        <Stat
          label={t("dashboard.expectedReceivable")}
          value={formatMoney(stats.totalReceivable)}
        />
        <Stat
          label={t("dashboard.expectedProfit")}
          value={formatMoney(stats.totalProfit)}
          emphasis="success"
        />
        <Stat
          label={t("dashboard.collected")}
          value={formatMoney(stats.totalCollected)}
          emphasis="success"
        />
        <Stat
          label={t("dashboard.outstanding")}
          value={formatMoney(stats.outstanding)}
          emphasis="warning"
        />
        <Stat label={t("dashboard.openLoans")} value={stats.openLoans} />
        <Stat
          label={t("dashboard.overdueLoans")}
          value={stats.overdueLoans}
          emphasis={stats.overdueLoans > 0 ? "destructive" : "default"}
        />
        <Stat label={t("dashboard.paidLoans")} value={stats.paidLoans} />
      </StatGrid>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span>{t("dashboard.customersCount", { count: stats.totalCustomers })}</span>
        <span>·</span>
        <span>{t("dashboard.loansCount", { count: stats.totalLoans })}</span>
      </div>
    </div>
  );
}
