import { accountsService } from "@/features/accounts/service";
import { categoriesService } from "@/features/categories/service";
import { getDb } from "@/lib/db";
import { toInertiaErrors, vJson, vParam, vQuery } from "@/lib/validator";
import { type AppContext, type AppEnv } from "@/middleware/auth";
import { requireAuth } from "@/middleware/require-auth";
import { Hono } from "hono";
import type { ValidationError } from "./service";
import {
  createTransactionSchema,
  transactionFilterSchema,
  transactionIdParamSchema,
  updateTransactionSchema,
} from "./schema";
import { transactionsService } from "./service";

// service 層の validation エラーをユーザー向け文言に変換。
const validationMessage = (err: ValidationError): string => {
  switch (err.reason) {
    case "invalid-account":
      return "指定した口座が見つからないのだ";
    case "invalid-category":
      return "指定したカテゴリが見つからないのだ";
    case "kind-mismatch":
      return "種別とカテゴリの収支区分が一致しないのだ";
  }
};

export const transactionsApp = new Hono<AppEnv>()
  .use(requireAuth)
  .get("/transactions", vQuery(transactionFilterSchema), async (c) => {
    const user = c.get("user")!;
    const db = getDb(c.env);
    const filter = c.req.valid("query");
    const [items, accountList, categoryList] = await Promise.all([
      transactionsService.list(db, user.id, filter),
      accountsService.list(db, user.id),
      categoriesService.list(db, user.id),
    ]);
    return c.render("Transactions/Index", {
      transactions: items,
      accounts: accountList,
      categories: categoryList,
      filter,
    });
  })
  .get("/transactions/new", async (c) => {
    const user = c.get("user")!;
    const db = getDb(c.env);
    const [accountList, categoryList] = await Promise.all([
      accountsService.list(db, user.id),
      categoriesService.list(db, user.id),
    ]);
    return c.render("Transactions/New", {
      accounts: accountList,
      categories: categoryList,
    });
  })
  .get("/transactions/:id/edit", vParam(transactionIdParamSchema), async (c) => {
    const user = c.get("user")!;
    const db = getDb(c.env);
    const { id } = c.req.valid("param");
    const [transaction, accountList, categoryList] = await Promise.all([
      transactionsService.get(db, user.id, id),
      accountsService.list(db, user.id),
      categoriesService.list(db, user.id),
    ]);
    if (!transaction) {
      c.flash("toast", { type: "error", message: "取引が見つからないのだ" });
      return c.redirect("/transactions", 303);
    }
    return c.render("Transactions/Edit", {
      transaction,
      accounts: accountList,
      categories: categoryList,
    });
  })
  .post(
    "/transactions",
    vJson(createTransactionSchema, (result, c: AppContext) => {
      if (!result.success) {
        c.flash("errors", toInertiaErrors(result.error));
        return c.back();
      }
    }),
    async (c) => {
      const user = c.get("user")!;
      const result = await transactionsService.create(
        getDb(c.env),
        user.id,
        c.req.valid("json"),
      );
      if (!result.ok) {
        c.flash("errors", { _form: validationMessage(result) });
        return c.back();
      }
      c.flash("toast", { type: "success", message: "取引を登録したのだ" });
      return c.redirect("/transactions", 303);
    },
  )
  .post(
    "/transactions/:id",
    vParam(transactionIdParamSchema),
    vJson(updateTransactionSchema, (result, c: AppContext) => {
      if (!result.success) {
        c.flash("errors", toInertiaErrors(result.error));
        return c.back();
      }
    }),
    async (c) => {
      const user = c.get("user")!;
      const { id } = c.req.valid("param");
      const result = await transactionsService.update(
        getDb(c.env),
        user.id,
        id,
        c.req.valid("json"),
      );
      if (!result.ok) {
        if (result.reason === "not-found") {
          c.flash("toast", { type: "error", message: "取引が見つからないのだ" });
          return c.redirect("/transactions", 303);
        }
        c.flash("errors", { _form: validationMessage(result) });
        return c.back();
      }
      c.flash("toast", { type: "success", message: "取引を更新したのだ" });
      return c.redirect("/transactions", 303);
    },
  )
  .post("/transactions/:id/delete", vParam(transactionIdParamSchema), async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.valid("param");
    await transactionsService.remove(getDb(c.env), user.id, id);
    c.flash("toast", { type: "success", message: "取引を削除したのだ" });
    return c.redirect("/transactions", 303);
  });
