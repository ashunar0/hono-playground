import { Layout } from "@/components/Layout";
import {
  type AccountType,
  ACCOUNT_TYPES,
  accountTypeLabels,
} from "@/features/accounts/schema";
import type { AccountsPageProps } from "@/features/accounts/types";
import { FormField } from "@/features/auth/components/FormField";
import { formatYen } from "@/lib/format";
import { inputClass } from "@/lib/inputClass";
import { Form, Link } from "@ts-76/inertia-hono-jsx";

export default function AccountsIndex({ accounts }: AccountsPageProps) {
  return (
    <Layout>
    <div class="mx-auto max-w-3xl p-8">
      <h1 class="mb-6 text-2xl font-bold">口座</h1>

      <section class="mb-8 rounded border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-lg font-semibold">新規作成</h2>
        <Form action="/accounts" method="post">
          {({ errors }) => (
            <div class="flex flex-col gap-3">
              <FormField name="name" type="text" label="名前 (例: 三井住友カード)" error={errors.name} />
              <label class="flex flex-col gap-1">
                <span class="text-sm text-gray-700">種別</span>
                <select
                  name="type"
                  class={inputClass(!!errors.type)}
                  aria-invalid={errors.type ? "true" : undefined}
                >
                  {ACCOUNT_TYPES.map((t: AccountType) => (
                    <option value={t}>{accountTypeLabels[t]}</option>
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
                  value="0"
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
                作成
              </button>
            </div>
          )}
        </Form>
      </section>

      <section>
        <h2 class="mb-4 text-lg font-semibold">一覧</h2>
        {accounts.length === 0 ? (
          <p class="text-gray-500">まだ口座がないのだ。上のフォームから作成するのだ。</p>
        ) : (
          <ul class="flex flex-col gap-2">
            {accounts.map((a) => (
              <li class="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-3">
                <div class="flex flex-col">
                  <span class="font-medium">{a.name}</span>
                  <span class="text-sm text-gray-500">
                    {accountTypeLabels[a.type as AccountType]} ・ 初期残高 {formatYen(a.initialBalance)}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <Link
                    href={`/accounts/${a.id}/edit`}
                    class="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    編集
                  </Link>
                  <Form action={`/accounts/${a.id}/delete`} method="post">
                    {() => (
                      <button
                        type="submit"
                        class="rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                      >
                        削除
                      </button>
                    )}
                  </Form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
    </Layout>
  );
}
