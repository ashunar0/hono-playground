import { Layout } from "@/components/Layout";
import {
  CATEGORY_COLORS,
  CATEGORY_KINDS,
  type CategoryKind,
  categoryKindLabels,
} from "@/features/categories/schema";
import type { CategoriesPageProps } from "@/features/categories/types";
import { FormField } from "@/features/auth/components/FormField";
import { inputClass } from "@/lib/inputClass";
import { Form, Link } from "@ts-76/inertia-hono-jsx";

export default function CategoriesIndex({ categories }: CategoriesPageProps) {
  const expense = categories.filter((c) => c.kind === "expense");
  const income = categories.filter((c) => c.kind === "income");

  return (
    <Layout>
      <div class="mx-auto max-w-3xl p-8">
        <h1 class="mb-6 text-2xl font-bold">カテゴリ</h1>

        <section class="mb-8 rounded border border-gray-200 bg-white p-6">
          <h2 class="mb-4 text-lg font-semibold">新規作成</h2>
          <Form action="/categories" method="post">
            {({ errors }) => (
              <div class="flex flex-col gap-3">
                <FormField
                  name="name"
                  type="text"
                  label="名前 (例: サブスク)"
                  error={errors.name}
                />
                <label class="flex flex-col gap-1">
                  <span class="text-sm text-gray-700">種別</span>
                  <select
                    name="kind"
                    class={inputClass(!!errors.kind)}
                    aria-invalid={errors.kind ? "true" : undefined}
                  >
                    {CATEGORY_KINDS.map((k: CategoryKind) => (
                      <option value={k}>{categoryKindLabels[k]}</option>
                    ))}
                  </select>
                  {errors.kind && <p class="text-sm text-red-500">{errors.kind}</p>}
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-sm text-gray-700">色</span>
                  <div class="flex flex-wrap gap-2">
                    {CATEGORY_COLORS.map((c, i) => (
                      <label class="cursor-pointer">
                        <input
                          type="radio"
                          name="color"
                          value={c}
                          checked={i === 0}
                          class="peer sr-only"
                        />
                        <span
                          class="block h-8 w-8 rounded-full border-2 border-transparent peer-checked:border-gray-900"
                          style={`background-color: ${c}`}
                        />
                      </label>
                    ))}
                  </div>
                  {errors.color && <p class="text-sm text-red-500">{errors.color}</p>}
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

        <CategorySection title="支出" items={expense} />
        <CategorySection title="収入" items={income} />
      </div>
    </Layout>
  );
}

type SectionProps = { title: string; items: CategoriesPageProps["categories"] };

function CategorySection({ title, items }: SectionProps) {
  return (
    <section class="mb-6">
      <h2 class="mb-3 text-lg font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p class="text-gray-500">該当するカテゴリがないのだ。</p>
      ) : (
        <ul class="flex flex-col gap-2">
          {items.map((c) => (
            <li class="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-3">
              <div class="flex items-center gap-3">
                <span
                  class="block h-5 w-5 rounded-full"
                  style={`background-color: ${c.color}`}
                  aria-hidden="true"
                />
                <span class="font-medium">{c.name}</span>
              </div>
              <div class="flex items-center gap-2">
                <Link
                  href={`/categories/${c.id}/edit`}
                  class="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                >
                  編集
                </Link>
                <Form action={`/categories/${c.id}/delete`} method="post">
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
  );
}
