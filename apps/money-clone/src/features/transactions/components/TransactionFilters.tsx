import type { Account } from "@/features/accounts/types";
import type { Category } from "@/features/categories/types";
import { href } from "@/lib/href";
import { inputClass } from "@/lib/inputClass";
import { Link } from "@ts-76/inertia-hono-jsx";
import { TRANSACTION_TYPES, transactionTypeLabels, type TransactionFilter } from "../schema";

type Props = {
  accounts: Account[];
  categories: Category[];
  filter: TransactionFilter;
};

export function TransactionFilters({ accounts, categories, filter }: Props) {
  return (
    <form
      method="get"
      action="/transactions"
      class="mb-6 rounded border border-gray-200 bg-white p-4"
    >
      {/* MonthPager で選択中の period をフィルタ submit でも維持する */}
      <input type="hidden" name="period" value={filter.period ?? ""} />
      <div class="flex flex-wrap items-end gap-3">
        <label class="flex flex-col gap-1">
          <span class="text-xs text-gray-600">口座</span>
          <select name="accountId" class={`${inputClass(false)} text-sm`}>
            <option value="" selected={!filter.accountId}>
              すべて
            </option>
            {accounts.map((a) => (
              <option value={a.id} selected={a.id === filter.accountId}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-xs text-gray-600">カテゴリ</span>
          <select name="categoryId" class={`${inputClass(false)} text-sm`}>
            <option value="" selected={!filter.categoryId}>
              すべて
            </option>
            {categories.map((c) => (
              <option value={c.id} selected={c.id === filter.categoryId}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-xs text-gray-600">種別</span>
          <select name="type" class={`${inputClass(false)} text-sm`}>
            <option value="" selected={!filter.type}>
              すべて
            </option>
            {TRANSACTION_TYPES.map((t) => (
              <option value={t} selected={t === filter.type}>
                {transactionTypeLabels[t]}
              </option>
            ))}
          </select>
        </label>
        <div class="flex gap-2">
          <button
            type="submit"
            class="rounded bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            絞り込む
          </button>
          <Link
            href={href("/transactions")}
            class="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            クリア
          </Link>
        </div>
      </div>
    </form>
  );
}
