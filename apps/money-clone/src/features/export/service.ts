import { transactionsRepo } from "@/features/transactions/repository";
import { transactionTypeLabels } from "@/features/transactions/schema";
import { toCsv } from "@/lib/csv";
import type { Db } from "@/lib/db";

const HEADER = ["日付", "種別", "金額", "口座", "カテゴリ", "メモ"];

export const exportService = {
  buildTransactionsCsv: async (db: Db, userId: string, period?: string): Promise<string> => {
    const items = await transactionsRepo.list(db, userId, { period });
    // export は古い順が会計感覚で自然。list は表示用に desc(date) なので逆順。
    const rows = [...items]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((t) => [
        t.date,
        transactionTypeLabels[t.type],
        t.amount,
        t.accountName,
        t.categoryName,
        t.memo,
      ]);
    return toCsv([HEADER, ...rows]);
  },
};
