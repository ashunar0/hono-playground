import { getDb } from "@/lib/db";
import { toInertiaErrors, vJson, vParam } from "@/lib/validator";
import type { AuthVariables } from "@/middleware/auth";
import { requireAuth } from "@/middleware/require-auth";
import { type Context, Hono } from "hono";
import { createCommentSchema, storyIdParamSchema } from "./schema";
import { commentsService } from "./service";

type AppEnv = { Bindings: CloudflareBindings; Variables: AuthVariables };
type AppContext = Context<AppEnv>;

export const commentsApp = new Hono<AppEnv>().post(
  "/stories/:storyId/comments",
  requireAuth,
  vParam(storyIdParamSchema),
  vJson(createCommentSchema, (result, c: AppContext) => {
    if (!result.success) {
      c.flash("errors", toInertiaErrors(result.error));
      return c.back();
    }
  }),
  async (c) => {
    const { storyId } = c.req.valid("param");
    const user = c.get("user")!;
    await commentsService.create(getDb(c.env), storyId, user.id, c.req.valid("json"));
    c.flash("toast", { type: "success", message: "コメントしたのだ" });
    return c.back(`/stories/${storyId}`);
  },
);
