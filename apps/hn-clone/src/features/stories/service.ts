import type { Db } from "@/lib/db";
import { storiesRepo } from "./repository";
import type { CreateStoryRequest, ListQuery } from "./schema";

// 1 ページの件数。デモで複数ページを見せたいので小さめ。
export const PAGE_SIZE = 5;

export const storiesService = {
  listPage: async (db: Db, userId: string, sort: ListQuery["sort"], page: number) => {
    const currentPage = Math.max(1, page);
    const total = await storiesRepo.countAll(db);
    const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const rows = await storiesRepo.list(db, userId, sort, PAGE_SIZE, (currentPage - 1) * PAGE_SIZE);
    // SQL の voted (0/1) を boolean に正規化。
    const items = rows.map((row) => ({ ...row, voted: row.voted === 1 }));
    return { items, currentPage, lastPage };
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
