import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { user } from "@/db/auth-schema";
import * as authSchema from "@/db/auth-schema";
import * as schema from "@/db/schema";
import type { Db } from "@/lib/db";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const fullSchema = { ...schema, ...authSchema };

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../../drizzle");

const loadMigrations = () =>
  readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(MIGRATIONS_DIR, f), "utf-8"));

export const createTestDb = async (): Promise<Db> => {
  const client = createClient({ url: ":memory:" });
  for (const sql of loadMigrations()) {
    for (const stmt of sql.split("--> statement-breakpoint")) {
      const trimmed = stmt.trim();
      if (trimmed) await client.execute(trimmed);
    }
  }
  return drizzle(client, { schema: fullSchema }) as unknown as Db;
};

export const seedUser = async (db: Db, id = "user-1") => {
  await db.insert(user).values({
    id,
    name: id,
    email: `${id}@example.com`,
  });
  return id;
};
