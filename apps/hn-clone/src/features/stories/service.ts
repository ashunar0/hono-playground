import type { Db } from "@/lib/db";
import { storiesRepo } from "./repository";
import type { CreateStoryRequest, ListQuery } from "./schema";

export const storiesService = {
  list: async (db: Db, userId: string, sort: ListQuery["sort"] = "new") => {
    const rows = await storiesRepo.list(db, userId, sort);
    // SQL の voted (0/1) を boolean に正規化。
    return rows.map((row) => ({ ...row, voted: row.voted === 1 }));
  },

  get: async (db: Db, userId: string, id: number) => {
    const row = await storiesRepo.findById(db, userId, id);
    return row ? { ...row, voted: row.voted === 1 } : undefined;
  },

  create: async (db: Db, authorId: string, input: CreateStoryRequest) => {
    const created = await storiesRepo.create(db, authorId, {
      title: input.title,
      url: input.url,
      text: input.text,
    });
    return created;
  },

  // 投票済みなら取り消し、未投票なら投票するトグル。1 人 1 票。
  vote: async (db: Db, userId: string, storyId: number): Promise<{ voted: boolean }> => {
    const existing = await storiesRepo.findVote(db, userId, storyId);
    if (existing) {
      await storiesRepo.removeVote(db, userId, storyId);
      return { voted: false };
    }
    await storiesRepo.addVote(db, userId, storyId);
    return { voted: true };
  },
};
