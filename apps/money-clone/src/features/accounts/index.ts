import { getDb } from "@/lib/db";
import { toInertiaErrors, vJson, vParam } from "@/lib/validator";
import { type AppContext, type AppEnv } from "@/middleware/auth";
import { requireAuth } from "@/middleware/require-auth";
import { Hono } from "hono";
import { accountIdParamSchema, createAccountSchema, updateAccountSchema } from "./schema";
import { accountsService } from "./service";

export const accountsApp = new Hono<AppEnv>()
  .use(requireAuth)
  .get("/accounts", async (c) => {
    const user = c.get("user")!;
    const list = await accountsService.list(getDb(c.env), user.id);
    return c.render("Accounts/Index", { accounts: list });
  })
  .get("/accounts/:id/edit", vParam(accountIdParamSchema), async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.valid("param");
    const account = await accountsService.get(getDb(c.env), user.id, id);
    if (!account) {
      c.flash("toast", { type: "error", message: "口座が見つからないのだ" });
      return c.redirect("/accounts", 303);
    }
    return c.render("Accounts/Edit", { account });
  })
  .post(
    "/accounts",
    vJson(createAccountSchema, (result, c: AppContext) => {
      if (!result.success) {
        c.flash("errors", toInertiaErrors(result.error));
        return c.back();
      }
    }),
    async (c) => {
      const user = c.get("user")!;
      await accountsService.create(getDb(c.env), user.id, c.req.valid("json"));
      c.flash("toast", { type: "success", message: "口座を作成したのだ" });
      return c.redirect("/accounts", 303);
    },
  )
  .post(
    "/accounts/:id",
    vParam(accountIdParamSchema),
    vJson(updateAccountSchema, (result, c: AppContext) => {
      if (!result.success) {
        c.flash("errors", toInertiaErrors(result.error));
        return c.back();
      }
    }),
    async (c) => {
      const user = c.get("user")!;
      const { id } = c.req.valid("param");
      await accountsService.update(getDb(c.env), user.id, id, c.req.valid("json"));
      c.flash("toast", { type: "success", message: "口座を更新したのだ" });
      return c.redirect("/accounts", 303);
    },
  )
  .post("/accounts/:id/delete", vParam(accountIdParamSchema), async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.valid("param");
    const result = await accountsService.remove(getDb(c.env), user.id, id);
    if (result.ok) {
      c.flash("toast", { type: "success", message: "口座を削除したのだ" });
    } else if (result.reason === "has-transactions") {
      c.flash("toast", {
        type: "error",
        message: "この口座には取引があるので削除できないのだ",
      });
    } else {
      c.flash("toast", { type: "error", message: "口座が見つからないのだ" });
    }
    return c.redirect("/accounts", 303);
  });
