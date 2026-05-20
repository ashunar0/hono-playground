import { relations } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export const stories = sqliteTable(
  "stories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    // url か text のどちらか一方。「どちらか必須」はアプリ層 (Zod) で担保する。
    url: text("url"),
    text: text("text"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => ({
    authorIdIdx: index("stories_author_id_idx").on(t.authorId),
    createdAtIdx: index("stories_created_at_idx").on(t.createdAt),
  }),
);

export const comments = sqliteTable(
  "comments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    storyId: integer("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    // 自己参照。トップレベルコメントは parentId = null。
    parentId: integer("parent_id").references((): AnySQLiteColumn => comments.id, {
      onDelete: "cascade",
    }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => ({
    storyIdIdx: index("comments_story_id_idx").on(t.storyId),
    parentIdIdx: index("comments_parent_id_idx").on(t.parentId),
  }),
);

// 1 人 1 票を (user_id, story_id) の複合 PK で保証する中間表。
export const storyVotes = sqliteTable(
  "story_votes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    storyId: integer("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.storyId] }),
    storyIdIdx: index("story_votes_story_id_idx").on(t.storyId),
  }),
);

export const commentVotes = sqliteTable(
  "comment_votes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    commentId: integer("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.commentId] }),
    commentIdIdx: index("comment_votes_comment_id_idx").on(t.commentId),
  }),
);

export const storiesRelations = relations(stories, ({ many }) => ({
  comments: many(comments),
  votes: many(storyVotes),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  story: one(stories, { fields: [comments.storyId], references: [stories.id] }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_parent",
  }),
  replies: many(comments, { relationName: "comment_parent" }),
  votes: many(commentVotes),
}));

export const storyVotesRelations = relations(storyVotes, ({ one }) => ({
  story: one(stories, { fields: [storyVotes.storyId], references: [stories.id] }),
}));

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
  comment: one(comments, { fields: [commentVotes.commentId], references: [comments.id] }),
}));
