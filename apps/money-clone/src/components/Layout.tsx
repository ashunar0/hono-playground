import { Toaster } from "@/components/Toaster";
import { Form, Link, usePage } from "@ts-76/inertia-hono-jsx";
import type { Child } from "hono/jsx";

export function Layout({ children }: { children?: Child }) {
  const user = usePage().props.user;

  return (
    <>
      <Toaster />
      <header class="border-b border-gray-200 bg-emerald-600">
        <div class="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3 text-sm">
          <Link href="/" class="text-base font-bold text-white">
            家計簿
          </Link>
          {user && (
            <>
              <Link href="/transactions" class="text-white/90 hover:text-white">
                取引
              </Link>
              <Link href="/accounts" class="text-white/90 hover:text-white">
                口座
              </Link>
              <Link href="/categories" class="text-white/90 hover:text-white">
                カテゴリ
              </Link>
            </>
          )}
          <div class="ml-auto flex items-center gap-3 text-white/90">
            {user ? (
              <>
                <span class="font-medium text-white">{user.name}</span>
                <Form action="/logout" method="post">
                  {() => (
                    <button type="submit" class="hover:text-white">
                      ログアウト
                    </button>
                  )}
                </Form>
              </>
            ) : (
              <Link href="/login" class="hover:text-white">
                ログイン
              </Link>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
