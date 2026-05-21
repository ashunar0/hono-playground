import type { Db } from "@/lib/db";
import { accountsRepo } from "./repository";
import type { CreateAccountRequest, UpdateAccountRequest } from "./schema";

export type RemoveResult =
  | { ok: true }
  | { ok: false; reason: "not-found" | "has-transactions" };

export const accountsService = {
  list: (db: Db, userId: string) => accountsRepo.list(db, userId),
  get: (db: Db, userId: string, id: string) => accountsRepo.findById(db, userId, id),
  create: (db: Db, userId: string, input: CreateAccountRequest) =>
    accountsRepo.create(db, userId, input),
  update: (db: Db, userId: string, id: string, input: UpdateAccountRequest) =>
    accountsRepo.update(db, userId, id, input),
  remove: async (db: Db, userId: string, id: string): Promise<RemoveResult> => {
    const existing = await accountsRepo.findById(db, userId, id);
    if (!existing) return { ok: false, reason: "not-found" };
    try {
      await accountsRepo.remove(db, userId, id);
      return { ok: true };
    } catch (err) {
      // transactions テーブルから FK restrict で弾かれた場合。
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("foreign key")) {
        return { ok: false, reason: "has-transactions" };
      }
      throw err;
    }
  },
};
