import { transactionTypeLabels } from "@/features/transactions/schema";
import { formatYen } from "@/lib/format";
import type { ImportPreview, PreviewRow } from "../types";

type Props = { preview: ImportPreview };

export function PreviewSection({ preview }: Props) {
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
              <th class="w-12 px-3 py-2">行</th>
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
        <ConfirmForm okCount={preview.okCount} />
      ) : (
        <div class="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          warning が {preview.warnCount}{" "}
          件あるので取り込めないのだ。修正してから再アップロードしてね。
        </div>
      )}
    </section>
  );
}

function ConfirmForm({ okCount }: { okCount: number }) {
  return (
    <form
      method="post"
      action="/import/confirm"
      encType="multipart/form-data"
      class="rounded border border-emerald-200 bg-emerald-50 p-4"
    >
      <p class="mb-2 text-sm text-emerald-800">
        ✓ 全 {okCount} 件を取り込めるのだ。同じファイルを選んで確定してね。
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
  );
}

function PreviewRowView({ row }: { row: PreviewRow }) {
  const hasWarn = row.warnings.length > 0;
  return (
    <tr class={`border-t border-gray-100 align-top ${hasWarn ? "bg-red-50" : ""}`}>
      <td class="px-3 py-2 font-mono text-xs text-gray-500">{row.lineNo}</td>
      <td class="px-3 py-2 font-mono">{row.date ?? rawCell(row, 0)}</td>
      <td class="px-3 py-2">
        {row.type ? transactionTypeLabels[row.type] : <RawSpan value={rawCell(row, 1)} />}
      </td>
      <td class="px-3 py-2 text-right font-mono">
        {row.amount !== undefined ? formatYen(row.amount) : <RawSpan value={rawCell(row, 2)} />}
      </td>
      <td class="px-3 py-2">{row.accountName ?? <RawSpan value={rawCell(row, 3)} />}</td>
      <td class="px-3 py-2">{row.categoryName ?? <RawSpan value={rawCell(row, 4)} />}</td>
      <td class="px-3 py-2 text-gray-600">{row.memo ?? rawCell(row, 5)}</td>
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

function RawSpan({ value }: { value: string }) {
  return <span class="font-mono text-xs text-gray-400">{value || "—"}</span>;
}

const rawCell = (row: PreviewRow, idx: number): string => row.raw[idx] ?? "";
