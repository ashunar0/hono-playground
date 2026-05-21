import { accountTypeLabels } from "@/features/accounts/schema";
import { formatYen } from "@/lib/format";
import type { AccountBalance } from "../service";

type Props = {
  balances: AccountBalance[];
};

export function BalancesGrid({ balances }: Props) {
  if (balances.length === 0) {
    return <p class="text-gray-500">口座がまだないのだ。</p>;
  }

  return (
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      {balances.map((b) => (
        <div class="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-3">
          <div class="flex flex-col">
            <span class="font-medium">{b.name}</span>
            <span class="text-xs text-gray-500">{accountTypeLabels[b.type]}</span>
          </div>
          <span class={`font-mono text-lg ${b.current >= 0 ? "text-emerald-700" : "text-red-600"}`}>
            {formatYen(b.current)}
          </span>
        </div>
      ))}
    </div>
  );
}
