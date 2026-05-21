import { Layout } from "@/components/Layout";
import {
  type AccountType,
  ACCOUNT_TYPES,
  accountTypeLabels,
} from "@/features/accounts/schema";
import type { Account } from "@/features/accounts/types";
import { FormField } from "@/features/auth/components/FormField";
import { inputClass } from "@/lib/inputClass";
import { Form, Link } from "@ts-76/inertia-hono-jsx";

type Props = { account: Account };

export default function AccountsEdit({ account }: Props) {
  return (
    <Layout>
    <div class="mx-auto max-w-3xl p-8">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold">口座を編集</h1>
        <Link href="/accounts" class="text-sm text-blue-600 hover:underline">
          ← 一覧に戻る
        </Link>
      </div>

      <Form action={`/accounts/${account.id}`} method="post">
        {({ errors }) => (
          <div class="flex flex-col gap-3 rounded border border-gray-200 bg-white p-6">
            <FormField
              name="name"
              type="text"
              label="名前"
              error={errors.name}
              defaultValue={account.name}
            />
            <label class="flex flex-col gap-1">
              <span class="text-sm text-gray-700">種別</span>
              <select
                name="type"
                class={inputClass(!!errors.type)}
                aria-invalid={errors.type ? "true" : undefined}
              >
                {ACCOUNT_TYPES.map((t: AccountType) => (
                  <option value={t} selected={t === account.type}>
                    {accountTypeLabels[t]}
                  </option>
                ))}
              </select>
              {errors.type && <p class="text-sm text-red-500">{errors.type}</p>}
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-sm text-gray-700">初期残高 (円)</span>
              <input
                type="number"
                name="initialBalance"
                min="0"
                step="1"
                value={String(account.initialBalance)}
                class={inputClass(!!errors.initialBalance)}
                aria-invalid={errors.initialBalance ? "true" : undefined}
              />
              {errors.initialBalance && (
                <p class="text-sm text-red-500">{errors.initialBalance}</p>
              )}
            </label>
            <button
              type="submit"
              class="rounded bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        )}
      </Form>
    </div>
    </Layout>
  );
}
