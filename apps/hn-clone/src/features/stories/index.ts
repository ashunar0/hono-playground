import { getDb } from "@/lib/db";
import { toInertiaErrors, vJson, vParam, vQuery } from "@/lib/validator";
import type { AuthVariables } from "@/middleware/auth";
import { requireAuth } from "@/middleware/require-auth";
import { type Context, Hono } from "hono";
import { commentsService } from "../comments/service";
import { createStorySchema, listQuerySchema, storyIdParamSchema } from "./schema";
import { storiesService } from "./service";

type AppEnv = { Bindings: CloudflareBindings; Variables: AuthVariables };
type AppContext = Context<AppEnv>;

export const storiesApp = new Hono<AppEnv>()
  // 一覧・詳細は未ログインでも閲覧可。投稿だけ requireAuth を個別に付ける。
  .get("/", vQuery(listQuerySchema), async (c) => {
    const { sort } = c.req.valid("query");
    const stories = await storiesService.list(getDb(c.env), sort);
    return c.render("Home", { stories, sort });
  })
  .get("/submit", requireAuth, (c) => c.render("Submit"))
  .post(
    "/submit",
    requireAuth,
    vJson(createStorySchema, (result, c: AppContext) => {
      if (!result.success) {
        c.flash("errors", toInertiaErrors(result.error));
        return c.back();
      }
    }),
    async (c) => {
      const user = c.get("user")!;
      const created = await storiesService.create(getDb(c.env), user.id, c.req.valid("json"));
      c.flash("toast", { type: "success", message: "投稿したのだ" });
      return c.redirect(created ? `/stories/${created.id}` : "/", 303);
    },
  )
  .get("/stories/:id", vParam(storyIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const db = getDb(c.env);
    const story = await storiesService.get(db, id);
    if (!story) {
      c.flash("toast", { type: "error", message: "投稿が見つからなかったのだ" });
      return c.redirect("/", 303);
    }
    const comments = await commentsService.tree(db, id);
    return c.render("Story", { story, comments });
  });
