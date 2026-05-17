import { defer, scroll } from "@ashunar0/hono-inertia-scroll";
import { Hono } from "hono";
import { inertia } from "./inertia";
import users from "./routes/users";

let lastFormSubmission: Record<string, unknown> | null = null;

const INFINITE_PER_PAGE = 5;
const INFINITE_LAST_PAGE = 6;

function buildInfiniteUsers(pageNum: number, prefix: string) {
  const startId = (pageNum - 1) * INFINITE_PER_PAGE + 1;
  return Array.from({ length: INFINITE_PER_PAGE }, (_, i) => ({
    id: startId + i,
    name: `${prefix}-User-${startId + i}`,
  }));
}

const app = new Hono()
  .use(inertia)
  .get("/", (c) => c.render("Home", { greeting: "Hello from Hono Inertia" }))
  .get("/adapter/head-keys", (c) => c.render("Adapter/HeadKeys", {}))
  .get("/adapter/form", (c) => c.render("Adapter/FormDemo", { submitted: lastFormSubmission }))
  .post("/adapter/form/success", async (c) => {
    lastFormSubmission = await c.req.json();
    return c.redirect("/adapter/form");
  })
  .post("/adapter/form/cancel-slow", async (c) => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return c.redirect("/adapter/form");
  })
  .get("/adapter/realtime", (c) => {
    return c.render("Adapter/RealtimeDemo", {
      serverTime: new Date().toISOString(),
      lazyStats: defer(async () => {
        await new Promise((r) => setTimeout(r, 800));
        return { computedAt: new Date().toISOString(), rows: 42 };
      }),
    });
  })
  .get("/adapter/infinite", (c) => {
    const url = new URL(c.req.url);
    const manualPage = Number(url.searchParams.get("manualUsers_page") ?? 3);
    const autoPage = Number(url.searchParams.get("autoUsers_page") ?? 1);
    return c.render("Adapter/InfiniteScrollDemo", {
      manualUsers: scroll({
        data: buildInfiniteUsers(manualPage, "Manual"),
        currentPage: manualPage,
        lastPage: INFINITE_LAST_PAGE,
        pageName: "manualUsers_page",
      }),
      autoUsers: scroll({
        data: buildInfiniteUsers(autoPage, "Auto"),
        currentPage: autoPage,
        lastPage: INFINITE_LAST_PAGE,
        pageName: "autoUsers_page",
      }),
    });
  })
  .route("/", users);

export default app;
