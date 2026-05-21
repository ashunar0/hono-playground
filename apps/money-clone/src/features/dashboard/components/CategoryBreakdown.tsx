import { formatYen } from "@/lib/format";
import { formatPeriod } from "@/lib/period";
import type { CategoryEntry } from "../service";

type Props = {
  byCategory: CategoryEntry[];
  expenseTotal: number;
  period: string;
};

export function CategoryBreakdown({ byCategory, expenseTotal, period }: Props) {
  return (
    <section>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold">カテゴリ別支出 ({formatPeriod(period)})</h2>
        <span class="text-sm text-gray-500">合計 {formatYen(expenseTotal)}</span>
      </div>
      {byCategory.length === 0 ? (
        <p class="text-gray-500">この月の支出はまだないのだ。</p>
      ) : (
        <div class="overflow-hidden rounded border border-gray-200 bg-white">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th class="px-3 py-2">カテゴリ</th>
                <th class="px-3 py-2 text-right">金額</th>
                <th class="px-3 py-2 text-right">割合</th>
              </tr>
            </thead>
            <tbody>
              {byCategory.map((c) => {
                const ratio = expenseTotal === 0 ? 0 : c.total / expenseTotal;
                return (
                  <tr class="border-t border-gray-100">
                    <td class="px-3 py-2">
                      <span class="inline-flex items-center gap-2">
                        <span
                          class="block h-3 w-3 rounded-full"
                          style={`background-color: ${c.color}`}
                          aria-hidden="true"
                        />
                        {c.name}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-right font-mono">{formatYen(c.total)}</td>
                    <td class="px-3 py-2 text-right text-gray-500">
                      {(ratio * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
