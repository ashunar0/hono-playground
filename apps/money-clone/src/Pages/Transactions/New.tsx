import { Layout } from "@/components/Layout";
import type { Account } from "@/features/accounts/types";
import type { Category } from "@/features/categories/types";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";
import { Link } from "@ts-76/inertia-hono-jsx";

type Props = {
  accounts: Account[];
  categories: Category[];
};

export default function TransactionsNew({ accounts, categories }: Props) {
  return (
    <Layout>
      <div class="mx-auto max-w-2xl p-8">
        <div class="mb-6 flex items-center justify-between">
          <h1 class="text-2xl font-bold">取引を追加</h1>
          <Link href="/transactions" class="text-sm text-blue-600 hover:underline">
            ← 一覧に戻る
          </Link>
        </div>
        <TransactionForm
          action="/transactions"
          submitLabel="登録"
          accounts={accounts}
          categories={categories}
        />
      </div>
    </Layout>
  );
}
