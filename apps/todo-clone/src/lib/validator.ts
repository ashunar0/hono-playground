import { zValidator } from "@hono/zod-validator";
import type { ZodType } from "zod";

export const vJson = <T extends ZodType>(schema: T) => zValidator("json", schema);
export const vParam = <T extends ZodType>(schema: T) => zValidator("param", schema);
export const vQuery = <T extends ZodType>(schema: T) => zValidator("query", schema);
