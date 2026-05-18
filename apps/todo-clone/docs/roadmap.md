# todo-clone ロードマップ

> `requirements.md` の MVP を完成させるまでの段階表。
> 期間目安: 2-3 日 (ロードマップmemory 準拠)。

各 Phase は「完成条件」で区切る。条件未達なら次に進まない、超過したらスコープ削る。

---

## Phase 0: 要件詰め

- [x] スタック決定 (Hono + Inertia + hono/jsx + D1 + Drizzle)
- [x] requirements.md ドラフト
- [x] **判断: 認証方式** → **better-auth** (2026-05-18)
- [x] **判断: tags のデータ持ち方** → **中間表 (tasks_tags) で M:N 正規化** (2026-05-18)
- [x] **判断: 期限切れ判定** → **DB は UTC、表示時 localize** (2026-05-18)
- [x] **判断: 完了タスク扱い** → **一覧で混ぜる、デフォルトフィルタ未完了** (2026-05-18)
- [x] **判断: デプロイ環境** → **開発/本番 D1 分離、wrangler env で切替** (2026-05-18)

**完成条件**: ✅ requirements.md の「決めたこと」全埋まり

---

## Phase 1: DB スキーマ・Drizzle 接続

- [ ] `src/db/schema.ts` で tasks テーブル定義
- [ ] `drizzle.config.ts` 作成 (driver: d1)
- [ ] `wrangler.jsonc` に D1 binding 追加 (`DB`)
- [ ] `drizzle-kit generate` で初回 migration
- [ ] `wrangler d1 migrations apply <db> --local` でローカル D1 に適用
- [ ] Hono ハンドラから `drizzle(c.env.DB).select().from(tasks)` で空配列が返ることを確認

**完成条件**: ローカル D1 に tasks テーブルが存在し、Drizzle 経由で SELECT が動く

---

## Phase 2: タスク CRUD (認証なし)

- [ ] 一覧取得 → Inertia props で `/` に流す
- [ ] `Pages/Home.tsx` で一覧表示 + チェックボックス + 削除ボタン
- [ ] タスク追加フォーム (タイトルのみで POST `/tasks`)
- [ ] 完了トグル (PATCH `/tasks/:id`)
- [ ] 削除 (DELETE `/tasks/:id`)
- [ ] 期限・タグ入力欄追加

**完成条件**: 画面から追加・トグル・削除ができ、リロード後も状態が残る

---

## Phase 3: フィルタ

- [ ] URL クエリ `?status=open|done|all` で完了状態切替
- [ ] URL クエリ `?tag=xxx` でタグ絞り込み
- [ ] 期限切れフィルタ (`?overdue=1`)
- [ ] フィルタ UI を `Pages/Home.tsx` に追加
- [ ] Inertia の partial reload か通常 reload かは実装時判断

**完成条件**: URL でフィルタ状態が共有でき、戻る/進むで履歴が動く

---

## Phase 4: 認証 (better-auth)

- [ ] `better-auth` + Hono adapter + Drizzle/D1 adapter インストール
- [ ] schema は better-auth の CLI で生成 (users / sessions / accounts 等)
- [ ] tasks に `user_id` カラム追加 (migration)
- [ ] サインアップ / ログイン画面 (Inertia ページから better-auth の API 叩く)
- [ ] Hono middleware で session 検証 → `c.set('user', ...)`
- [ ] 未ログインなら `/login` リダイレクト
- [ ] 全 task クエリに `user_id` フィルタを追加

**完成条件**: 別ユーザーでログインしたら互いのタスクが見えない

---

## Phase 5: デプロイ

- [ ] `wrangler d1 create todo-clone-prod`
- [ ] `wrangler.jsonc` の D1 binding を本番 ID に切替 (or 環境別設定)
- [ ] 本番 D1 に migration 適用
- [ ] `pnpm deploy` 実行
- [ ] 本番 URL で動作確認 (サインアップ → タスク作成 → ログアウト → ログイン)

**完成条件**: 公開 URL で MVP が動く

---

## Phase 6: 仕上げ (任意・余力次第)

- [ ] 最低限のスタイリング (Tailwind か CSS Module か素 CSS)
- [ ] エラー / フラッシュメッセージ表示
- [ ] バリデーション (タイトル空チェック等)
- [ ] Zenn 記事下書き

**完成条件**: Zenn 記事として書ける段階の知見が貯まっている

---

## マイルストーン目安

| 経過       | 到達点                              |
| ---------- | ----------------------------------- |
| Day 1 終了 | Phase 0-2 (CRUD まで動く)           |
| Day 2 終了 | Phase 3-4 (フィルタ + 認証まで動く) |
| Day 3 終了 | Phase 5-6 (デプロイ + 仕上げ)       |

詰まったら **Phase 6 から削る**。MVP 完成条件は Phase 5 まで。

## 関連

- `requirements.md` (MVP 要件)
- `../../../docs/saas-clone-roadmap.md` (SaaS クローン全体ロードマップ)
