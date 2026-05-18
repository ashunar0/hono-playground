# SaaS クローン ロードマップ

> Hono + Inertia + hono/jsx で **Laravel/Rails Inertia 系で典型的に作られている SaaS プロダクト** をクローンしていくロードマップ。Edge 配信 + 軽量バンドルという新規性を実プロダクトで証明する。

## なぜクローン戦略か

- オリジナル UI を細かく設計すると進まなくなる → 既存サービスをコピーすれば **スコープが明確**
- 機能セットが既知 → **技術検証に集中** できる
- 「○○ clone」は記事のタイトルとして強い → **Zenn 記事化しやすい**

## なぜ Hono + Inertia + hono/jsx で SaaS か

Inertia 本家本元の組み合わせは **Laravel/Rails + Inertia + Vue/React**。SaaS 業界で広く採用される実績ある思想。
それを **Edge (Cloudflare Workers) で動かしたら何が変わるか** が未踏領域。

| 軸                        | 数値                         |
| ------------------------- | ---------------------------- |
| client.js gzip            | 47.6 KB (React版は 97.8 KB)  |
| worker gzip               | 31.4 KB (React版は 105.4 KB) |
| CF Workers Free tier 消費 | 約 3% (React版は 10%)        |

詳細: `memory/project_bundle_comparison.md`

## ゴール

**日程調整アプリ (Calendly clone)** を Hono + Inertia + hono/jsx + CF Workers フルスタックで完成させる。
そこに至る過程で得た知見を Zenn 記事化 + SaaS 就職時の即戦力アピール材料にする。

## ロードマップ (4 step)

### Step 1: TODO clone (Todoist lite)

**期間目安**: 2-3日
**目的**: Inertia 最小ループと Edge SaaS の基本ピースを体に入れる

| 領域   | 採用候補                                    |
| ------ | ------------------------------------------- |
| DB     | Cloudflare D1                               |
| ORM    | Drizzle                                     |
| 認証   | Lucia (CF Workers 対応版) or 自作 session   |
| メール | (このステップでは不要)                      |
| その他 | Inertia per-page props、pages.gen.ts 型貫通 |

**機能スコープ**: タスク追加 / 完了 / 削除 / 期限 / タグ / 一覧フィルタ
**完成条件**: 認証付きで自分のタスクを CRUD でき、`pnpm deploy` で CF Workers にデプロイできる

### Step 2: HackerNews clone

**期間目安**: 3-5日
**目的**: 1対多関連、ページネーション、階層構造の扱いを覚える

**追加で学ぶ要素**:

- post → comments の 1 対多
- 入れ子コメントの SQL (recursive CTE or 親 ID チェーン)
- voting で楽観的更新 (Inertia の partial reload との相性検証)
- 大量データのページネーション設計

### Step 3: 家計簿 (Money Forward lite)

**期間目安**: 1週間
**目的**: 集計・グラフ・多次元フィルタを覚える

**追加で学ぶ要素**:

- 月別 / カテゴリ別の集計クエリ
- chart library を hono/jsx で動かす (非 React ライブラリ選定問題に当たる)
- 期間切り替え UI と URL state 同期
- CSV インポート/エクスポート

### Step 4: Calendly clone (日程調整アプリ) ← 本命

**期間目安**: 3-4週間
**目的**: フルスタック総合演習。Edge × Inertia の事例第一号として確立

| 領域            | 採用候補                                          |
| --------------- | ------------------------------------------------- |
| OAuth           | Google Calendar API (CF Workers 上で OAuth2 flow) |
| メール          | Resend (Edge 親和性高い)                          |
| 課金 (将来)     | Stripe (Webhook 対応)                             |
| ファイル (将来) | Cloudflare R2                                     |
| 多テナント      | 個人 URL (`/yourname` 形式)                       |

**機能スコープ**:

- ユーザー登録 + Google Calendar 連携
- イベントタイプ作成 (15分/30分等)
- 招待リンク発行
- ゲストフロー (非認証ユーザーが予約)
- 確認メール / リマインダー送信
- タイムゾーン処理

## なぜこの順序か

| 軸                                | 効果                                |
| --------------------------------- | ----------------------------------- |
| 複雑さ 小→大                      | Step 1 で「動いた!」体験 → 萎えない |
| 学習要素が積み上がる              | 認証/CRUD → 関連 → 集計 → 外部連携  |
| 各ステップが記事ネタ              | Zenn 4本書ける、連載化可能          |
| Step 3 終了時点で就活アピール可能 | 3つ完成は具体的成果                 |

## ショートカット案

時間ないなら **Step 1 → Step 4** にスキップも OK。
ただし Step 4 で詰まった時 Step 2/3 で得る経験が効くタイプの詰まり方をするので、急がば回れも一理ある。

## 採用予定の技術スタック (Edge-first SaaS のレシピ)

```
Frontend:      Hono + Inertia + hono/jsx (SSR + hydration)
Backend:       Hono on Cloudflare Workers
DB:            Cloudflare D1 (or Turso, Neon)
ORM:           Drizzle (Edge 対応の代表格)
Auth:          Lucia (CF Workers 対応版) or 自作 session
Email:         Resend
Calendar API:  Google Calendar (OAuth2)
Payment:       Stripe
File storage:  R2
Queue/Cron:    CF Workers Queues / Cron Triggers
```

全部 Cloudflare に乗せる構成。ベンダーロックインの代わりに **開発体験 + コストの極小化** が得られる。

## 記事ネタとしての価値

各 Step で得た知見をそのまま Zenn 記事化:

- 「Cloudflare Workers + Hono Inertia で TODO アプリを作る」 (Step 1)
- 「Edge × Inertia で 1 対多関係をどう設計するか — HN clone を題材に」 (Step 2)
- 「hono/jsx で chart library を動かす — 家計簿クローンの可視化」 (Step 3)
- 「Calendly クローンを Cloudflare Workers + Hono Inertia で作った話」 (Step 4)

Laravel Inertia 経験者から見ても「思想は同じだけど Edge に持っていったらどうなる？」という未踏領域への興味で読まれる。

## 関連メモ

- `memory/user_hono_inertia_focus.md` — あさひさんが「Hono Inertia 第一人者」を目指す方針
- `memory/project_bundle_comparison.md` — Bundle size 比較の数値
- `memory/project_hono_research.md` — Hono 研究全体方針
- `memory/project_create_hono_inertia.md` — Scaffold CLI (v0.0.1 公開済み)

## 次のアクション

明日から **Step 1 (TODO clone)** に着手:

1. `apps/todo-clone` (or 適当な名前) を `npm create hono-inertia@latest` で scaffold
2. D1 + Drizzle セットアップ
3. 認証 (Lucia or 自作 session)
4. タスク CRUD + フィルタ
5. CF Workers にデプロイして動作確認
