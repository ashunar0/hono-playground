import { z } from "zod";

// 空文字は「未入力」として undefined に倒す。todo-clone の dueAt と同じ流儀。
const optionalUrl = z
  .union([
    z.string().trim().url({ message: "URL の形式が正しくありません" }),
    z.literal("").transform(() => undefined),
  ])
  .optional();

const optionalText = z
  .union([z.string().trim().min(1), z.literal("").transform(() => undefined)])
  .optional();

export const createStorySchema = z
  .object({
    title: z
      .string({ message: "タイトルを入力してください" })
      .trim()
      .min(1, { message: "タイトルを入力してください" })
      .max(200, { message: "タイトルは200文字以内にしてください" }),
    url: optionalUrl,
    text: optionalText,
  })
  // 「URL か本文のどちらか必須」はアプリ層 (Zod) で担保。schema.ts のコメント通り DB は両 nullable。
  .refine((d) => d.url || d.text, {
    message: "URL か本文のどちらかを入力してください",
    path: ["url"],
  });

export type CreateStoryRequest = z.infer<typeof createStorySchema>;

export const listQuerySchema = z.object({
  sort: z.enum(["new", "top"]).catch("new").default("new"),
  page: z.coerce.number().int().positive().catch(1).default(1),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

export const storyIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type StoryIdParam = z.infer<typeof storyIdParamSchema>;
