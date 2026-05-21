import { formatYen, signedYen } from "@/lib/format";
import type { MonthlyEntry } from "../service";

type Props = {
  monthly: MonthlyEntry[];
  // 現在 highlight する月 ('YYYY-MM')。
  currentPeriod: string;
};

export function MonthlyTable({ monthly, currentPeriod }: Props) {
  return (
    <section>
      <h2 class="mb-3 text-lg font-semibold">月別収支 (直近 12 ヶ月)</h2>
      <div class="overflow-x-auto rounded border border-gray-200 bg-white">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th class="px-3 py-2">月</th>
              <th class="px-3 py-2 text-right">収入</th>
              <th class="px-3 py-2 text-right">支出</th>
              <th class="px-3 py-2 text-right">差引</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map((m) => {
              const diff = m.income - m.expense;
              const isCurrent = m.period === currentPeriod;
              return (
                <tr class={`border-t border-gray-100 ${isCurrent ? "bg-emerald-50" : ""}`}>
                  <td class="px-3 py-2 font-mono">{m.period}</td>
                  <td class="px-3 py-2 text-right font-mono text-green-700">
                    {m.income === 0 ? "—" : formatYen(m.income)}
                  </td>
                  <td class="px-3 py-2 text-right font-mono text-red-600">
                    {m.expense === 0 ? "—" : formatYen(m.expense)}
                  </td>
                  <td
                    class={`px-3 py-2 text-right font-mono ${diff >= 0 ? "text-emerald-700" : "text-red-600"}`}
                  >
                    {diff === 0 ? "—" : signedYen(diff)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
