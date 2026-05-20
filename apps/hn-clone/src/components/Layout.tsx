import { Toaster } from "@/components/Toaster";
import { Form, Link, usePage } from "@ts-76/inertia-hono-jsx";
import type { Child } from "hono/jsx";

export function Layout({ children }: { children?: Child }) {
  // user は shareUser middleware が shared data に注入。未ログインは null。
  const user = usePage().props.user;

  return (
    <>
      <Toaster />
      <header class="border-b border-gray-200 bg-orange-500">
        <div class="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2 text-sm">
          <Link href="/" class="font-bold text-white">
            hn-clone
          </Link>
          <Link href="/submit" class="text-white/90 hover:text-white">
            submit
          </Link>
          <div class="ml-auto flex items-center gap-3 text-white/90">
            {user ? (
              <>
                <span class="font-medium text-white">{user.name}</span>
                <Form action="/logout" method="post">
                  <button type="submit" class="hover:text-white">
                    logout
                  </button>
                </Form>
              </>
            ) : (
              <Link href="/login" class="hover:text-white">
                login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main class="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </>
  );
}
