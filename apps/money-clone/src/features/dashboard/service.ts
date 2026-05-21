import type { Db } from "@/lib/db";
import { shiftPeriod } from "@/lib/period";
import { dashboardRepo } from "./repository";

export const MONTHLY_RANGE = 12;

export type Summary = { income: number; expense: number; diff: number };
export type MonthlyEntry = { period: string; income: number; expense: number };
export type CategoryEntry = {
  categoryId: string;
  name: string;
  color: string;
  total: number;
};
export type AccountBalance = {
  id: string;
  name: string;
  type: "cash" | "bank" | "card" | "other";
  current: number;
};
export type BalanceTimelineEntry = { period: string; balance: number };

export type DashboardData = {
  period: string;
  summary: Summary;
  monthly: MonthlyEntry[];
  byCategory: CategoryEntry[];
  balances: AccountBalance[];
  totalBalance: number;
  balanceTimeline: BalanceTimelineEntry[];
};

// anchor を含む直近 N ヶ月分の YYYY-MM 配列を古い順に返す。
const lastNMonths = (anchor: string, n: number): string[] => {
  const result: string[] = [];
  for (let i = n - 1; i >= 0; i--) result.push(shiftPeriod(anchor, -i));
  return result;
};

export const dashboardService = {
  build: async (db: Db, userId: string, period: string): Promise<DashboardData> => {
    // 月別の起点は表示範囲の先頭月の 1 日。drizzle WHERE date >= ... で絞る。
    const months = lastNMonths(period, MONTHLY_RANGE);
    const fromDate = `${months[0]}-01`;

    const [summaryRows, monthlyRows, byCategory, balanceRows, netBeforeRows] = await Promise.all([
      dashboardRepo.summaryByType(db, userId, period),
      dashboardRepo.monthlyByType(db, userId, fromDate),
      dashboardRepo.expenseByCategory(db, userId, period),
      dashboardRepo.accountBalances(db, userId),
      dashboardRepo.netBefore(db, userId, fromDate),
    ]);

    const summary: Summary = { income: 0, expense: 0, diff: 0 };
    for (const row of summaryRows) {
      if (row.type === "income") summary.income = row.total;
      else if (row.type === "expense") summary.expense = row.total;
    }
    summary.diff = summary.income - summary.expense;

    // 取引 0 月もグラフが連続するよう、月の配列を先に作って 0 で埋めてから上書きする。
    const monthlyMap = new Map<string, MonthlyEntry>();
    for (const p of months) monthlyMap.set(p, { period: p, income: 0, expense: 0 });
    for (const row of monthlyRows) {
      const entry = monthlyMap.get(row.month);
      if (!entry) continue;
      if (row.type === "income") entry.income = row.total;
      else if (row.type === "expense") entry.expense = row.total;
    }
    const monthly = months.map((p) => monthlyMap.get(p)!);

    const balances: AccountBalance[] = balanceRows.map((b) => ({
      id: b.id,
      name: b.name,
      type: b.type,
      current: b.initialBalance + b.income - b.expense,
    }));
    const totalBalance = balances.reduce((acc, b) => acc + b.current, 0);

    // fromDate 時点の口座総額 = 全口座の initialBalance 合計 + fromDate より前の収支累積。
    // この起点に月別の net を足していけば、各月末の総残高 (timeline) になる。
    const initialBalanceSum = balanceRows.reduce((acc, b) => acc + b.initialBalance, 0);
    const netBefore = netBeforeRows[0] ?? { income: 0, expense: 0 };
    let running = initialBalanceSum + netBefore.income - netBefore.expense;
    const balanceTimeline: BalanceTimelineEntry[] = monthly.map((m) => {
      running += m.income - m.expense;
      return { period: m.period, balance: running };
    });

    return {
      period,
      summary,
      monthly,
      byCategory,
      balances,
      totalBalance,
      balanceTimeline,
    };
  },
};
