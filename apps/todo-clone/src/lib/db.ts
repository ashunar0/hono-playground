import { drizzle } from "drizzle-orm/d1";
import * as authSchema from "../db/auth-schema";
import * as schema from "../db/schema";

const fullSchema = { ...schema, ...authSchema };

export const getDb = (env: CloudflareBindings) =>
  drizzle(env.DB, { schema: fullSchema });

export type Db = ReturnType<typeof getDb>;
