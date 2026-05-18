import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { vJson, vParam } from "../../lib/validator";
import {
  createTaskSchema,
  taskIdParamSchema,
  toggleTaskSchema,
} from "./schema";
import { tasksService } from "./service";

export const tasksApp = new Hono<{ Bindings: CloudflareBindings }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const rows = await tasksService.list(db);
    return c.render("Home", { tasks: rows });
  })
  .post("/tasks", vJson(createTaskSchema), async (c) => {
    const db = drizzle(c.env.DB);
    await tasksService.create(db, c.req.valid("json"));
    return c.redirect("/", 303);
  })
  .patch(
    "/tasks/:id",
    vParam(taskIdParamSchema),
    vJson(toggleTaskSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const { done } = c.req.valid("json");
      const db = drizzle(c.env.DB);
      await tasksService.toggle(db, id, done);
      return c.redirect("/", 303);
    },
  )
  .delete("/tasks/:id", vParam(taskIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const db = drizzle(c.env.DB);
    await tasksService.delete(db, id);
    return c.redirect("/", 303);
  });
