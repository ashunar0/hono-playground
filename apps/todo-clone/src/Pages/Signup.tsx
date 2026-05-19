import { cn } from "@/lib/cn";
import { Form, Link } from "@ts-76/inertia-hono-jsx";

const inputClass = (hasError: boolean) =>
  cn(
    "rounded border px-3 py-2 focus:outline-none",
    hasError ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-blue-500",
  );

export default function Signup() {
  return (
    <div class="mx-auto max-w-sm p-8">
      <h1 class="mb-6 text-2xl font-bold">新規登録</h1>
      <Form action="/signup" method="post">
        {({ errors }) => (
          <div class="flex flex-col gap-3">
            {errors._form && <p class="text-sm text-red-500">{errors._form}</p>}
            <label class="flex flex-col gap-1">
              <span class="text-sm text-gray-700">名前</span>
              <input
                type="text"
                name="name"
                autocomplete="name"
                aria-invalid={errors.name ? "true" : undefined}
                class={inputClass(!!errors.name)}
              />
              {errors.name && <p class="text-sm text-red-500">{errors.name}</p>}
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-sm text-gray-700">メールアドレス</span>
              <input
                type="email"
                name="email"
                autocomplete="email"
                aria-invalid={errors.email ? "true" : undefined}
                class={inputClass(!!errors.email)}
              />
              {errors.email && <p class="text-sm text-red-500">{errors.email}</p>}
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-sm text-gray-700">パスワード (8文字以上)</span>
              <input
                type="password"
                name="password"
                autocomplete="new-password"
                aria-invalid={errors.password ? "true" : undefined}
                class={inputClass(!!errors.password)}
              />
              {errors.password && <p class="text-sm text-red-500">{errors.password}</p>}
            </label>
            <button
              type="submit"
              class="rounded bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
            >
              登録
            </button>
            <Link href="/login" class="text-center text-sm text-blue-600 hover:underline">
              ログインはこちら
            </Link>
          </div>
        )}
      </Form>
    </div>
  );
}
