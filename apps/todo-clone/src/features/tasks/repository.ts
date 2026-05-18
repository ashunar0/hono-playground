import { and, eq, inArray, lt } from "drizzle-orm";
import { tags, tasks, tasksTags } from "../../db/schema";
import type { Db } from "../../lib/db";

type ListOptions = {
  status?: "open" | "done" | "all";
  tag?: string;
  overdue?: boolean;
  now?: Date;
};

export const tasksRepo = {
  list: (db: Db, options: ListOptions = {}) => {
    const { status = "open", tag, overdue, now = new Date() } = options;
    const conditions = [];
    if (status === "open") conditions.push(eq(tasks.done, false));
    else if (status === "done") conditions.push(eq(tasks.done, true));
    if (overdue) conditions.push(lt(tasks.dueAt, now));
    if (tag) {
      const taggedTaskIds = db
        .select({ id: tasksTags.taskId })
        .from(tasksTags)
        .innerJoin(tags, eq(tasksTags.tagId, tags.id))
        .where(eq(tags.name, tag));
      conditions.push(inArray(tasks.id, taggedTaskIds));
    }
    return db.query.tasks.findMany({
      with: {
        tasksTags: { with: { tag: true } },
      },
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: tasks.createdAt,
    });
  },

  create: async (db: Db, input: { title: string; dueAt?: Date }) => {
    const [row] = await db
      .insert(tasks)
      .values({ title: input.title, dueAt: input.dueAt, createdAt: new Date() })
      .returning({ id: tasks.id });
    return row;
  },

  updateDone: (db: Db, id: number, done: boolean) =>
    db.update(tasks).set({ done }).where(eq(tasks.id, id)),

  delete: (db: Db, id: number) => db.delete(tasks).where(eq(tasks.id, id)),

  attachTags: (db: Db, taskId: number, tagIds: number[]) => {
    if (tagIds.length === 0) return;
    return db.insert(tasksTags).values(tagIds.map((tagId) => ({ taskId, tagId })));
  },
};

export const tagsRepo = {
  upsertByNames: async (db: Db, names: string[]) => {
    if (names.length === 0) return [];
    await db
      .insert(tags)
      .values(names.map((name) => ({ name, createdAt: new Date() })))
      .onConflictDoNothing();
    const rows = await db.select().from(tags).where(inArray(tags.name, names));
    return rows.map((r) => r.id);
  },
};
