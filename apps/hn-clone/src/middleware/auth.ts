import { createMiddleware } from "hono/factory";
import { createAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";

type Auth = ReturnType<typeof createAuth>;
type Session = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;

export type AuthVariables = {
  auth: Auth;
  user: Session["user"] | null;
  session: Session["session"] | null;
};

export const authMiddleware = createMiddleware<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>(async (c, next) => {
  const auth = createAuth(getDb(c.env), c.env);
  const result = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("auth", auth);
  c.set("user", result?.user ?? null);
  c.set("session", result?.session ?? null);
  await next();
});
