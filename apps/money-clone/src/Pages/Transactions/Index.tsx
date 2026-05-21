import { Layout } from "@/components/Layout";
import { MonthPager } from "@/components/MonthPager";
import type { Account } from "@/features/accounts/types";
import type { Category } from "@/features/categories/types";
import {
  type TransactionFilter,
  TRANSACTION_TYPES,
  transactionTypeLabels,
} from "@/features/transactions/schema";
import type { TransactionListItem } from "@/features/transactions/types";
import { href } from "@/lib/href";
import { inputClass } from "@/lib/inputClass";
import { Form, Link } from "@ts-76/inertia-hono-jsx";

type Props = {
  transactions: TransactionListItem[];
  accounts: Account[];
  categories: Category[];
  filter: TransactionFilter;
};

const formatYen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

// MonthPager は accounts / categories を再フェッチしない (静的)。
// partial reload で transactions と filter だけ差し替えれば十分。
const PARTIAL_RELOAD_KEYS = ["transactions", "filter"] as const;

export default function TransactionsIndex({ transactions, accounts, categories, filter }: Props) {
  const baseParams = {
    accountId: filter.accountId,
    categoryId: filter.categoryId,
    type: filter.type,
  };

  return (
    <Layout>
      <div class="mx-auto max-w-4xl p-8">
        <div class="mb-6 flex items-center justify-between">
          <h1 class="text-2xl font-bold">取引</h1>
          <Link
            href="/transactions/new"
            class="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + 新規追加
          </Link>
        </div>

        <div class="mb-4">
          <MonthPager
            period={filter.period}
            baseParams={baseParams}
            only={PARTIAL_RELOAD_KEYS}
          />
        </div>

        <form method="get" action="/transactions" class="mb-6 rounded border border-gray-200 bg-white p-4">
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

        {transactions.length === 0 ? (
          <p class="text-gray-500">取引がまだないのだ。「+ 新規追加」から登録するのだ。</p>
        ) : (
          <div class="overflow-x-auto rounded border border-gray-200 bg-white">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th class="px-3 py-2">日付</th>
                  <th class="px-3 py-2">種別</th>
                  <th class="px-3 py-2 text-right">金額</th>
                  <th class="px-3 py-2">口座</th>
                  <th class="px-3 py-2">カテゴリ</th>
                  <th class="px-3 py-2">メモ</th>
                  <th class="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr class="border-t border-gray-100">
                    <td class="px-3 py-2 whitespace-nowrap">{t.date}</td>
                    <td class="px-3 py-2 whitespace-nowrap">
                      <span
                        class={
                          t.type === "expense"
                            ? "rounded bg-red-50 px-2 py-0.5 text-xs text-red-600"
                            : "rounded bg-green-50 px-2 py-0.5 text-xs text-green-700"
                        }
                      >
                        {transactionTypeLabels[t.type]}
                      </span>
                    </td>
                    <td
                      class={`px-3 py-2 text-right font-mono whitespace-nowrap ${
                        t.type === "expense" ? "text-red-600" : "text-green-700"
                      }`}
                    >
                      {t.type === "expense" ? "-" : "+"}
                      {formatYen(t.amount)}
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap">{t.accountName}</td>
                    <td class="px-3 py-2 whitespace-nowrap">
                      <span class="inline-flex items-center gap-2">
                        <span
                          class="block h-3 w-3 rounded-full"
                          style={`background-color: ${t.categoryColor}`}
                          aria-hidden="true"
                        />
                        {t.categoryName}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-gray-500">{t.memo}</td>
                    <td class="px-3 py-2 whitespace-nowrap">
                      <div class="flex items-center justify-end gap-2">
                        <Link
                          href={`/transactions/${t.id}/edit`}
                          class="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                        >
                          編集
                        </Link>
                        <Form action={`/transactions/${t.id}/delete`} method="post">
                          {() => (
                            <button
                              type="submit"
                              class="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                            >
                              削除
                            </button>
                          )}
                        </Form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
