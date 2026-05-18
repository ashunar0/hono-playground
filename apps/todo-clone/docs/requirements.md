# todo-clone 要件メモ

> SaaS クローンロードマップ Step 1 (`../../../docs/saas-clone-roadmap.md`)。
> Hono + Inertia + hono/jsx + D1 + Drizzle で **Todoist の最小サブセット** を作る。
> イメージ: Google Tasks + タグ機能。シングルユーザーの 1 リスト ToDo + フィルタ。

## ゴール

- 認証付きで自分のタスクを CRUD できる
- `pnpm deploy` で Cloudflare Workers にデプロイできる

## MVP 機能スコープ

- [ ] タスク追加 (タイトル必須、期限・タグは任意)
- [ ] タスク完了 / 未完了トグル
- [ ] タスク削除
- [ ] タスク一覧表示
- [ ] フィルタ (完了状態 / タグ / 期限切れ)
- [ ] 認証 (自分のタスクのみ閲覧・編集)

## 技術スタック

| 層 | 選定 |
|---|---|
| ランタイム | Cloudflare Workers |
| サーバ | Hono |
| ビュー | Inertia + hono/jsx (SSR + hydration) |
| DB | Cloudflare D1 (ローカル開発時は `--local` の SQLite) |
| ORM | Drizzle |
| 認証 | **better-auth** (OSS, self-host, Hono adapter, D1 adapter で繋ぐ) |

## データモデル (案)

### `tasks`

| カラム | 型 | 制約 |
|---|---|---|
| id | integer | PK, autoIncrement |
| user_id | integer | FK → users.id, notNull (認証導入後) |
| title | text | notNull |
| done | integer (boolean) | notNull, default false |
| due_at | integer (timestamp) | nullable |
| created_at | integer (timestamp) | notNull |

### `tags`

| カラム | 型 | 制約 |
|---|---|---|
| id | integer | PK, autoIncrement |
| user_id | integer | FK → users.id, notNull (認証導入後) |
| name | text | notNull |
| created_at | integer (timestamp) | notNull |

unique 制約: `(user_id, name)` で同じユーザーの重複タグを防ぐ。

### `tasks_tags` (中間表)

| カラム | 型 | 制約 |
|---|---|---|
| task_id | integer | FK → tasks.id, notNull |
| tag_id | integer | FK → tags.id, notNull |

PK: composite `(task_id, tag_id)`。M:N を正規化で持つ (タグ rename・タグ別件数集計・JOIN で綺麗に検索)。

### `users`

better-auth の CLI でスキーマ生成予定 (Phase 4)。users / sessions / accounts 等が一気に入る想定。

## 画面構成 (暫定)

- `/` タスク一覧 + フィルタ UI + 追加フォーム
- `/login` ログイン
- `/signup` サインアップ

## スコープ外 (MVP では作らない)

- タスクの drag & drop 並び替え
- 繰り返しタスク
- リマインダー通知
- 添付ファイル
- チーム共有 / 公開リンク

## 決めたこと (Phase 0 で確定, 2026-05-18)

1. **認証方式**: **better-auth** (理由は [memory: project_todo_clone] / Hono OSS派と整合、Lucia 死亡後の有力候補)
2. **tags のデータ持ち方**: **中間表 (`tasks_tags`) で M:N 正規化** (M:N 基礎は Step 2 以降でも応用、 後から migration 手間考えると最初から正規化が筋)
3. **完了タスクの扱い**: 一覧で混ぜて表示、デフォルトフィルタ "未完了"
4. **期限切れ判定 TZ**: DB は UTC、表示時にクライアント TZ で localize (`Intl.DateTimeFormat`)
5. **デプロイ環境**: 開発 D1 と本番 D1 を分ける (wrangler env で切替、3 環境: ローカル `--local` SQLite / リモート開発 D1 / 本番 D1)

## 学習ターゲット (このステップで体に入れたい)

- Hono + Inertia の per-page props と `pages.gen.ts` 型貫通
- Drizzle on D1 の最小ループ (schema → migration → query)
- CF Workers 上での認証 session 設計
- `pnpm deploy` まで通すフルスタック体験

## 関連メモ

- `docs/saas-clone-roadmap.md` (全体ロードマップ)
- memory: `project_create_hono_inertia`, `project_saas_clone_roadmap`, `project_dom_lib_trap`
