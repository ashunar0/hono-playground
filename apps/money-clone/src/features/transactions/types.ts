import type { transactionsService } from "./service";

// 一覧表示用 (JOIN 済み: account.name, category.name, category.color を含む)。
export type TransactionListItem = Awaited<ReturnType<typeof transactionsService.list>>[number];

// 編集フォーム用 (transactions テーブル単体)。
export type TransactionRow = NonNullable<Awaited<ReturnType<typeof transactionsService.get>>>;
