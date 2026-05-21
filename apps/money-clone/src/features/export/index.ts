import { getDb } from "@/lib/db";
import { vQuery } from "@/lib/validator";
import { type AppEnv } from "@/middleware/auth";
import { requireAuth } from "@/middleware/require-auth";
import { Hono } from "hono";
import { z } from "zod";
import { exportService } from "./service";

const exportFilterSchema = z.object({
  period: z
    .union([z.string().regex(/^\d{4}-\d{2}$/), z.literal("").transform(() => undefined)])
    .optional(),
});

export const exportApp = new Hono<AppEnv>()
  .use(requireAuth)
  .get("/export", vQuery(exportFilterSchema), async (c) => {
    const user = c.get("user")!;
    const { period } = c.req.valid("query");
    const csv = await exportService.buildTransactionsCsv(getDb(c.env), user.id, period);
    const suffix = period ?? "all";
    const filename = `money-clone-${suffix}.csv`;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  });
