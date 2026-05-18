import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { tasks } from "../../db/schema";

export const tasksRepo = {
  list: (db: DrizzleD1Database) => db.select().from(tasks).orderBy(tasks.createdAt),

  create: (db: DrizzleD1Database, input: { title: string }) =>
    db.insert(tasks).values({ title: input.title, createdAt: new Date() }),

  updateDone: (db: DrizzleD1Database, id: number, done: boolean) =>
    db.update(tasks).set({ done }).where(eq(tasks.id, id)),

  delete: (db: DrizzleD1Database, id: number) => db.delete(tasks).where(eq(tasks.id, id)),
};
