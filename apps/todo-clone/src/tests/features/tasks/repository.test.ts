import { tags, tasks as tasksTable, tasksTags } from "@/db/schema";
import { tagsRepo, tasksRepo } from "@/features/tasks/repository";
import type { Db } from "@/lib/db";
import { createTestDb, seedUser } from "@/tests/helpers/db";
import { beforeEach, describe, expect, test } from "vitest";

let db: Db;
let userId: string;

beforeEach(async () => {
  db = await createTestDb();
  userId = await seedUser(db);
});

describe("tasksRepo.create", () => {
  test("returns inserted row id and persists fields", async () => {
    const dueAt = new Date("2026-12-01T00:00:00.000Z");
    const created = await tasksRepo.create(db, userId, { title: "buy milk", dueAt });
    expect(created?.id).toBeTypeOf("number");

    const rows = await db.select().from(tasksTable);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: created!.id,
      userId,
      title: "buy milk",
      done: false,
      dueAt,
    });
  });
});

describe("tasksRepo.list", () => {
  test("returns only the requesting user's tasks", async () => {
    const otherUser = await seedUser(db, "user-2");
    await tasksRepo.create(db, userId, { title: "mine" });
    await tasksRepo.create(db, otherUser, { title: "theirs" });

    const rows = await tasksRepo.list(db, userId);
    expect(rows.map((r) => r.title)).toEqual(["mine"]);
  });

  test("filters by status", async () => {
    const a = await tasksRepo.create(db, userId, { title: "open one" });
    const b = await tasksRepo.create(db, userId, { title: "done one" });
    await tasksRepo.updateDone(db, userId, b!.id, true);

    expect((await tasksRepo.list(db, userId, { status: "open" })).map((r) => r.id)).toEqual([
      a!.id,
    ]);
    expect((await tasksRepo.list(db, userId, { status: "done" })).map((r) => r.id)).toEqual([
      b!.id,
    ]);

    const all = await tasksRepo.list(db, userId, { status: "all" });
    const byId = (x: number, y: number) => x - y;
    expect(all.map((r) => r.id).sort(byId)).toEqual([a!.id, b!.id].sort(byId));
  });

  test("filters by overdue against the given now", async () => {
    const past = new Date("2026-01-01T00:00:00.000Z");
    const future = new Date("2027-01-01T00:00:00.000Z");
    const overdue = await tasksRepo.create(db, userId, { title: "overdue", dueAt: past });
    await tasksRepo.create(db, userId, { title: "future", dueAt: future });

    const rows = await tasksRepo.list(db, userId, {
      overdue: true,
      now: new Date("2026-06-01T00:00:00.000Z"),
    });
    expect(rows.map((r) => r.id)).toEqual([overdue!.id]);
  });

  test("filters by tag", async () => {
    const t1 = await tasksRepo.create(db, userId, { title: "tagged" });
    const t2 = await tasksRepo.create(db, userId, { title: "untagged" });
    const [tagId] = await tagsRepo.upsertByNames(db, ["work"]);
    await tasksRepo.attachTags(db, t1!.id, [tagId]);

    const rows = await tasksRepo.list(db, userId, { tag: "work" });
    expect(rows.map((r) => r.id)).toEqual([t1!.id]);
    expect(rows.map((r) => r.id)).not.toContain(t2!.id);
  });

  test("includes attached tags via relation", async () => {
    const created = await tasksRepo.create(db, userId, { title: "with tags" });
    const tagIds = await tagsRepo.upsertByNames(db, ["a", "b"]);
    await tasksRepo.attachTags(db, created!.id, tagIds);

    const rows = await tasksRepo.list(db, userId);
    expect(rows).toHaveLength(1);
    expect(rows[0].tasksTags.map((tt) => tt.tag.name).sort()).toEqual(["a", "b"]);
  });
});

describe("tasksRepo.updateDone", () => {
  test("updates only when userId matches", async () => {
    const otherUser = await seedUser(db, "user-2");
    const created = await tasksRepo.create(db, userId, { title: "mine" });

    await tasksRepo.updateDone(db, otherUser, created!.id, true);
    expect((await tasksRepo.list(db, userId))[0]?.done).toBe(false);

    await tasksRepo.updateDone(db, userId, created!.id, true);
    expect((await tasksRepo.list(db, userId, { status: "done" }))[0]?.done).toBe(true);
  });
});

describe("tasksRepo.delete", () => {
  test("deletes only when userId matches", async () => {
    const otherUser = await seedUser(db, "user-2");
    const created = await tasksRepo.create(db, userId, { title: "mine" });

    await tasksRepo.delete(db, otherUser, created!.id);
    expect(await tasksRepo.list(db, userId, { status: "all" })).toHaveLength(1);

    await tasksRepo.delete(db, userId, created!.id);
    expect(await tasksRepo.list(db, userId, { status: "all" })).toHaveLength(0);
  });
});

describe("tasksRepo.attachTags", () => {
  test("no-op when given an empty list", async () => {
    const created = await tasksRepo.create(db, userId, { title: "no tags" });
    await tasksRepo.attachTags(db, created!.id, []);
    const rows = await db.select().from(tasksTags);
    expect(rows).toHaveLength(0);
  });
});

describe("tagsRepo.upsertByNames", () => {
  test("inserts new names and reuses existing ones", async () => {
    const first = await tagsRepo.upsertByNames(db, ["a", "b"]);
    expect(first).toHaveLength(2);

    const second = await tagsRepo.upsertByNames(db, ["b", "c"]);
    expect(second).toHaveLength(2);
    expect(second).toContain(first[1]); // 既存 "b" の id が再利用されている

    const all = await db.select().from(tags);
    expect(all.map((t) => t.name).sort()).toEqual(["a", "b", "c"]);
  });

  test("returns empty for empty input", async () => {
    expect(await tagsRepo.upsertByNames(db, [])).toEqual([]);
  });
});
