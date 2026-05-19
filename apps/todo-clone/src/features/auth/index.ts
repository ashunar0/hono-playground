import { toInertiaErrors, vJson } from "@/lib/validator";
import type { AuthVariables } from "@/middleware/auth";
import { type Context, Hono } from "hono";
import { loginSchema, signupSchema } from "./schema";

type AppEnv = { Bindings: CloudflareBindings; Variables: AuthVariables };
type AppContext = Context<AppEnv>;

const forwardSetCookie = (c: AppContext, res: Response) => {
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) c.header("set-cookie", setCookie);
};

export const authApp = new Hono<AppEnv>()
  .all("/api/auth/*", (c) => c.get("auth").handler(c.req.raw))
  .get("/login", (c) => c.render("Login"))
  .get("/signup", (c) => c.render("Signup"))
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
        const message =
          err instanceof Error ? err.message : "登録に失敗しました";
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
