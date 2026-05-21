import { Layout } from "@/components/Layout";
import { MonthPager } from "@/components/MonthPager";
import type { DashboardData } from "@/features/dashboard/service";
import { formatPeriod } from "@/lib/period";
import { Link, usePage } from "@ts-76/inertia-hono-jsx";

type Props = { dashboard: DashboardData };

const formatYen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;
const signedYen = (n: number) => `${n >= 0 ? "+" : "-"}${formatYen(Math.abs(n))}`;

const ACCOUNT_TYPE_LABEL: Record<DashboardData["balances"][number]["type"], string> = {
  cash: "現金",
  bank: "銀行",
  card: "カード",
  other: "その他",
};

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

        <section class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard label="収入" value={summary.income} tone="income" />
          <SummaryCard label="支出" value={summary.expense} tone="expense" />
          <SummaryCard label="差引" value={summary.diff} tone="diff" />
        </section>

        <section class="mb-8">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-lg font-semibold">カテゴリ別支出 ({formatPeriod(period)})</h2>
            <span class="text-sm text-gray-500">合計 {formatYen(summary.expense)}</span>
          </div>
          {byCategory.length === 0 ? (
            <p class="text-gray-500">この月の支出はまだないのだ。</p>
          ) : (
            <div class="overflow-hidden rounded border border-gray-200 bg-white">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                  <tr>
                    <th class="px-3 py-2">カテゴリ</th>
                    <th class="px-3 py-2 text-right">金額</th>
                    <th class="px-3 py-2 text-right">割合</th>
                  </tr>
                </thead>
                <tbody>
                  {byCategory.map((c) => {
                    const ratio = summary.expense === 0 ? 0 : c.total / summary.expense;
                    return (
                      <tr class="border-t border-gray-100">
                        <td class="px-3 py-2">
                          <span class="inline-flex items-center gap-2">
                            <span
                              class="block h-3 w-3 rounded-full"
                              style={`background-color: ${c.color}`}
                              aria-hidden="true"
                            />
                            {c.name}
                          </span>
                        </td>
                        <td class="px-3 py-2 text-right font-mono">{formatYen(c.total)}</td>
                        <td class="px-3 py-2 text-right text-gray-500">
                          {(ratio * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section class="mb-8">
          <h2 class="mb-3 text-lg font-semibold">月別収支 (直近 12 ヶ月)</h2>
          <div class="overflow-x-auto rounded border border-gray-200 bg-white">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th class="px-3 py-2">月</th>
                  <th class="px-3 py-2 text-right">収入</th>
                  <th class="px-3 py-2 text-right">支出</th>
                  <th class="px-3 py-2 text-right">差引</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m) => {
                  const diff = m.income - m.expense;
                  return (
                    <tr class={`border-t border-gray-100 ${m.period === period ? "bg-emerald-50" : ""}`}>
                      <td class="px-3 py-2 font-mono">{m.period}</td>
                      <td class="px-3 py-2 text-right font-mono text-green-700">
                        {m.income === 0 ? "—" : formatYen(m.income)}
                      </td>
                      <td class="px-3 py-2 text-right font-mono text-red-600">
                        {m.expense === 0 ? "—" : formatYen(m.expense)}
                      </td>
                      <td
                        class={`px-3 py-2 text-right font-mono ${diff >= 0 ? "text-emerald-700" : "text-red-600"}`}
                      >
                        {diff === 0 ? "—" : signedYen(diff)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-lg font-semibold">口座残高</h2>
            <span class="text-sm text-gray-500">合計 {formatYen(totalBalance)}</span>
          </div>
          {balances.length === 0 ? (
            <p class="text-gray-500">口座がまだないのだ。</p>
          ) : (
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              {balances.map((b) => (
                <div class="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-3">
                  <div class="flex flex-col">
                    <span class="font-medium">{b.name}</span>
                    <span class="text-xs text-gray-500">{ACCOUNT_TYPE_LABEL[b.type]}</span>
                  </div>
                  <span
                    class={`font-mono text-lg ${b.current >= 0 ? "text-emerald-700" : "text-red-600"}`}
                  >
                    {formatYen(b.current)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

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

type SummaryCardProps = {
  label: string;
  value: number;
  tone: "income" | "expense" | "diff";
};

function SummaryCard({ label, value, tone }: SummaryCardProps) {
  const valueClass =
    tone === "income"
      ? "text-emerald-700"
      : tone === "expense"
        ? "text-red-600"
        : value >= 0
          ? "text-emerald-700"
          : "text-red-600";
  const displayValue = tone === "diff" ? signedYen(value) : formatYen(value);
  return (
    <div class="rounded border border-gray-200 bg-white p-4">
      <div class="text-xs text-gray-600">{label}</div>
      <div class={`mt-1 font-mono text-2xl font-semibold ${valueClass}`}>{displayValue}</div>
    </div>
  );
}
