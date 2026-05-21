import { z } from "zod";

export const CATEGORY_KINDS = ["expense", "income"] as const;
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

export const categoryKindLabels: Record<CategoryKind, string> = {
  expense: "支出",
  income: "収入",
};

// グラフ用の固定パレット。ユーザーはここから選ぶだけにして自由入力させない。
export const CATEGORY_COLORS = [
  "#f97316", // orange
  "#3b82f6", // blue
  "#eab308", // yellow
  "#06b6d4", // cyan
  "#8b5cf6", // purple
  "#ef4444", // red
  "#ec4899", // pink
  "#6b7280", // gray
  "#22c55e", // green
  "#14b8a6", // teal
  "#84cc16", // lime
] as const;

export const createCategorySchema = z.object({
  name: z
    .string({ message: "カテゴリ名を入力してください" })
    .trim()
    .min(1, { message: "カテゴリ名を入力してください" })
    .max(50, { message: "カテゴリ名は50文字以内にしてください" }),
  kind: z.enum(CATEGORY_KINDS, { message: "種別を選択してください" }),
  color: z
    .string({ message: "色を選択してください" })
    .regex(/^#[0-9a-fA-F]{6}$/, { message: "色は #rrggbb 形式で入力してください" }),
});

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;

export const categoryIdParamSchema = z.object({
  id: z.string().min(1),
});

export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
