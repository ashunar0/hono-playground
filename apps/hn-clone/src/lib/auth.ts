import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import type { Db } from "./db";

type AuthEnv = Pick<CloudflareBindings, "BETTER_AUTH_URL" | "BETTER_AUTH_SECRET">;

export function createAuth(db?: Db, env?: AuthEnv) {
  return betterAuth({
    baseURL: env?.BETTER_AUTH_URL,
    secret: env?.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db ?? ({} as Db), { provider: "sqlite" }),
    emailAndPassword: { enabled: true },
    trustedOrigins: env?.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : undefined,
  });
}

export const auth = createAuth();
