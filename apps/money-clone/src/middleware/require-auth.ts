import { createMiddleware } from "hono/factory";
import type { AuthVariables } from "./auth";

export const requireAuth = createMiddleware<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>(async (c, next) => {
  if (!c.get("user")) return c.redirect("/login", 303);
  // 認証必須ページは Inertia の history encryption (AES-256-GCM, sessionStorage 保管) を有効化。
  // ログアウト後にブラウザ「戻る」で前ユーザーのデータが復元されないように。
  c.encryptHistory();
  await next();
});
