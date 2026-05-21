import { Layout } from "@/components/Layout";
import type { ImportPreview, PreviewRow } from "@/features/import/types";
import { transactionTypeLabels } from "@/features/transactions/schema";
import { formatYen } from "@/lib/format";
import { Link } from "@ts-76/inertia-hono-jsx";

type Props = {
  preview: ImportPreview | null;
  message: string | null;
};

export default function Import({ preview, message }: Props) {
  return (
    <Layout>
      <div class="mx-auto max-w-5xl p-8">
        <div class="mb-6 flex items-center justify-between">
          <h1 class="text-2xl font-bold">CSV 取り込み</h1>
          <Link href="/" class="text-sm text-blue-600 hover:underline">
            ← ダッシュボードに戻る
          </Link>
        </div>

        {message && (
          <div class="mb-4 rounded border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
            {message}
          </div>
        )}

        <FormatHelp />

        <UploadForm action="/import" label="プレビュー" preview={preview} />

        {preview && <PreviewSection preview={preview} />}
      </div>
    </Layout>
  );
}

function FormatHelp() {
  return (
    <section class="mb-6 rounded border border-gray-200 bg-white p-4 text-sm text-gray-700">
      <h2 class="mb-2 font-semibold">フォーマット</h2>
      <p class="mb-2">UTF-8、ヘッダー必須。カラム順は以下:</p>
      <code class="block whitespace-pre-wrap rounded bg-gray-50 px-3 py-2 font-mono text-xs">
        日付,種別,金額,口座,カテゴリ,メモ{"\n"}
        2026-05-01,支出,980,現金,食費,コーヒー
      </code>
      <ul class="mt-3 list-disc pl-5 text-xs text-gray-600">
        <li>口座 / カテゴリは「事前に登録した名前」を使うのだ (未登録だと弾く)</li>
        <li>種別とカテゴリの収支区分 (kind) が一致してないと弾く</li>
        <li>1 件でも warning があると確定できない</li>
      </ul>
    </section>
  );
}

function UploadForm({
  action,
  label,
  preview,
}: {
  action: string;
  label: string;
  preview: ImportPreview | null;
}) {
  return (
    <form
      method="post"
      action={action}
      encType="multipart/form-data"
      class="mb-6 rounded border border-gray-200 bg-white p-4"
    >
      <label class="flex flex-col gap-2 text-sm">
        <span class="font-medium">CSV ファイル</span>
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          class="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-emerald-700"
        />
      </label>
      <div class="mt-3 flex items-center gap-3">
        <button
          type="submit"
          class="rounded bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
        >
          {label}
        </button>
        {preview && (
          <span class="text-xs text-gray-500">
            ※ Inertia 経由でファイルを保持しないため、確定時は同じファイルをもう一度選んでね
          </span>
        )}
      </div>
    </form>
  );
}

function PreviewSection({ preview }: { preview: ImportPreview }) {
  return (
    <section class="mb-8">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold">プレビュー</h2>
        <span class="text-sm text-gray-600">
          OK: <span class="font-semibold text-emerald-700">{preview.okCount}</span>
          {" / "}
          warning: <span class="font-semibold text-red-600">{preview.warnCount}</span>
        </span>
      </div>

      <div class="mb-4 overflow-x-auto rounded border border-gray-200 bg-white">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th class="px-3 py-2 w-12">行</th>
              <th class="px-3 py-2">日付</th>
              <th class="px-3 py-2">種別</th>
              <th class="px-3 py-2 text-right">金額</th>
              <th class="px-3 py-2">口座</th>
              <th class="px-3 py-2">カテゴリ</th>
              <th class="px-3 py-2">メモ</th>
              <th class="px-3 py-2">warning</th>
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((r) => (
              <PreviewRowView row={r} />
            ))}
          </tbody>
        </table>
      </div>

      {preview.canImport ? (
        <form
          method="post"
          action="/import/confirm"
          encType="multipart/form-data"
          class="rounded border border-emerald-200 bg-emerald-50 p-4"
        >
          <p class="mb-2 text-sm text-emerald-800">
            ✓ 全 {preview.okCount} 件を取り込めるのだ。同じファイルを選んで確定してね。
          </p>
          <div class="flex items-center gap-3">
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
              class="block w-full max-w-md text-sm file:mr-3 file:rounded file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-emerald-700"
            />
            <button
              type="submit"
              class="shrink-0 rounded bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
            >
              確定して取り込む
            </button>
          </div>
        </form>
      ) : (
        <div class="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          warning が {preview.warnCount}{" "}
          件あるので取り込めないのだ。修正してから再アップロードしてね。
        </div>
      )}
    </section>
  );
}

function PreviewRowView({ row }: { row: PreviewRow }) {
  const hasWarn = row.warnings.length > 0;
  return (
    <tr class={`border-t border-gray-100 align-top ${hasWarn ? "bg-red-50" : ""}`}>
      <td class="px-3 py-2 font-mono text-xs text-gray-500">{row.lineNo}</td>
      <td class="px-3 py-2 font-mono">{row.date ?? raw(row, 0)}</td>
      <td class="px-3 py-2">
        {row.type ? transactionTypeLabels[row.type] : <Raw value={raw(row, 1)} />}
      </td>
      <td class="px-3 py-2 text-right font-mono">
        {row.amount !== undefined ? formatYen(row.amount) : <Raw value={raw(row, 2)} />}
      </td>
      <td class="px-3 py-2">{row.accountName ?? <Raw value={raw(row, 3)} />}</td>
      <td class="px-3 py-2">{row.categoryName ?? <Raw value={raw(row, 4)} />}</td>
      <td class="px-3 py-2 text-gray-600">{row.memo ?? raw(row, 5)}</td>
      <td class="px-3 py-2">
        {hasWarn ? (
          <ul class="list-disc pl-4 text-xs text-red-700">
            {row.warnings.map((w) => (
              <li>{w}</li>
            ))}
          </ul>
        ) : (
          <span class="text-emerald-700">OK</span>
        )}
      </td>
    </tr>
  );
}

function Raw({ value }: { value: string }) {
  return <span class="font-mono text-xs text-gray-400">{value || "—"}</span>;
}

const raw = (row: PreviewRow, idx: number): string => row.raw[idx] ?? "";
