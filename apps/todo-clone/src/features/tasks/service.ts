import type { DrizzleD1Database } from "drizzle-orm/d1";
import { tasksRepo } from "./repository";
import type { CreateTaskRequest } from "./schema";

export const tasksService = {
  list: (db: DrizzleD1Database) => tasksRepo.list(db),

  create: (db: DrizzleD1Database, input: CreateTaskRequest) => tasksRepo.create(db, input),

  toggle: (db: DrizzleD1Database, id: number, done: boolean) =>
    tasksRepo.updateDone(db, id, done),

  delete: (db: DrizzleD1Database, id: number) => tasksRepo.delete(db, id),
};
