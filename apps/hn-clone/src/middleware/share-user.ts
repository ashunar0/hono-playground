import { createMiddleware } from "hono/factory";
import type { AuthVariables } from "./auth";

// ログインユーザーを Inertia の shared data に乗せ、全ページ共通 header (Layout) が
// usePage().props.user で参照できるようにする。plus の c.share に依存するので
// inertia (plus) middleware の後に置くこと。
export const shareUser = createMiddleware<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>(async (c, next) => {
  const user = c.get("user");
  c.share({
    user: user ? { id: user.id, name: user.name } : null,
  });
  await next();
});
