import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

// better-auth の `account` テーブルと衝突するので複数形にしている (UI 上は「口座」)。
export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").$type<"cash" | "bank" | "card" | "other">().notNull(),
    initialBalance: integer("initial_balance").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (t) => ({
    userIdIdx: index("accounts_user_id_idx").on(t.userId),
  }),
);

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: text("kind").$type<"expense" | "income">().notNull(),
    // グラフ用の固定パレット色 (#rrggbb)
    color: text("color").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (t) => ({
    userIdIdx: index("categories_user_id_idx").on(t.userId),
  }),
);

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // 口座 / カテゴリは取引があると削除不可 (restrict)。要件「削除は紐づく取引があれば弾く」を DB レベルで保証。
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    // 'YYYY-MM-DD' で持つ。月別集計が strftime 不要で `LIKE 'YYYY-MM-%'` で書ける。
    date: text("date").notNull(),
    // 円単位の正の整数。type で符号を表現する。
    amount: integer("amount").notNull(),
    // category.kind と二重持ち。JOIN なしで月別集計・一覧フィルタが書ける。
    type: text("type").$type<"expense" | "income">().notNull(),
    memo: text("memo"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (t) => ({
    userIdIdx: index("transactions_user_id_idx").on(t.userId),
    accountIdIdx: index("transactions_account_id_idx").on(t.accountId),
    categoryIdIdx: index("transactions_category_id_idx").on(t.categoryId),
    dateIdx: index("transactions_date_idx").on(t.date),
  }),
);

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
}));
