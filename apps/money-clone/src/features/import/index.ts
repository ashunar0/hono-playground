import { getDb } from "@/lib/db";
import { type AppEnv } from "@/middleware/auth";
import { requireAuth } from "@/middleware/require-auth";
import { Hono } from "hono";
import { importService } from "./service";

const MAX_BYTES = 1_000_000;

// multipart/form-data から CSV File を取り出してテキスト化。
// File でない / サイズ超過 / 文字化けっぽいケースは null を返す。
const readCsvFile = async (c: { req: { parseBody: () => Promise<Record<string, unknown>> } }) => {
  const body = await c.req.parseBody();
  const file = body.file;
  if (!(file instanceof File)) return null;
  if (file.size === 0) return null;
  if (file.size > MAX_BYTES) return { tooLarge: true as const };
  const text = await file.text();
  return { text };
};

export const importApp = new Hono<AppEnv>()
  .use(requireAuth)
  .get("/import", (c) => c.render("Import", { preview: null, message: null }))
  .post("/import", async (c) => {
    const user = c.get("user")!;
    const file = await readCsvFile(c);
    if (!file) {
      return c.render("Import", { preview: null, message: "CSV ファイルを選んでください" });
    }
    if ("tooLarge" in file) {
      return c.render("Import", {
        preview: null,
        message: "ファイルサイズが大きすぎる (1MB 上限)",
      });
    }
    const preview = await importService.preview(getDb(c.env), user.id, file.text);
    return c.render("Import", { preview, message: null });
  })
  .post("/import/confirm", async (c) => {
    const user = c.get("user")!;
    const file = await readCsvFile(c);
    if (!file) {
      return c.render("Import", { preview: null, message: "ファイルを再選択してください" });
    }
    if ("tooLarge" in file) {
      return c.render("Import", {
        preview: null,
        message: "ファイルサイズが大きすぎる (1MB 上限)",
      });
    }
    const result = await importService.confirm(getDb(c.env), user.id, file.text);
    if (!result.ok) {
      // 再選択時に内容が変わって warning が発生したケース。preview を返す。
      return c.render("Import", {
        preview: result.preview,
        message: "確定時に warning が出たのだ。内容を確認してね",
      });
    }
    c.flash("toast", { type: "success", message: `${result.inserted} 件取り込んだのだ` });
    return c.redirect("/transactions", 303);
  });
