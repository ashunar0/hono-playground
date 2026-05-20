import { user } from "@/db/auth-schema";
import { stories, storyVotes } from "@/db/schema";
import type { Db } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";

import type { ListQuery } from "./schema";

// vote 数は story_votes の COUNT。集計のため stories.id で groupBy する。
const voteCount = sql<number>`count(${storyVotes.userId})`.as("vote_count");

const baseSelect = (db: Db) =>
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
    })
    .from(stories)
    .leftJoin(storyVotes, eq(storyVotes.storyId, stories.id))
    .leftJoin(user, eq(user.id, stories.authorId))
    .groupBy(stories.id);

export const storiesRepo = {
  list: (db: Db, sort: ListQuery["sort"]) => {
    const q = baseSelect(db);
    // new = 投稿日時降順 / top = vote 数降順 (同数なら新しい順)。HN 式時間減衰は YAGNI。
    return sort === "top"
      ? q.orderBy(desc(voteCount), desc(stories.createdAt))
      : q.orderBy(desc(stories.createdAt));
  },

  findById: async (db: Db, id: number) => {
    const [row] = await baseSelect(db).where(eq(stories.id, id));
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
};
