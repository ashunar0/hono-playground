import { Layout } from "@/components/Layout";
import { MonthPager } from "@/components/MonthPager";
import { BalancesGrid } from "@/features/dashboard/components/BalancesGrid";
import { CategoryBreakdown } from "@/features/dashboard/components/CategoryBreakdown";
import { MonthlyTable } from "@/features/dashboard/components/MonthlyTable";
import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import type { DashboardData } from "@/features/dashboard/service";
import { Link, usePage } from "@ts-76/inertia-hono-jsx";

type Props = { dashboard: DashboardData };

// MonthPager は dashboard だけ partial reload で差し替える (header / nav は静的)。
const PARTIAL_RELOAD_KEYS = ["dashboard"] as const;

export default function Dashboard({ dashboard }: Props) {
  const user = usePage().props.user;
  const { period, summary, monthly, byCategory, balances, totalBalance } = dashboard;

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

        <div class="mb-8">
          <CategoryBreakdown
            byCategory={byCategory}
            expenseTotal={summary.expense}
            period={period}
          />
        </div>

        <div class="mb-8">
          <MonthlyTable monthly={monthly} currentPeriod={period} />
        </div>

        <BalancesGrid balances={balances} totalBalance={totalBalance} />

        <div class="mt-8 flex gap-3">
          <Link
            href="/transactions/new"
            class="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            + 取引を追加
          </Link>
          <Link
            href="/transactions"
            class="rounded border border-emerald-600 px-4 py-2 text-emerald-600 hover:bg-emerald-50"
          >
            取引一覧へ
          </Link>
        </div>
      </div>
    </Layout>
  );
}
