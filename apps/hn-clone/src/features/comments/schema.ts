import { z } from "zod";

export const createCommentSchema = z.object({
  text: z
    .string({ message: "コメントを入力してください" })
    .trim()
    .min(1, { message: "コメントを入力してください" })
    .max(5000, { message: "コメントは5000文字以内にしてください" }),
  // 返信なら親コメント id。トップレベルは hidden input を出さず未送信 = undefined。
  parentId: z
    .union([z.coerce.number().int().positive(), z.literal("").transform(() => undefined)])
    .optional(),
});

export type CreateCommentRequest = z.infer<typeof createCommentSchema>;

export const storyIdParamSchema = z.object({
  storyId: z.coerce.number().int().positive(),
});

export type StoryIdParam = z.infer<typeof storyIdParamSchema>;
