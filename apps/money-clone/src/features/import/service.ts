import { transactions } from "@/db/schema";
import { accountsRepo } from "@/features/accounts/repository";
import { categoriesRepo } from "@/features/categories/repository";
import { TRANSACTION_TYPES, transactionTypeLabels } from "@/features/transactions/schema";
import { parseCsv } from "@/lib/csv";
import type { Db } from "@/lib/db";
import { newId } from "@/lib/id";
import type { ImportConfirmResult, ImportPreview, PreviewRow } from "./types";

const EXPECTED_HEADER = ["日付", "種別", "金額", "口座", "カテゴリ", "メモ"];
const TYPE_LABEL_TO_VALUE = Object.fromEntries(
  TRANSACTION_TYPES.map((t) => [transactionTypeLabels[t], t]),
) as Record<string, "expense" | "income">;

type AccountMap = Map<string, { id: string }>;
type CategoryMap = Map<string, { id: string; kind: "expense" | "income" }>;

const buildLookups = async (
  db: Db,
  userId: string,
): Promise<{ accountMap: AccountMap; categoryMap: CategoryMap }> => {
  const [accounts, categories] = await Promise.all([
    accountsRepo.list(db, userId),
    categoriesRepo.list(db, userId),
  ]);
  const accountMap: AccountMap = new Map(accounts.map((a) => [a.name, { id: a.id }]));
  const categoryMap: CategoryMap = new Map(
    categories.map((c) => [c.name, { id: c.id, kind: c.kind }]),
  );
  return { accountMap, categoryMap };
};

const validateRow = (
  cells: string[],
  lineNo: number,
  accountMap: AccountMap,
  categoryMap: CategoryMap,
): PreviewRow => {
  const warnings: string[] = [];
  const [date, typeLabel, amountStr, accountName, categoryName, memo] = cells;

  if (cells.length < 5) {
    warnings.push(`列数が不足 (期待 5+, 実際 ${cells.length})`);
    return { lineNo, raw: cells, warnings };
  }

  const row: PreviewRow = { lineNo, raw: cells, warnings };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) warnings.push("日付が YYYY-MM-DD 形式でない");
  else row.date = date;

  const type = TYPE_LABEL_TO_VALUE[typeLabel ?? ""];
  if (!type) warnings.push(`種別は「支出」または「収入」のみ (実際: "${typeLabel}")`);
  else row.type = type;

  const amount = Number(amountStr);
  if (!Number.isInteger(amount) || amount <= 0) warnings.push("金額は 1 以上の整数");
  else row.amount = amount;

  const account = accountMap.get(accountName ?? "");
  if (!account) warnings.push(`未登録の口座: "${accountName}"`);
  else {
    row.accountId = account.id;
    row.accountName = accountName;
  }

  const category = categoryMap.get(categoryName ?? "");
  if (!category) warnings.push(`未登録のカテゴリ: "${categoryName}"`);
  else {
    row.categoryId = category.id;
    row.categoryName = categoryName;
    // 種別が確定しているなら kind 不整合もチェック。
    if (row.type && category.kind !== row.type) {
      warnings.push(`カテゴリ「${categoryName}」は ${category.kind} 用 (種別と不整合)`);
    }
  }

  if (memo && memo.length > 200) warnings.push("メモが 200 文字を超過");
  else if (memo) row.memo = memo;

  return row;
};

const buildPreview = (
  rows: string[][],
  accountMap: AccountMap,
  categoryMap: CategoryMap,
): ImportPreview => {
  if (rows.length === 0) {
    return { rows: [], okCount: 0, warnCount: 0, canImport: false };
  }

  const [header, ...data] = rows;
  const headerWarnings: string[] = [];
  for (let i = 0; i < EXPECTED_HEADER.length; i++) {
    if (header[i] !== EXPECTED_HEADER[i]) {
      headerWarnings.push(
        `${i + 1} 列目は "${EXPECTED_HEADER[i]}" 期待 (実際: "${header[i] ?? ""}")`,
      );
    }
  }

  const previewRows: PreviewRow[] = [];
  if (headerWarnings.length > 0) {
    previewRows.push({ lineNo: 1, raw: header, warnings: headerWarnings });
  }

  for (let i = 0; i < data.length; i++) {
    previewRows.push(validateRow(data[i], i + 2, accountMap, categoryMap));
  }

  const warnCount = previewRows.filter((r) => r.warnings.length > 0).length;
  const okCount = previewRows.length - warnCount;
  // データ行が 0 件のときは canImport=false に倒す (空ファイル防止)。
  const hasData = data.length > 0;
  return {
    rows: previewRows,
    okCount,
    warnCount,
    canImport: hasData && warnCount === 0,
  };
};

export const importService = {
  preview: async (db: Db, userId: string, csvText: string): Promise<ImportPreview> => {
    const { accountMap, categoryMap } = await buildLookups(db, userId);
    return buildPreview(parseCsv(csvText), accountMap, categoryMap);
  },

  // preview を再算出し、warning 0 件なら batch insert で一括登録 (途中失敗で rollback)。
  confirm: async (db: Db, userId: string, csvText: string): Promise<ImportConfirmResult> => {
    const { accountMap, categoryMap } = await buildLookups(db, userId);
    const preview = buildPreview(parseCsv(csvText), accountMap, categoryMap);
    if (!preview.canImport) return { ok: false, preview };

    const now = new Date();
    const stmts = preview.rows.map((r) =>
      db.insert(transactions).values({
        id: newId(),
        userId,
        date: r.date!,
        amount: r.amount!,
        type: r.type!,
        accountId: r.accountId!,
        categoryId: r.categoryId!,
        memo: r.memo ?? null,
        createdAt: now,
        updatedAt: now,
      }),
    );

    if (stmts.length === 0) return { ok: false, preview };
    // D1 batch は all-or-nothing。途中失敗時は自動で rollback される。
    // drizzle の batch 型は [stmt, ...stmt[]] 期待。長さ 0 は上で弾いている。
    await db.batch(stmts as [(typeof stmts)[number], ...(typeof stmts)[number][]]);
    return { ok: true, inserted: stmts.length };
  },
};
