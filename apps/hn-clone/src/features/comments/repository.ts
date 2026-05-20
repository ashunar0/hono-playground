import { user } from "@/db/auth-schema";
import { commentVotes, comments } from "@/db/schema";
import type { Db } from "@/lib/db";
import { and, eq, sql } from "drizzle-orm";

const voteCount = sql<number>`count(${commentVotes.userId})`.as("vote_count");

// userId が一票でも持っていれば 1。未ログインは空文字を渡すので 0。
const votedBy = (userId: string) =>
  sql<number>`coalesce(max(case when ${commentVotes.userId} = ${userId} then 1 else 0 end), 0)`.as(
    "voted",
  );

export const commentsRepo = {
  // story に紐づくコメントを全件 flat で取得 (古い順)。ツリー化は service 層で行う。
  // vote 数は story と同じく中間表の COUNT、voted は自分の票の有無。
  listByStory: (db: Db, userId: string, storyId: number) =>
    db
      .select({
        id: comments.id,
        parentId: comments.parentId,
        authorName: user.name,
        text: comments.text,
        createdAt: comments.createdAt,
        voteCount,
        voted: votedBy(userId),
      })
      .from(comments)
      .leftJoin(user, eq(user.id, comments.authorId))
      .leftJoin(commentVotes, eq(commentVotes.commentId, comments.id))
      .where(eq(comments.storyId, storyId))
      .groupBy(comments.id)
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

  findVote: async (db: Db, userId: string, commentId: number) => {
    const [row] = await db
      .select({ commentId: commentVotes.commentId })
      .from(commentVotes)
      .where(and(eq(commentVotes.userId, userId), eq(commentVotes.commentId, commentId)))
      .limit(1);
    return row;
  },

  addVote: (db: Db, userId: string, commentId: number) =>
    db
      .insert(commentVotes)
      .values({ userId, commentId, createdAt: new Date() })
      .onConflictDoNothing(),

  removeVote: (db: Db, userId: string, commentId: number) =>
    db
      .delete(commentVotes)
      .where(and(eq(commentVotes.userId, userId), eq(commentVotes.commentId, commentId))),
};
