import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import type { Db } from "./db";

type AuthEnv = Pick<CloudflareBindings, "BETTER_AUTH_URL" | "BETTER_AUTH_SECRET">;

type CreateAuthOptions = {
  db?: Db;
  env?: AuthEnv;
  // user 作成直後に呼ばれるフック。money-clone では signup 後の seed に使う。
  onUserCreate?: (user: { id: string }) => Promise<void> | void;
};

export function createAuth(options: CreateAuthOptions = {}) {
  const { db, env, onUserCreate } = options;
  return betterAuth({
    baseURL: env?.BETTER_AUTH_URL,
    secret: env?.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db ?? ({} as Db), { provider: "sqlite" }),
    emailAndPassword: { enabled: true },
    trustedOrigins: env?.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : undefined,
    databaseHooks: onUserCreate
      ? {
          user: {
            create: {
              after: async (user) => {
                await onUserCreate({ id: user.id });
              },
            },
          },
        }
      : undefined,
  });
}

// better-auth CLI で schema 生成するときに参照する no-op インスタンス。
export const auth = createAuth();
