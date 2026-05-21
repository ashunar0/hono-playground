import { getDb } from "@/lib/db";
import { toInertiaErrors, vJson, vParam } from "@/lib/validator";
import { type AppContext, type AppEnv } from "@/middleware/auth";
import { requireAuth } from "@/middleware/require-auth";
import { Hono } from "hono";
import { categoryIdParamSchema, createCategorySchema, updateCategorySchema } from "./schema";
import { categoriesService } from "./service";

export const categoriesApp = new Hono<AppEnv>()
  .use(requireAuth)
  .get("/categories", async (c) => {
    const user = c.get("user")!;
    const list = await categoriesService.list(getDb(c.env), user.id);
    return c.render("Categories/Index", { categories: list });
  })
  .get("/categories/:id/edit", vParam(categoryIdParamSchema), async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.valid("param");
    const category = await categoriesService.get(getDb(c.env), user.id, id);
    if (!category) {
      c.flash("toast", { type: "error", message: "カテゴリが見つからないのだ" });
      return c.redirect("/categories", 303);
    }
    return c.render("Categories/Edit", { category });
  })
  .post(
    "/categories",
    vJson(createCategorySchema, (result, c: AppContext) => {
      if (!result.success) {
        c.flash("errors", toInertiaErrors(result.error));
        return c.back();
      }
    }),
    async (c) => {
      const user = c.get("user")!;
      await categoriesService.create(getDb(c.env), user.id, c.req.valid("json"));
      c.flash("toast", { type: "success", message: "カテゴリを作成したのだ" });
      return c.redirect("/categories", 303);
    },
  )
  .post(
    "/categories/:id",
    vParam(categoryIdParamSchema),
    vJson(updateCategorySchema, (result, c: AppContext) => {
      if (!result.success) {
        c.flash("errors", toInertiaErrors(result.error));
        return c.back();
      }
    }),
    async (c) => {
      const user = c.get("user")!;
      const { id } = c.req.valid("param");
      await categoriesService.update(getDb(c.env), user.id, id, c.req.valid("json"));
      c.flash("toast", { type: "success", message: "カテゴリを更新したのだ" });
      return c.redirect("/categories", 303);
    },
  )
  .post("/categories/:id/delete", vParam(categoryIdParamSchema), async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.valid("param");
    const result = await categoriesService.remove(getDb(c.env), user.id, id);
    if (result.ok) {
      c.flash("toast", { type: "success", message: "カテゴリを削除したのだ" });
    } else if (result.reason === "has-transactions") {
      c.flash("toast", {
        type: "error",
        message: "このカテゴリには取引があるので削除できないのだ",
      });
    } else {
      c.flash("toast", { type: "error", message: "カテゴリが見つからないのだ" });
    }
    return c.redirect("/categories", 303);
  });
