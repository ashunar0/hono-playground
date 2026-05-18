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
