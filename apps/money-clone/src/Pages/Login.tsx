import { FormField } from "@/features/auth/components/FormField";
import { Form, Link } from "@ts-76/inertia-hono-jsx";

export default function Login() {
  return (
    <div class="mx-auto max-w-sm p-8">
      <h1 class="mb-6 text-2xl font-bold">ログイン</h1>
      <Form action="/login" method="post">
        {({ errors }) => (
          <div class="flex flex-col gap-3">
            {errors._form && <p class="text-sm text-red-500">{errors._form}</p>}
            <FormField
              name="email"
              type="email"
              label="メールアドレス"
              autocomplete="email"
              error={errors.email}
            />
            <FormField
              name="password"
              type="password"
              label="パスワード"
              autocomplete="current-password"
              error={errors.password}
            />
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
