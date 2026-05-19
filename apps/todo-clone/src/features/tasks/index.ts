import { getDb } from "@/lib/db";
import { toInertiaErrors, vJson, vParam, vQuery } from "@/lib/validator";
import type { AuthVariables } from "@/middleware/auth";
import { requireAuth } from "@/middleware/require-auth";
import { type Context, Hono } from "hono";
import { createTaskSchema, listFilterSchema, taskIdParamSchema, toggleTaskSchema } from "./schema";
import { tasksService } from "./service";

type AppEnv = { Bindings: CloudflareBindings; Variables: AuthVariables };
type AppContext = Context<AppEnv>;

export const tasksApp = new Hono<AppEnv>()
  .use(requireAuth)
  .get("/", vQuery(listFilterSchema), async (c) => {
    const filter = c.req.valid("query");
    const user = c.get("user")!;
    const rows = await tasksService.list(getDb(c.env), user.id, filter);
    return c.render("Home", { tasks: rows, filter, user });
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
      const user = c.get("user")!;
      await tasksService.create(getDb(c.env), user.id, c.req.valid("json"));
      c.flash("toast", { type: "success", message: "タスクを追加したのだ" });
      return c.back("/");
    },
  )
  .patch("/tasks/:id", vParam(taskIdParamSchema), vJson(toggleTaskSchema), async (c) => {
    const { id } = c.req.valid("param");
    const { done } = c.req.valid("json");
    const user = c.get("user")!;
    await tasksService.toggle(getDb(c.env), user.id, id, done);
    c.flash("toast", {
      type: "success",
      message: done ? "完了にしたのだ" : "未完了に戻したのだ",
    });
    return c.back("/");
  })
  .delete("/tasks/:id", vParam(taskIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const user = c.get("user")!;
    await tasksService.delete(getDb(c.env), user.id, id);
    c.flash("toast", { type: "success", message: "タスクを削除したのだ" });
    return c.back("/");
  });
