import { accounts } from "@/db/schema";
import type { Db } from "@/lib/db";
import { newId } from "@/lib/id";
import { and, asc, eq } from "drizzle-orm";
import type { AccountType } from "./schema";

type AccountInput = {
  name: string;
  type: AccountType;
  initialBalance: number;
};

export const accountsRepo = {
  list: (db: Db, userId: string) =>
    db.select().from(accounts).where(eq(accounts.userId, userId)).orderBy(asc(accounts.createdAt)),

  findById: async (db: Db, userId: string, id: string) => {
    const [row] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.id, id)))
      .limit(1);
    return row;
  },

  create: async (db: Db, userId: string, input: AccountInput) => {
    const now = new Date();
    const id = newId();
    await db.insert(accounts).values({
      id,
      userId,
      name: input.name,
      type: input.type,
      initialBalance: input.initialBalance,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },

  update: async (db: Db, userId: string, id: string, input: AccountInput) => {
    await db
      .update(accounts)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(accounts.userId, userId), eq(accounts.id, id)));
  },

  remove: async (db: Db, userId: string, id: string) => {
    await db.delete(accounts).where(and(eq(accounts.userId, userId), eq(accounts.id, id)));
  },
};
