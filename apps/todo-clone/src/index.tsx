import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { tasks } from "./db/schema";
import { inertia } from "./inertia";

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use(inertia)
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const rows = await db.select().from(tasks);
    return c.render("Home", { tasks: rows });
  });

export default app;
