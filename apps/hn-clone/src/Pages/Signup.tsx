import { FormField } from "@/features/auth/components/FormField";
import { Form, Link } from "@ts-76/inertia-hono-jsx";

export default function Signup() {
  return (
    <div class="mx-auto max-w-sm p-8">
      <h1 class="mb-6 text-2xl font-bold">新規登録</h1>
      <Form action="/signup" method="post">
        {({ errors }) => (
          <div class="flex flex-col gap-3">
            {errors._form && <p class="text-sm text-red-500">{errors._form}</p>}
            <FormField
              name="name"
              type="text"
              label="名前"
              autocomplete="name"
              error={errors.name}
            />
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
              label="パスワード (8文字以上)"
              autocomplete="new-password"
              error={errors.password}
            />
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
