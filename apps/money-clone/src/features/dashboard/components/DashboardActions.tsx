import { formatPeriod } from "@/lib/period";
import { Link } from "@ts-76/inertia-hono-jsx";

type Props = { period: string };

// Inertia の <Link> を使うのは SPA 遷移のみ。CSV ダウンロードはサーバ直接 GET したいので素の <a>。
export function DashboardActions({ period }: Props) {
  return (
    <div class="mt-8 flex flex-wrap gap-3">
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
        取引一覧へ
      </Link>
      <a
        href={`/export?period=${period}`}
        class="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        download
      >
        CSV ダウンロード ({formatPeriod(period)})
      </a>
      <a
        href="/export"
        class="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        download
      >
        CSV ダウンロード (全期間)
      </a>
      <Link
        href="/import"
        class="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
      >
        CSV 取り込み
      </Link>
    </div>
  );
}
