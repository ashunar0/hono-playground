import type { Db } from "@/lib/db";
import { commentsRepo } from "./repository";
import type { CreateCommentRequest } from "./schema";
import type { CommentNode } from "./types";

export const commentsService = {
  // flat な全件を parent_id で再帰ツリーに組み立てる (recursive CTE は使わない)。
  // listByStory が createdAt 昇順なので roots / replies とも自然に古い順で並ぶ。
  tree: async (db: Db, userId: string, storyId: number): Promise<CommentNode[]> => {
    const rows = await commentsRepo.listByStory(db, userId, storyId);
    const nodes = new Map<number, CommentNode>();
    // voted (0/1) を boolean に正規化しつつノード化。
    for (const row of rows) nodes.set(row.id, { ...row, voted: row.voted === 1, replies: [] });

    const roots: CommentNode[] = [];
    for (const row of rows) {
      const node = nodes.get(row.id)!;
      const parent = row.parentId != null ? nodes.get(row.parentId) : undefined;
      if (parent) parent.replies.push(node);
      else roots.push(node);
    }
    return roots;
  },

  create: (db: Db, storyId: number, authorId: string, input: CreateCommentRequest) =>
    commentsRepo.create(db, {
      storyId,
      parentId: input.parentId,
      authorId,
      text: input.text,
    }),

  // 投票済みなら取り消し、未投票なら投票するトグル。1 人 1 票。
  vote: async (db: Db, userId: string, commentId: number): Promise<{ voted: boolean }> => {
    const existing = await commentsRepo.findVote(db, userId, commentId);
    if (existing) {
      await commentsRepo.removeVote(db, userId, commentId);
      return { voted: false };
    }
    await commentsRepo.addVote(db, userId, commentId);
    return { voted: true };
  },
};
