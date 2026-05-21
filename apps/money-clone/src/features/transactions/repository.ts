import { accounts, categories, transactions } from "@/db/schema";
import type { Db } from "@/lib/db";
import { newId } from "@/lib/id";
import { type SQL, and, desc, eq, like } from "drizzle-orm";
import type { TransactionType } from "./schema";

type TransactionInput = {
  date: string;
  amount: number;
  type: TransactionType;
  accountId: string;
  categoryId: string;
  memo?: string;
};

type ListFilter = {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  // 'YYYY-MM'。date が 'YYYY-MM-DD' なので LIKE 'YYYY-MM-%' で月絞り込み。
  period?: string;
};

export const transactionsRepo = {
  // 一覧は account / category を JOIN して表示名・色をくっつけて返す。
  list: (db: Db, userId: string, filter: ListFilter = {}) => {
    const where: SQL[] = [eq(transactions.userId, userId)];
    if (filter.accountId) where.push(eq(transactions.accountId, filter.accountId));
    if (filter.categoryId) where.push(eq(transactions.categoryId, filter.categoryId));
    if (filter.type) where.push(eq(transactions.type, filter.type));
    if (filter.period) where.push(like(transactions.date, `${filter.period}-%`));
    return db
      .select({
        id: transactions.id,
        date: transactions.date,
        amount: transactions.amount,
        type: transactions.type,
        memo: transactions.memo,
        accountId: transactions.accountId,
        accountName: accounts.name,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
      })
      .from(transactions)
      .innerJoin(accounts, eq(accounts.id, transactions.accountId))
      .innerJoin(categories, eq(categories.id, transactions.categoryId))
      .where(and(...where))
      .orderBy(desc(transactions.date), desc(transactions.createdAt));
  },

  findById: async (db: Db, userId: string, id: string) => {
    const [row] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.id, id)))
      .limit(1);
    return row;
  },

  create: async (db: Db, userId: string, input: TransactionInput) => {
    const now = new Date();
    const id = newId();
    await db.insert(transactions).values({
      id,
      userId,
      date: input.date,
      amount: input.amount,
      type: input.type,
      accountId: input.accountId,
      categoryId: input.categoryId,
      memo: input.memo ?? null,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },

  update: async (db: Db, userId: string, id: string, input: TransactionInput) => {
    await db
      .update(transactions)
      .set({
        date: input.date,
        amount: input.amount,
        type: input.type,
        accountId: input.accountId,
        categoryId: input.categoryId,
        memo: input.memo ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(transactions.userId, userId), eq(transactions.id, id)));
  },

  remove: async (db: Db, userId: string, id: string) => {
    await db
      .delete(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.id, id)));
  },
};
