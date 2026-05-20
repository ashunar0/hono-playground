import { Layout } from "@/components/Layout";
import { inputClass } from "@/lib/inputClass";
import { Form } from "@ts-76/inertia-hono-jsx";

export default function Submit() {
  return (
    <Layout>
      <h1 class="mb-4 text-xl font-bold">投稿する</h1>
      <Form action="/submit" method="post">
        {({ errors, processing }) => (
          <div class="flex flex-col gap-4">
            <label class="flex flex-col gap-1">
              <span class="text-sm text-gray-700">タイトル</span>
              <input
                type="text"
                name="title"
                aria-invalid={errors.title ? "true" : undefined}
                class={inputClass(!!errors.title)}
              />
              {errors.title && <p class="text-sm text-red-500">{errors.title}</p>}
            </label>

            <label class="flex flex-col gap-1">
              <span class="text-sm text-gray-700">URL</span>
              <input
                type="url"
                name="url"
                placeholder="https://example.com"
                aria-invalid={errors.url ? "true" : undefined}
                class={inputClass(!!errors.url)}
              />
              {/* 「URL か本文どちらか必須」の refine エラーも path:["url"] でここに出る。 */}
              {errors.url && <p class="text-sm text-red-500">{errors.url}</p>}
            </label>

            <label class="flex flex-col gap-1">
              <span class="text-sm text-gray-700">本文 (URL の代わり)</span>
              <textarea
                name="text"
                rows={6}
                aria-invalid={errors.text ? "true" : undefined}
                class={inputClass(!!errors.text)}
              />
              {errors.text && <p class="text-sm text-red-500">{errors.text}</p>}
            </label>

            <button
              type="submit"
              disabled={processing}
              class="self-start rounded bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              投稿
            </button>
          </div>
        )}
      </Form>
    </Layout>
  );
}
