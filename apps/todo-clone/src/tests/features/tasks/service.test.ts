import { tags } from "@/db/schema";
import { tasksService } from "@/features/tasks/service";
import type { Db } from "@/lib/db";
import { createTestDb, seedUser } from "@/tests/helpers/db";
import { beforeEach, describe, expect, test } from "vitest";

let db: Db;
let userId: string;

beforeEach(async () => {
  db = await createTestDb();
  userId = await seedUser(db);
});

describe("tasksService.create", () => {
  test("creates task and upserts tags in one go", async () => {
    await tasksService.create(db, userId, {
      title: "study Hono",
      tagNames: ["learn", "side"],
    });

    const rows = await tasksService.list(db, userId);
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("study Hono");
    expect(rows[0].tags.sort()).toEqual(["learn", "side"]);

    const tagRows = await db.select().from(tags);
    expect(tagRows.map((t) => t.name).sort()).toEqual(["learn", "side"]);
  });

  test("reuses existing tag rows on second create", async () => {
    await tasksService.create(db, userId, { title: "first", tagNames: ["shared"] });
    await tasksService.create(db, userId, { title: "second", tagNames: ["shared"] });

    const tagRows = await db.select().from(tags);
    expect(tagRows).toHaveLength(1);
    expect(tagRows[0].name).toBe("shared");
  });

  test("works with no tags", async () => {
    await tasksService.create(db, userId, { title: "no tag", tagNames: [] });
    const rows = await tasksService.list(db, userId);
    expect(rows[0].tags).toEqual([]);
  });
});

describe("tasksService.list", () => {
  test("flattens tasksTags relation into tag name array", async () => {
    await tasksService.create(db, userId, { title: "a", tagNames: ["x", "y"] });

    const rows = await tasksService.list(db, userId);
    expect(rows[0]).not.toHaveProperty("tasksTags");
    expect(rows[0].tags.sort()).toEqual(["x", "y"]);
  });

  test("defaults to open-only", async () => {
    await tasksService.create(db, userId, { title: "open", tagNames: [] });
    await tasksService.create(db, userId, { title: "to be done", tagNames: [] });
    const [, second] = await tasksService.list(db, userId, { status: "all" });
    await tasksService.toggle(db, userId, second.id, true);

    const rows = await tasksService.list(db, userId);
    expect(rows.map((r) => r.title)).toEqual(["open"]);
  });
});

describe("tasksService.toggle / delete", () => {
  test("toggle flips done flag for the owner", async () => {
    await tasksService.create(db, userId, { title: "t", tagNames: [] });
    const [row] = await tasksService.list(db, userId);
    await tasksService.toggle(db, userId, row.id, true);
    const done = await tasksService.list(db, userId, { status: "done" });
    expect(done.map((r) => r.id)).toEqual([row.id]);
  });

  test("delete removes only the owner's task", async () => {
    const otherUser = await seedUser(db, "user-2");
    await tasksService.create(db, userId, { title: "mine", tagNames: [] });
    const [row] = await tasksService.list(db, userId);

    await tasksService.delete(db, otherUser, row.id);
    expect(await tasksService.list(db, userId, { status: "all" })).toHaveLength(1);

    await tasksService.delete(db, userId, row.id);
    expect(await tasksService.list(db, userId, { status: "all" })).toHaveLength(0);
  });
});
