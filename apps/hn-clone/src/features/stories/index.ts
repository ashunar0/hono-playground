import { getDb } from "@/lib/db";
import { toInertiaErrors, vJson, vParam, vQuery } from "@/lib/validator";
import { type AppContext, type AppEnv } from "@/middleware/auth";
import { requireAuth } from "@/middleware/require-auth";
import { scroll } from "@ashunar0/hono-inertia-plus";
import { Hono } from "hono";
import { commentsService } from "../comments/service";
import { createStorySchema, listQuerySchema, storyIdParamSchema } from "./schema";
import { storiesService } from "./service";

export const storiesApp = new Hono<AppEnv>()
  // 一覧・詳細は未ログインでも閲覧可。投稿だけ requireAuth を個別に付ける。
  .get("/", vQuery(listQuerySchema), async (c) => {
    const { sort, page } = c.req.valid("query");
    // 未ログインは空文字 = 誰の投票にも一致せず voted は全部 false。
    const userId = c.get("user")?.id ?? "";
    const { items, currentPage, lastPage } = await storiesService.listPage(
      getDb(c.env),
      userId,
      sort,
      page,
    );
    // scroll() marker。plus が scrollProps を吐き、partial reload (append) で
    // 次ページを stories 配列にマージ (id で dedupe) する。<InfiniteScroll data="stories"> が駆動。
    return c.render("Home", {
      stories: scroll({ data: items, currentPage, lastPage, pageName: "page", matchOn: "id" }),
      sort,
    });
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
    const userId = c.get("user")?.id ?? "";
    const story = await storiesService.get(db, userId, id);
    if (!story) {
      c.flash("toast", { type: "error", message: "投稿が見つからなかったのだ" });
      return c.redirect("/", 303);
    }
    const comments = await commentsService.tree(db, userId, id);
    return c.render("Story", { story, comments });
  })
  .post("/stories/:id/vote", requireAuth, vParam(storyIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const user = c.get("user")!;
    await storiesService.vote(getDb(c.env), user.id, id);
    return c.back(`/stories/${id}`);
  });
