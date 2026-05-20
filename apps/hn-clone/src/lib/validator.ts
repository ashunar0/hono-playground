import { type Hook, zValidator } from "@hono/zod-validator";
import type { Env } from "hono";
import type { ZodType } from "zod";

export const vJson = <T extends ZodType, E extends Env = Env>(
  schema: T,
  hook?: Hook<unknown, E, string, "json", {}, T>,
) => zValidator("json", schema, hook as Hook<unknown, Env, string, "json", {}, T> | undefined);
export const vParam = <T extends ZodType>(schema: T) => zValidator("param", schema);
export const vQuery = <T extends ZodType>(schema: T) => zValidator("query", schema);

export type InertiaErrors = Record<string, string>;

export const toInertiaErrors = (error: {
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>;
}): InertiaErrors => {
  const out: InertiaErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_form";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
};
