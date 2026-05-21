import { Layout } from "@/components/Layout";
import { MonthPager } from "@/components/MonthPager";
import type { Account } from "@/features/accounts/types";
import type { Category } from "@/features/categories/types";
import { TransactionFilters } from "@/features/transactions/components/TransactionFilters";
import { TransactionsTable } from "@/features/transactions/components/TransactionsTable";
import type { TransactionFilter } from "@/features/transactions/schema";
import type { TransactionListItem } from "@/features/transactions/types";
import { Link } from "@ts-76/inertia-hono-jsx";

type Props = {
  transactions: TransactionListItem[];
  accounts: Account[];
  categories: Category[];
  filter: TransactionFilter;
};

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
          <MonthPager period={filter.period} baseParams={baseParams} only={PARTIAL_RELOAD_KEYS} />
        </div>

        <TransactionFilters accounts={accounts} categories={categories} filter={filter} />

        <TransactionsTable transactions={transactions} />
      </div>
    </Layout>
  );
}
