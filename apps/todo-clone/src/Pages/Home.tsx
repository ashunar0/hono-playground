import { Toaster } from "@/components/Toaster";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import { TaskItem } from "@/features/tasks/components/TaskItem";
import type { HomePageProps } from "@/features/tasks/types";
import { cn } from "@/lib/cn";
import { href } from "@/lib/href";
import { Deferred, Form, Link } from "@ts-76/inertia-hono-jsx";

type FilterStatus = "open" | "done" | "all";
type FilterOverrides = Partial<{
  status: FilterStatus;
  tag: string | undefined;
  overdue: boolean;
}>;

export default function Home({ tasks, filter, user }: HomePageProps) {
  const now = Date.now();
  const status: FilterStatus = filter?.status ?? "all";
  const activeTag: string | undefined = filter?.tag;
  const overdueOn = Boolean(filter?.overdue);

  const linkTo = (overrides: FilterOverrides = {}) => {
    const next = { status, tag: activeTag, overdue: overdueOn, ...overrides };
    return href("/", {
      status: next.status === "all" ? undefined : next.status,
      tag: next.tag,
      overdue: next.overdue ? "1" : undefined,
    });
  };

  const tabClass = (active: boolean) =>
    cn(
      "rounded px-3 py-1 text-sm",
      active ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    );

  return (
    <>
      <Toaster />
      <div class="mx-auto max-w-2xl p-8">
        <div class="mb-6 flex items-center justify-between">
          <h1 class="text-3xl font-bold tracking-tight">todo-clone</h1>
          <div class="flex items-center gap-3 text-sm">
            <span class="text-gray-600">{user.name}</span>
            <Form action="/logout" method="post">
              <button type="submit" class="text-gray-500 hover:text-gray-800">
                ログアウト
              </button>
            </Form>
          </div>
        </div>

        <TaskForm />

        <div class="mb-4 flex flex-wrap items-center gap-2">
          <Link href={linkTo({ status: "all" })} prefetch class={tabClass(status === "all")}>
            すべて
          </Link>
          <Link href={linkTo({ status: "open" })} prefetch class={tabClass(status === "open")}>
            未完了
          </Link>
          <Link href={linkTo({ status: "done" })} prefetch class={tabClass(status === "done")}>
            完了
          </Link>
          {activeTag && (
            <Link
              href={linkTo({ tag: undefined })}
              prefetch
              class="ml-auto rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
            >
              #{activeTag} ✕
            </Link>
          )}
          <Link
            href={linkTo({ overdue: !overdueOn })}
            prefetch
            preserveScroll
            role="checkbox"
            aria-checked={overdueOn}
            class={cn(
              "flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900",
              !activeTag && "ml-auto",
            )}
          >
            <span
              aria-hidden="true"
              class={cn(
                "flex h-4 w-4 items-center justify-center rounded border text-xs transition-colors",
                overdueOn ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 bg-white",
              )}
            >
              {overdueOn && "✓"}
            </span>
            期限切れのみ
          </Link>
        </div>

        <Deferred
          data="tasks"
          fallback={<p class="text-center text-gray-500">読み込み中なのだ…</p>}
        >
          {() => {
            const list = tasks ?? [];
            return list.length === 0 ? (
              <p class="text-center text-gray-500">タスクがないのだ</p>
            ) : (
              <ul class="divide-y divide-gray-200 rounded border border-gray-200">
                {list.map((t) => (
                  <TaskItem task={t} activeTag={activeTag} now={now} linkTo={linkTo} />
                ))}
              </ul>
            );
          }}
        </Deferred>
      </div>
    </>
  );
}
