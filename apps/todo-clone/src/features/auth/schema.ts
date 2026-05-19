import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "メールアドレスの形式が正しくありません" }),
  password: z.string().min(8, { message: "パスワードは8文字以上必要です" }),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export const signupSchema = loginSchema.extend({
  name: z.string().trim().min(1, { message: "名前を入力してください" }),
});

export type SignupRequest = z.infer<typeof signupSchema>;
