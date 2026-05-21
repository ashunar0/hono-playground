import { accounts, categories, transactions } from "@/db/schema";
import type { Db } from "@/lib/db";
import { and, desc, eq, gte, like, lt, sql } from "drizzle-orm";

export const dashboardRepo = {
  // 当月の type 別合計 (収入 / 支出 を 1 クエリで)
  summaryByType: (db: Db, userId: string, period: string) =>
    db
      .select({
        type: transactions.type,
        total: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), like(transactions.date, `${period}-%`)))
      .groupBy(transactions.type),

  // 直近 N ヶ月の月×type 合計。月は YYYY-MM の文字列で持っているので substr で抽出。
  // drizzle の `.as()` した SQL は groupBy/orderBy に渡せないので、SQL は alias 無しで保持し
  // select のみで `.as()` を付ける。
  monthlyByType: (db: Db, userId: string, fromDate: string) => {
    const monthExpr = sql<string>`substr(${transactions.date}, 1, 7)`;
    return db
      .select({
        month: sql<string>`substr(${transactions.date}, 1, 7)`.as("month"),
        type: transactions.type,
        total: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), gte(transactions.date, fromDate)))
      .groupBy(monthExpr, transactions.type)
      .orderBy(monthExpr);
  },

  // 当月のカテゴリ別 支出合計 (収入は除外、グラフ向け、降順)
  expenseByCategory: (db: Db, userId: string, period: string) => {
    const totalExpr = sql<number>`coalesce(sum(${transactions.amount}), 0)`;
    return db
      .select({
        categoryId: transactions.categoryId,
        name: categories.name,
        color: categories.color,
        total: sql<number>`coalesce(sum(${transactions.amount}), 0)`.as("total"),
      })
      .from(transactions)
      .innerJoin(categories, eq(categories.id, transactions.categoryId))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "expense"),
          like(transactions.date, `${period}-%`),
        ),
      )
      .groupBy(transactions.categoryId, categories.name, categories.color)
      .orderBy(desc(totalExpr));
  },

  // fromDate より前の (income, expense) 合計。timeline 起点の算出に使う。
  netBefore: (db: Db, userId: string, fromDate: string) =>
    db
      .select({
        income: sql<number>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end), 0)`,
        expense: sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amount} else 0 end), 0)`,
      })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), lt(transactions.date, fromDate))),

  // 口座別の累計 (初期残高 + 収入 - 支出)。取引 0 件の口座も LEFT JOIN で残す。
  accountBalances: (db: Db, userId: string) =>
    db
      .select({
        id: accounts.id,
        name: accounts.name,
        type: accounts.type,
        initialBalance: accounts.initialBalance,
        income: sql<number>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end), 0)`,
        expense: sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amount} else 0 end), 0)`,
      })
      .from(accounts)
      .leftJoin(transactions, eq(transactions.accountId, accounts.id))
      .where(eq(accounts.userId, userId))
      .groupBy(accounts.id, accounts.name, accounts.type, accounts.initialBalance),
};
