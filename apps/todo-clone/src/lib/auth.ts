import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import type { Db } from "./db";

export function createAuth(db?: Db) {
  return betterAuth({
    database: drizzleAdapter(db ?? ({} as Db), { provider: "sqlite" }),
    emailAndPassword: { enabled: true },
  });
}

export const auth = createAuth();
