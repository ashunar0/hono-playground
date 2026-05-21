import { Layout } from "@/components/Layout";
import type { PageProps } from "@hono/inertia";
import { Link, usePage } from "@ts-76/inertia-hono-jsx";

export default function Home({ message }: PageProps<"Home">) {
  const user = usePage().props.user;

  return (
    <Layout>
      <div class="mx-auto max-w-3xl px-6 py-16">
        <h1 class="text-3xl font-bold tracking-tight">家計簿</h1>
        <p class="mt-4 text-slate-600">{message}</p>

        {user ? (
          <div class="mt-8 flex flex-col gap-3">
            <p class="text-slate-700">ようこそ、{user.name} さん。</p>
            <div class="flex flex-wrap gap-3">
              <Link
                href="/transactions/new"
                class="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
              >
                + 取引を追加
              </Link>
              <Link
                href="/transactions"
                class="rounded border border-emerald-600 px-4 py-2 text-emerald-600 hover:bg-emerald-50"
              >
                取引一覧
              </Link>
              <Link
                href="/accounts"
                class="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                口座
              </Link>
              <Link
                href="/categories"
                class="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                カテゴリ
              </Link>
            </div>
          </div>
        ) : (
          <div class="mt-8 flex gap-3">
            <Link
              href="/signup"
              class="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
            >
              新規登録
            </Link>
            <Link
              href="/login"
              class="rounded border border-emerald-600 px-4 py-2 text-emerald-600 hover:bg-emerald-50"
            >
              ログイン
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
