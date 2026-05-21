import { Layout } from "@/components/Layout";
import type { PageProps } from "@hono/inertia";
import { Link } from "@ts-76/inertia-hono-jsx";

// 未ログイン向けランディング。ログイン中ユーザーはサーバ側で Dashboard に振り分ける。
export default function Home({ message }: PageProps<"Home">) {
  return (
    <Layout>
      <div class="mx-auto max-w-3xl px-6 py-16">
        <h1 class="text-3xl font-bold tracking-tight">家計簿</h1>
        <p class="mt-4 text-slate-600">{message}</p>

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
      </div>
    </Layout>
  );
}
