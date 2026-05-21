import { accountsService } from "@/features/accounts/service";
import { categoriesService } from "@/features/categories/service";
import type { Db } from "@/lib/db";
import { transactionsRepo } from "./repository";
import type { CreateTransactionRequest, TransactionType, UpdateTransactionRequest } from "./schema";

type Filter = {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  period?: string;
};

export type ValidationError = {
  ok: false;
  reason: "invalid-account" | "invalid-category" | "kind-mismatch";
};

export type CreateResult = { ok: true; id: string } | ValidationError;
export type UpdateResult = { ok: true } | ValidationError | { ok: false; reason: "not-found" };

// 別ユーザーの account / category を指定されないように、user スコープで存在を確認。
// type と category.kind の整合性 (収入カテゴリに支出取引を紐づけない) もここで担保。
const validate = async (
  db: Db,
  userId: string,
  input: { accountId: string; categoryId: string; type: TransactionType },
): Promise<ValidationError | { ok: true }> => {
  const account = await accountsService.get(db, userId, input.accountId);
  if (!account) return { ok: false, reason: "invalid-account" };
  const category = await categoriesService.get(db, userId, input.categoryId);
  if (!category) return { ok: false, reason: "invalid-category" };
  if (category.kind !== input.type) return { ok: false, reason: "kind-mismatch" };
  return { ok: true };
};

export const transactionsService = {
  list: (db: Db, userId: string, filter: Filter = {}) => transactionsRepo.list(db, userId, filter),

  get: (db: Db, userId: string, id: string) => transactionsRepo.findById(db, userId, id),

  create: async (
    db: Db,
    userId: string,
    input: CreateTransactionRequest,
  ): Promise<CreateResult> => {
    const validation = await validate(db, userId, input);
    if (!validation.ok) return validation;
    const created = await transactionsRepo.create(db, userId, input);
    return { ok: true, id: created.id };
  },

  update: async (
    db: Db,
    userId: string,
    id: string,
    input: UpdateTransactionRequest,
  ): Promise<UpdateResult> => {
    const existing = await transactionsRepo.findById(db, userId, id);
    if (!existing) return { ok: false, reason: "not-found" };
    const validation = await validate(db, userId, input);
    if (!validation.ok) return validation;
    await transactionsRepo.update(db, userId, id, input);
    return { ok: true };
  },

  remove: (db: Db, userId: string, id: string) => transactionsRepo.remove(db, userId, id),
};
