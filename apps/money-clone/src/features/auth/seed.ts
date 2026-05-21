import type { Db } from "@/lib/db";
import { newId } from "@/lib/id";
import { accounts, categories } from "@/db/schema";

// signup 直後にユーザーの財布をすぐ使える状態にするための初期データ。
// カテゴリの色は支出/収入を視覚で見分けられる固定パレット (Tailwind 由来)。
const DEFAULT_CATEGORIES: ReadonlyArray<{
  name: string;
  kind: "expense" | "income";
  color: string;
}> = [
  // 支出
  { name: "食費", kind: "expense", color: "#f97316" }, // orange
  { name: "交通", kind: "expense", color: "#3b82f6" }, // blue
  { name: "光熱費", kind: "expense", color: "#eab308" }, // yellow
  { name: "通信", kind: "expense", color: "#06b6d4" }, // cyan
  { name: "家賃", kind: "expense", color: "#8b5cf6" }, // purple
  { name: "医療", kind: "expense", color: "#ef4444" }, // red
  { name: "娯楽", kind: "expense", color: "#ec4899" }, // pink
  { name: "雑費", kind: "expense", color: "#6b7280" }, // gray
  // 収入
  { name: "給与", kind: "income", color: "#22c55e" }, // green
  { name: "副収入", kind: "income", color: "#14b8a6" }, // teal
  { name: "その他収入", kind: "income", color: "#84cc16" }, // lime
];

export async function seedDefaultsForUser(db: Db, userId: string): Promise<void> {
  const now = new Date();
  await db.insert(accounts).values({
    id: newId(),
    userId,
    name: "現金",
    type: "cash",
    initialBalance: 0,
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((c) => ({
      id: newId(),
      userId,
      name: c.name,
      kind: c.kind,
      color: c.color,
      createdAt: now,
      updatedAt: now,
    })),
  );
}
