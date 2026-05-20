import { createMiddleware } from "hono/factory";
import type { AuthVariables } from "./auth";

export const requireAuth = createMiddleware<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>(async (c, next) => {
  if (!c.get("user")) return c.redirect("/login", 303);
  await next();
});
