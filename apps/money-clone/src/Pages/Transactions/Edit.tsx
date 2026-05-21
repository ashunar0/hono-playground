import { Layout } from "@/components/Layout";
import type { Account } from "@/features/accounts/types";
import type { Category } from "@/features/categories/types";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";
import type { TransactionRow } from "@/features/transactions/types";
import { Link } from "@ts-76/inertia-hono-jsx";

type Props = {
  transaction: TransactionRow;
  accounts: Account[];
  categories: Category[];
};

export default function TransactionsEdit({ transaction, accounts, categories }: Props) {
  return (
    <Layout>
      <div class="mx-auto max-w-2xl p-8">
        <div class="mb-6 flex items-center justify-between">
          <h1 class="text-2xl font-bold">取引を編集</h1>
          <Link href="/transactions" class="text-sm text-blue-600 hover:underline">
            ← 一覧に戻る
          </Link>
        </div>
        <TransactionForm
          action={`/transactions/${transaction.id}`}
          submitLabel="保存"
          accounts={accounts}
          categories={categories}
          defaults={{
            date: transaction.date,
            amount: transaction.amount,
            type: transaction.type,
            accountId: transaction.accountId,
            categoryId: transaction.categoryId,
            memo: transaction.memo,
          }}
        />
      </div>
    </Layout>
  );
}
