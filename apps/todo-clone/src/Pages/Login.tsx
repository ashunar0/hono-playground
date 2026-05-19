import { cn } from "@/lib/cn";
import { Form, Link } from "@ts-76/inertia-hono-jsx";

const inputClass = (hasError: boolean) =>
  cn(
    "rounded border px-3 py-2 focus:outline-none",
    hasError ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-blue-500",
  );

export default function Login() {
  return (
    <div class="mx-auto max-w-sm p-8">
      <h1 class="mb-6 text-2xl font-bold">ログイン</h1>
      <Form action="/login" method="post">
        {({ errors }) => (
          <div class="flex flex-col gap-3">
            {errors._form && <p class="text-sm text-red-500">{errors._form}</p>}
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
              <span class="text-sm text-gray-700">パスワード</span>
              <input
                type="password"
                name="password"
                autocomplete="current-password"
                aria-invalid={errors.password ? "true" : undefined}
                class={inputClass(!!errors.password)}
              />
              {errors.password && <p class="text-sm text-red-500">{errors.password}</p>}
            </label>
            <button
              type="submit"
              class="rounded bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
            >
              ログイン
            </button>
            <Link href="/signup" class="text-center text-sm text-blue-600 hover:underline">
              新規登録はこちら
            </Link>
          </div>
        )}
      </Form>
    </div>
  );
}
