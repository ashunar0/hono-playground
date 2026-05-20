import type { Db } from "@/lib/db";
import { storiesRepo } from "./repository";
import type { CreateStoryRequest, ListQuery } from "./schema";

export const storiesService = {
  list: (db: Db, sort: ListQuery["sort"] = "new") => storiesRepo.list(db, sort),

  get: (db: Db, id: number) => storiesRepo.findById(db, id),

  create: async (db: Db, authorId: string, input: CreateStoryRequest) => {
    const created = await storiesRepo.create(db, authorId, {
      title: input.title,
      url: input.url,
      text: input.text,
    });
    return created;
  },
};
