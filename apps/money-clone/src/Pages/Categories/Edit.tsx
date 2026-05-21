import { Layout } from "@/components/Layout";
import {
  CATEGORY_COLORS,
  CATEGORY_KINDS,
  type CategoryKind,
  categoryKindLabels,
} from "@/features/categories/schema";
import type { Category } from "@/features/categories/types";
import { FormField } from "@/features/auth/components/FormField";
import { inputClass } from "@/lib/inputClass";
import { Form, Link } from "@ts-76/inertia-hono-jsx";

type Props = { category: Category };

export default function CategoriesEdit({ category }: Props) {
  return (
    <Layout>
      <div class="mx-auto max-w-3xl p-8">
        <div class="mb-6 flex items-center justify-between">
          <h1 class="text-2xl font-bold">カテゴリを編集</h1>
          <Link href="/categories" class="text-sm text-blue-600 hover:underline">
            ← 一覧に戻る
          </Link>
        </div>

        <Form action={`/categories/${category.id}`} method="post">
          {({ errors }) => (
            <div class="flex flex-col gap-3 rounded border border-gray-200 bg-white p-6">
              <FormField
                name="name"
                type="text"
                label="名前"
                error={errors.name}
                defaultValue={category.name}
              />
              <label class="flex flex-col gap-1">
                <span class="text-sm text-gray-700">種別</span>
                <select
                  name="kind"
                  class={inputClass(!!errors.kind)}
                  aria-invalid={errors.kind ? "true" : undefined}
                >
                  {CATEGORY_KINDS.map((k: CategoryKind) => (
                    <option value={k} selected={k === category.kind}>
                      {categoryKindLabels[k]}
                    </option>
                  ))}
                </select>
                {errors.kind && <p class="text-sm text-red-500">{errors.kind}</p>}
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-sm text-gray-700">色</span>
                <div class="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((c) => (
                    <label class="cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value={c}
                        checked={c === category.color}
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
                保存
              </button>
            </div>
          )}
        </Form>
      </div>
    </Layout>
  );
}
