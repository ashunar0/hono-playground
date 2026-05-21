import { formatYen } from "@/lib/format";
import { Form, Link } from "@ts-76/inertia-hono-jsx";
import { transactionTypeLabels } from "../schema";
import type { TransactionListItem } from "../types";

type Props = { transactions: TransactionListItem[] };

export function TransactionsTable({ transactions }: Props) {
  if (transactions.length === 0) {
    return <p class="text-gray-500">取引がまだないのだ。「+ 新規追加」から登録するのだ。</p>;
  }

  return (
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
            <Row item={t} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ item: t }: { item: TransactionListItem }) {
  const isExpense = t.type === "expense";
  return (
    <tr class="border-t border-gray-100">
      <td class="whitespace-nowrap px-3 py-2">{t.date}</td>
      <td class="whitespace-nowrap px-3 py-2">
        <span
          class={
            isExpense
              ? "rounded bg-red-50 px-2 py-0.5 text-xs text-red-600"
              : "rounded bg-green-50 px-2 py-0.5 text-xs text-green-700"
          }
        >
          {transactionTypeLabels[t.type]}
        </span>
      </td>
      <td
        class={`whitespace-nowrap px-3 py-2 text-right font-mono ${
          isExpense ? "text-red-600" : "text-green-700"
        }`}
      >
        {isExpense ? "-" : "+"}
        {formatYen(t.amount)}
      </td>
      <td class="whitespace-nowrap px-3 py-2">{t.accountName}</td>
      <td class="whitespace-nowrap px-3 py-2">
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
      <td class="whitespace-nowrap px-3 py-2">
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
  );
}
