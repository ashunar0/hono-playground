import { accountTypeLabels } from "@/features/accounts/schema";
import { formatYen } from "@/lib/format";
import type { AccountBalance } from "../service";

type Props = {
  balances: AccountBalance[];
  totalBalance: number;
};

export function BalancesGrid({ balances, totalBalance }: Props) {
  return (
    <section>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold">口座残高</h2>
        <span class="text-sm text-gray-500">合計 {formatYen(totalBalance)}</span>
      </div>
      {balances.length === 0 ? (
        <p class="text-gray-500">口座がまだないのだ。</p>
      ) : (
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          {balances.map((b) => (
            <div class="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-3">
              <div class="flex flex-col">
                <span class="font-medium">{b.name}</span>
                <span class="text-xs text-gray-500">{accountTypeLabels[b.type]}</span>
              </div>
              <span
                class={`font-mono text-lg ${b.current >= 0 ? "text-emerald-700" : "text-red-600"}`}
              >
                {formatYen(b.current)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
