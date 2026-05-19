import { Hono } from "hono";
import type { AuthVariables } from "@/middleware/auth";

export const authApp = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>().all("/api/auth/*", (c) => c.get("auth").handler(c.req.raw));
