import { user } from "@/db/auth-schema";
import { comments } from "@/db/schema";
import type { Db } from "@/lib/db";
import { eq } from "drizzle-orm";

export const commentsRepo = {
  // story に紐づくコメントを全件 flat で取得 (古い順)。ツリー化は service 層で行う。
  listByStory: (db: Db, storyId: number) =>
    db
      .select({
        id: comments.id,
        parentId: comments.parentId,
        authorName: user.name,
        text: comments.text,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .leftJoin(user, eq(user.id, comments.authorId))
      .where(eq(comments.storyId, storyId))
      .orderBy(comments.createdAt),

  create: async (
    db: Db,
    input: { storyId: number; parentId?: number; authorId: string; text: string },
  ) => {
    const [row] = await db
      .insert(comments)
      .values({
        storyId: input.storyId,
        parentId: input.parentId,
        authorId: input.authorId,
        text: input.text,
        createdAt: new Date(),
      })
      .returning({ id: comments.id });
    return row;
  },
};
