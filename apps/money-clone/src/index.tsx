import { Hono } from "hono";
import { accountsApp } from "./features/accounts";
import { authApp } from "./features/auth";
import { categoriesApp } from "./features/categories";
import { dashboardService } from "./features/dashboard/service";
import { exportApp } from "./features/export";
import { importApp } from "./features/import";
import { transactionsApp } from "./features/transactions";
import { flash, inertia } from "./inertia";
import { getDb } from "./lib/db";
import { currentPeriod, isValidPeriod } from "./lib/period";
import { authMiddleware, type AuthVariables } from "./middleware/auth";
import { shareUser } from "./middleware/share-user";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>()
  .use(authMiddleware)
  .use(inertia)
  .use(flash)
  // shareUser は c.share (plus) に依存するので inertia の後。
  .use(shareUser)
  .route("/", authApp)
  .route("/", accountsApp)
  .route("/", categoriesApp)
  .route("/", transactionsApp)
  .route("/", exportApp)
  .route("/", importApp)
  .get("/", async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.render("Home", { message: "ようこそ、家計簿アプリへ" });
    }
    const rawPeriod = c.req.query("period");
    const period = rawPeriod && isValidPeriod(rawPeriod) ? rawPeriod : currentPeriod();
    const dashboard = await dashboardService.build(getDb(c.env), user.id, period);
    return c.render("Dashboard", { dashboard });
  });

export default app;
