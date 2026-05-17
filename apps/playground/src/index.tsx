import { Hono } from "hono";
import { inertia } from "./inertia";
import users from "./routes/users";

let lastFormSubmission: Record<string, unknown> | null = null;

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
  .route("/", users);

export default app;
