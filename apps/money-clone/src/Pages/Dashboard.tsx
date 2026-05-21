import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { PieChart } from "@/components/charts/PieChart";
import { Layout } from "@/components/Layout";
import { MonthPager } from "@/components/MonthPager";
import { BalancesGrid } from "@/features/dashboard/components/BalancesGrid";
import { CategoryBreakdown } from "@/features/dashboard/components/CategoryBreakdown";
import { DashboardActions } from "@/features/dashboard/components/DashboardActions";
import { MonthlyTable } from "@/features/dashboard/components/MonthlyTable";
import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import type { DashboardData } from "@/features/dashboard/service";
import { formatYen } from "@/lib/format";
import { formatPeriod } from "@/lib/period";
import { usePage } from "@ts-76/inertia-hono-jsx";

type Props = { dashboard: DashboardData };

// MonthPager は dashboard だけ partial reload で差し替える (header / nav は静的)。
const PARTIAL_RELOAD_KEYS = ["dashboard"] as const;

export default function Dashboard({ dashboard }: Props) {
  const user = usePage().props.user;
  const { period, summary, monthly, byCategory, balances, totalBalance, balanceTimeline } =
    dashboard;

  return (
    <Layout>
      <div class="mx-auto max-w-5xl p-8">
        <div class="mb-6 flex items-center justify-between">
          <h1 class="text-2xl font-bold">ダッシュボード</h1>
          {user && <p class="text-sm text-gray-600">{user.name} さんの家計</p>}
        </div>

        <div class="mb-6">
          <MonthPager period={period} only={PARTIAL_RELOAD_KEYS} path="/" />
        </div>

        <div class="mb-8">
          <SummaryCards summary={summary} />
        </div>

        <section class="mb-8">
          <h2 class="mb-3 text-lg font-semibold">月別収支 (直近 12 ヶ月)</h2>
          <div class="rounded border border-gray-200 bg-white p-4">
            <BarChart data={monthly} />
          </div>
          <div class="mt-3">
            <MonthlyTable monthly={monthly} currentPeriod={period} />
          </div>
        </section>

        <section class="mb-8">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-lg font-semibold">カテゴリ別支出 ({formatPeriod(period)})</h2>
            <span class="text-sm text-gray-500">合計 {formatYen(summary.expense)}</span>
          </div>
          {byCategory.length === 0 ? (
            <p class="text-gray-500">この月の支出はまだないのだ。</p>
          ) : (
            <>
              <div class="rounded border border-gray-200 bg-white p-4">
                <PieChart data={byCategory} />
              </div>
              <div class="mt-3">
                <CategoryBreakdown byCategory={byCategory} expenseTotal={summary.expense} />
              </div>
            </>
          )}
        </section>

        <section class="mb-8">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-lg font-semibold">残高推移 (直近 12 ヶ月)</h2>
            <span class="text-sm text-gray-500">現在合計 {formatYen(totalBalance)}</span>
          </div>
          <div class="rounded border border-gray-200 bg-white p-4">
            <LineChart data={balanceTimeline} />
          </div>
          <div class="mt-3">
            <BalancesGrid balances={balances} />
          </div>
        </section>

        <DashboardActions period={period} />
      </div>
    </Layout>
  );
}
