import { getDb } from "@/lib/db";
import { toInertiaErrors, vJson, vParam, vQuery } from "@/lib/validator";
import { type Context, Hono } from "hono";
import { createTaskSchema, listFilterSchema, taskIdParamSchema, toggleTaskSchema } from "./schema";
import { tasksService } from "./service";

type AppContext = Context<{ Bindings: CloudflareBindings }>;

export const tasksApp = new Hono<{ Bindings: CloudflareBindings }>()
  .get("/", vQuery(listFilterSchema), async (c) => {
    const filter = c.req.valid("query");
    const rows = await tasksService.list(getDb(c.env), filter);
    return c.render("Home", { tasks: rows, filter });
  })
  .post(
    "/tasks",
    vJson(createTaskSchema, (result, c: AppContext) => {
      if (!result.success) {
        c.flash("errors", toInertiaErrors(result.error));
        return c.back();
      }
    }),
    async (c) => {
      await tasksService.create(getDb(c.env), c.req.valid("json"));
      return c.redirect("/", 303);
    },
  )
  .patch("/tasks/:id", vParam(taskIdParamSchema), vJson(toggleTaskSchema), async (c) => {
    const { id } = c.req.valid("param");
    const { done } = c.req.valid("json");
    await tasksService.toggle(getDb(c.env), id, done);
    return c.redirect("/", 303);
  })
  .delete("/tasks/:id", vParam(taskIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    await tasksService.delete(getDb(c.env), id);
    return c.redirect("/", 303);
  });
