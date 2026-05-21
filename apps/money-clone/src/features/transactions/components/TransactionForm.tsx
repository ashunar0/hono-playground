import type { Account } from "@/features/accounts/types";
import { FormField } from "@/features/auth/components/FormField";
import type { Category } from "@/features/categories/types";
import { inputClass } from "@/lib/inputClass";
import { Form } from "@ts-76/inertia-hono-jsx";
import { useState } from "hono/jsx";
import {
  type TransactionType,
  TRANSACTION_TYPES,
  transactionTypeLabels,
} from "../schema";

type DefaultValues = {
  date: string;
  amount: number;
  type: TransactionType;
  accountId: string;
  categoryId: string;
  memo: string | null;
};

type Props = {
  action: string;
  submitLabel: string;
  accounts: Account[];
  categories: Category[];
  defaults?: DefaultValues;
};

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function TransactionForm({ action, submitLabel, accounts, categories, defaults }: Props) {
  const initialType: TransactionType = defaults?.type ?? "expense";
  // type を切り替えると category 候補が連動する。SSR 時は initialType ベース、hydration 後に useState で再選択可。
  const [type, setType] = useState<TransactionType>(initialType);
  const visibleCategories = categories.filter((c) => c.kind === type);
  const initialAccountId = defaults?.accountId ?? accounts[0]?.id ?? "";
  const initialCategoryId =
    defaults?.categoryId ?? categories.find((c) => c.kind === initialType)?.id ?? "";

  return (
    <Form action={action} method="post">
      {({ errors }) => (
        <div class="flex flex-col gap-3 rounded border border-gray-200 bg-white p-6">
          {errors._form && <p class="text-sm text-red-500">{errors._form}</p>}

          <label class="flex flex-col gap-1">
            <span class="text-sm text-gray-700">種別</span>
            <div class="flex gap-2">
              {TRANSACTION_TYPES.map((t) => (
                <label class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded border border-gray-300 px-3 py-2 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50">
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                    class="sr-only"
                  />
                  <span class="text-sm font-medium">{transactionTypeLabels[t]}</span>
                </label>
              ))}
            </div>
            {errors.type && <p class="text-sm text-red-500">{errors.type}</p>}
          </label>

          <FormField
            name="date"
            type="text"
            label="日付 (YYYY-MM-DD)"
            error={errors.date}
            defaultValue={defaults?.date ?? todayISO()}
          />

          <label class="flex flex-col gap-1">
            <span class="text-sm text-gray-700">金額 (円)</span>
            <input
              type="number"
              name="amount"
              min="1"
              step="1"
              value={defaults ? String(defaults.amount) : ""}
              placeholder="980"
              class={inputClass(!!errors.amount)}
              aria-invalid={errors.amount ? "true" : undefined}
            />
            {errors.amount && <p class="text-sm text-red-500">{errors.amount}</p>}
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-sm text-gray-700">口座</span>
            <select
              name="accountId"
              class={inputClass(!!errors.accountId)}
              aria-invalid={errors.accountId ? "true" : undefined}
            >
              {accounts.map((a) => (
                <option value={a.id} selected={a.id === initialAccountId}>
                  {a.name}
                </option>
              ))}
            </select>
            {errors.accountId && <p class="text-sm text-red-500">{errors.accountId}</p>}
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-sm text-gray-700">カテゴリ</span>
            <select
              name="categoryId"
              class={inputClass(!!errors.categoryId)}
              aria-invalid={errors.categoryId ? "true" : undefined}
            >
              {visibleCategories.map((c) => (
                <option value={c.id} selected={c.id === initialCategoryId}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p class="text-sm text-red-500">{errors.categoryId}</p>}
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-sm text-gray-700">メモ (任意)</span>
            <input
              type="text"
              name="memo"
              value={defaults?.memo ?? ""}
              maxLength={200}
              class={inputClass(!!errors.memo)}
              aria-invalid={errors.memo ? "true" : undefined}
            />
            {errors.memo && <p class="text-sm text-red-500">{errors.memo}</p>}
          </label>

          <button
            type="submit"
            class="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
          >
            {submitLabel}
          </button>
        </div>
      )}
    </Form>
  );
}
