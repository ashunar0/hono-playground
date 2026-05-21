import { z } from "zod";

export const TRANSACTION_TYPES = ["expense", "income"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const transactionTypeLabels: Record<TransactionType, string> = {
  expense: "支出",
  income: "収入",
};

export const createTransactionSchema = z.object({
  date: z
    .string({ message: "日付を入力してください" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "日付の形式が正しくありません" }),
  // フォームから来る string も coerce。1 円未満や負は弾く。
  amount: z.coerce
    .number({ message: "金額を入力してください" })
    .int({ message: "整数で入力してください" })
    .positive({ message: "1 以上で入力してください" }),
  type: z.enum(TRANSACTION_TYPES, { message: "種別を選択してください" }),
  accountId: z
    .string({ message: "口座を選択してください" })
    .min(1, { message: "口座を選択してください" }),
  categoryId: z
    .string({ message: "カテゴリを選択してください" })
    .min(1, { message: "カテゴリを選択してください" }),
  memo: z
    .union([
      z.string().trim().max(200, { message: "メモは200文字以内にしてください" }),
      z.literal("").transform(() => undefined),
    ])
    .optional(),
});

export type CreateTransactionRequest = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = createTransactionSchema;
export type UpdateTransactionRequest = z.infer<typeof updateTransactionSchema>;

export const transactionIdParamSchema = z.object({
  id: z.string().min(1),
});

export type TransactionIdParam = z.infer<typeof transactionIdParamSchema>;

export const transactionFilterSchema = z.object({
  // 空文字は「絞り込みなし」として undefined に倒す。
  accountId: z
    .union([z.string().trim().min(1), z.literal("").transform(() => undefined)])
    .optional(),
  categoryId: z
    .union([z.string().trim().min(1), z.literal("").transform(() => undefined)])
    .optional(),
  type: z.union([z.enum(TRANSACTION_TYPES), z.literal("").transform(() => undefined)]).optional(),
  // 'YYYY-MM'。指定なしは「全期間」。URL state として MonthPager から渡される。
  period: z
    .union([z.string().regex(/^\d{4}-\d{2}$/), z.literal("").transform(() => undefined)])
    .optional(),
});

export type TransactionFilter = z.infer<typeof transactionFilterSchema>;
