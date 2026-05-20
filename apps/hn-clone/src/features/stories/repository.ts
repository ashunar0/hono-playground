import { user } from "@/db/auth-schema";
import { stories, storyVotes } from "@/db/schema";
import type { Db } from "@/lib/db";
import { and, desc, eq, sql } from "drizzle-orm";

import type { ListQuery } from "./schema";

// vote 数は story_votes の COUNT。集計のため stories.id で groupBy する。
const voteCount = sql<number>`count(${storyVotes.userId})`.as("vote_count");

// userId が一票でも持っていれば 1 (= 投票済み)。未ログインは空文字を渡すので誰にも一致せず 0。
const votedBy = (userId: string) =>
  sql<number>`coalesce(max(case when ${storyVotes.userId} = ${userId} then 1 else 0 end), 0)`.as(
    "voted",
  );

const baseSelect = (db: Db, userId: string) =>
  db
    .select({
      id: stories.id,
      title: stories.title,
      url: stories.url,
      text: stories.text,
      createdAt: stories.createdAt,
      authorId: stories.authorId,
      authorName: user.name,
      voteCount,
      voted: votedBy(userId),
    })
    .from(stories)
    .leftJoin(storyVotes, eq(storyVotes.storyId, stories.id))
    .leftJoin(user, eq(user.id, stories.authorId))
    .groupBy(stories.id);

export const storiesRepo = {
  list: (db: Db, userId: string, sort: ListQuery["sort"]) => {
    const q = baseSelect(db, userId);
    // new = 投稿日時降順 / top = vote 数降順 (同数なら新しい順)。HN 式時間減衰は YAGNI。
    return sort === "top"
      ? q.orderBy(desc(voteCount), desc(stories.createdAt))
      : q.orderBy(desc(stories.createdAt));
  },

  findById: async (db: Db, userId: string, id: number) => {
    const [row] = await baseSelect(db, userId).where(eq(stories.id, id));
    return row;
  },

  create: async (
    db: Db,
    authorId: string,
    input: { title: string; url?: string; text?: string },
  ) => {
    const [row] = await db
      .insert(stories)
      .values({
        authorId,
        title: input.title,
        url: input.url,
        text: input.text,
        createdAt: new Date(),
      })
      .returning({ id: stories.id });
    return row;
  },

  findVote: async (db: Db, userId: string, storyId: number) => {
    const [row] = await db
      .select({ storyId: storyVotes.storyId })
      .from(storyVotes)
      .where(and(eq(storyVotes.userId, userId), eq(storyVotes.storyId, storyId)))
      .limit(1);
    return row;
  },

  addVote: (db: Db, userId: string, storyId: number) =>
    db
      .insert(storyVotes)
      .values({ userId, storyId, createdAt: new Date() })
      // PK (user_id, story_id) で 1 人 1 票。競合は握り潰す。
      .onConflictDoNothing(),

  removeVote: (db: Db, userId: string, storyId: number) =>
    db
      .delete(storyVotes)
      .where(and(eq(storyVotes.userId, userId), eq(storyVotes.storyId, storyId))),
};
