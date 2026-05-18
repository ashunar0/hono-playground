import type { Db } from "@/lib/db";
import { tagsRepo, tasksRepo } from "./repository";
import type { CreateTaskRequest, ListFilter } from "./schema";

export const tasksService = {
  list: async (db: Db, filter: ListFilter = { status: "open" }) => {
    const rows = await tasksRepo.list(db, filter);
    return rows.map(({ tasksTags, ...task }) => ({
      ...task,
      tags: tasksTags.map((tt) => tt.tag.name),
    }));
  },

  create: async (db: Db, input: CreateTaskRequest) => {
    const created = await tasksRepo.create(db, { title: input.title, dueAt: input.dueAt });
    if (!created) return;
    const tagIds = await tagsRepo.upsertByNames(db, input.tagNames);
    await tasksRepo.attachTags(db, created.id, tagIds);
  },

  toggle: (db: Db, id: number, done: boolean) => tasksRepo.updateDone(db, id, done),

  delete: (db: Db, id: number) => tasksRepo.delete(db, id),
};
