import type { Db } from "@/lib/db";
import { categoriesRepo } from "./repository";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "./schema";

export type RemoveResult =
  | { ok: true }
  | { ok: false; reason: "not-found" | "has-transactions" };

export const categoriesService = {
  list: (db: Db, userId: string) => categoriesRepo.list(db, userId),
  get: (db: Db, userId: string, id: string) => categoriesRepo.findById(db, userId, id),
  create: (db: Db, userId: string, input: CreateCategoryRequest) =>
    categoriesRepo.create(db, userId, input),
  update: (db: Db, userId: string, id: string, input: UpdateCategoryRequest) =>
    categoriesRepo.update(db, userId, id, input),
  remove: async (db: Db, userId: string, id: string): Promise<RemoveResult> => {
    const existing = await categoriesRepo.findById(db, userId, id);
    if (!existing) return { ok: false, reason: "not-found" };
    try {
      await categoriesRepo.remove(db, userId, id);
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("foreign key")) {
        return { ok: false, reason: "has-transactions" };
      }
      throw err;
    }
  },
};
