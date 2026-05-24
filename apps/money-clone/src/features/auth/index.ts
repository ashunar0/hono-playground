import { toInertiaErrors, vJson } from "@/lib/validator";
import { type AppContext, type AppEnv } from "@/middleware/auth";
import { Hono } from "hono";
import { loginSchema, signupSchema } from "./schema";

const forwardSetCookie = (c: AppContext, res: Response) => {
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) c.header("set-cookie", setCookie);
};

export const authApp = new Hono<AppEnv>()
  .all("/api/auth/*", (c) => c.get("auth").handler(c.req.raw))
  .get("/login", (c) => {
    // 未認証ページ到達 = 認証外れたとみなし、sessionStorage の Inertia encryption key/iv
    // を破棄。ログアウト経由でも新規 visit でも副作用なし (key 無い時 clear は no-op)。
    c.clearHistory();
    return c.render("Login");
  })
  .get("/signup", (c) => {
    c.clearHistory();
    return c.render("Signup");
  })
  .post(
    "/login",
    vJson(loginSchema, (result, c: AppContext) => {
      if (!result.success) {
        c.flash("errors", toInertiaErrors(result.error));
        return c.back();
      }
    }),
    async (c) => {
      try {
        const res = await c.get("auth").api.signInEmail({
          body: c.req.valid("json"),
          asResponse: true,
        });
        forwardSetCookie(c, res);
        return c.redirect("/", 303);
      } catch {
        c.flash("errors", { _form: "メールアドレスまたはパスワードが正しくありません" });
        return c.back();
      }
    },
  )
  .post(
    "/signup",
    vJson(signupSchema, (result, c: AppContext) => {
      if (!result.success) {
        c.flash("errors", toInertiaErrors(result.error));
        return c.back();
      }
    }),
    async (c) => {
      try {
        const res = await c.get("auth").api.signUpEmail({
          body: c.req.valid("json"),
          asResponse: true,
        });
        forwardSetCookie(c, res);
        return c.redirect("/", 303);
      } catch (err) {
        const message = err instanceof Error ? err.message : "登録に失敗しました";
        c.flash("errors", { _form: message });
        return c.back();
      }
    },
  )
  .post("/logout", async (c) => {
    const res = await c.get("auth").api.signOut({
      headers: c.req.raw.headers,
      asResponse: true,
    });
    forwardSetCookie(c, res);
    return c.redirect("/login", 303);
  });
