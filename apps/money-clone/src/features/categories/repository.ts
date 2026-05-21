import { categories } from "@/db/schema";
import type { Db } from "@/lib/db";
import { newId } from "@/lib/id";
import { and, asc, eq } from "drizzle-orm";
import type { CategoryKind } from "./schema";

type CategoryInput = {
  name: string;
  kind: CategoryKind;
  color: string;
};

export const categoriesRepo = {
  list: (db: Db, userId: string) =>
    db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      // kind ごとにまとめて見せたいので kind ASC → 名前 ASC。
      .orderBy(asc(categories.kind), asc(categories.name)),

  findById: async (db: Db, userId: string, id: string) => {
    const [row] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.id, id)))
      .limit(1);
    return row;
  },

  create: async (db: Db, userId: string, input: CategoryInput) => {
    const now = new Date();
    const id = newId();
    await db.insert(categories).values({
      id,
      userId,
      name: input.name,
      kind: input.kind,
      color: input.color,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },

  update: async (db: Db, userId: string, id: string, input: CategoryInput) => {
    await db
      .update(categories)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(categories.userId, userId), eq(categories.id, id)));
  },

  remove: async (db: Db, userId: string, id: string) => {
    await db.delete(categories).where(and(eq(categories.userId, userId), eq(categories.id, id)));
  },
};
