import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string({ message: "タイトルを入力してください" })
    .trim()
    .min(1, { message: "タイトルを入力してください" }),
  dueAt: z
    .union([
      z.coerce.date({ message: "日付の形式が正しくありません" }),
      z.literal("").transform(() => undefined),
    ])
    .optional(),
  tagNames: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    ),
});

export type CreateTaskRequest = z.infer<typeof createTaskSchema>;

export const toggleTaskSchema = z.object({
  done: z.boolean(),
});

export type ToggleTaskRequest = z.infer<typeof toggleTaskSchema>;

export const taskIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type TaskIdParam = z.infer<typeof taskIdParamSchema>;

export const listFilterSchema = z.object({
  status: z.enum(["open", "done", "all"]).catch("open").default("open"),
  tag: z.string().trim().min(1).optional().catch(undefined),
  overdue: z
    .union([z.literal("1"), z.literal("0"), z.literal("true"), z.literal("false")])
    .transform((v) => v === "1" || v === "true")
    .optional()
    .catch(undefined),
});

export type ListFilter = z.infer<typeof listFilterSchema>;
