import { z } from "zod";

export const ACCOUNT_TYPES = ["cash", "bank", "card", "other"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const accountTypeLabels: Record<AccountType, string> = {
  cash: "現金",
  bank: "銀行",
  card: "カード",
  other: "その他",
};

export const createAccountSchema = z.object({
  name: z
    .string({ message: "口座名を入力してください" })
    .trim()
    .min(1, { message: "口座名を入力してください" })
    .max(50, { message: "口座名は50文字以内にしてください" }),
  type: z.enum(ACCOUNT_TYPES, { message: "種別を選択してください" }),
  // 円単位の整数。フォームから来る string も coerce で許容。
  initialBalance: z.coerce
    .number({ message: "0 以上の整数で入力してください" })
    .int({ message: "整数で入力してください" })
    .min(0, { message: "0 以上で入力してください" })
    .default(0),
});

export type CreateAccountRequest = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = createAccountSchema;
export type UpdateAccountRequest = z.infer<typeof updateAccountSchema>;

export const accountIdParamSchema = z.object({
  id: z.string().min(1),
});

export type AccountIdParam = z.infer<typeof accountIdParamSchema>;
