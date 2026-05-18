import type { PageProps } from "@hono/inertia";
import { Link, router } from "@ts-76/inertia-hono-jsx";
import { TaskForm } from "../features/tasks/components/TaskForm";
import { cn } from "../lib/cn";
import { href } from "../lib/href";

type FilterStatus = "open" | "done" | "all";
type FilterOverrides = Partial<{ status: FilterStatus; tag: string | undefined; overdue: boolean }>;

export default function Home({ tasks, filter }: PageProps<"Home">) {
  const now = Date.now();
  const status: FilterStatus = filter?.status ?? "open";
  const activeTag: string | undefined = filter?.tag;
  const overdueOn = Boolean(filter?.overdue);

  const linkTo = (overrides: FilterOverrides = {}) => {
    const next = { status, tag: activeTag, overdue: overdueOn, ...overrides };
    return href("/", {
      status: next.status === "open" ? undefined : next.status,
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
    <div class="mx-auto max-w-2xl p-8">
      <h1 class="mb-6 text-3xl font-bold tracking-tight">todo-clone</h1>

      <TaskForm />

      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Link href={linkTo({ status: "open" })} class={tabClass(status === "open")}>
          未完了
        </Link>
        <Link href={linkTo({ status: "done" })} class={tabClass(status === "done")}>
          完了
        </Link>
        <Link href={linkTo({ status: "all" })} class={tabClass(status === "all")}>
          すべて
        </Link>
        <Link href={linkTo({ overdue: !overdueOn })} class={tabClass(overdueOn)}>
          期限切れのみ
        </Link>
        {activeTag && (
          <Link
            href={linkTo({ tag: undefined })}
            class="ml-auto rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
          >
            #{activeTag} ✕
          </Link>
        )}
      </div>

      {tasks.length === 0 ? (
        <p class="text-center text-gray-500">タスクがないのだ</p>
      ) : (
        <ul class="divide-y divide-gray-200 rounded border border-gray-200">
          {tasks.map((t) => {
            const due = t.dueAt ? new Date(t.dueAt) : null;
            const overdue = due !== null && !t.done && due.getTime() < now;
            return (
              <li class="flex items-center gap-3 p-3">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) =>
                    router.patch(
                      `/tasks/${t.id}`,
                      { done: (e.currentTarget as HTMLInputElement).checked },
                      { preserveScroll: true },
                    )
                  }
                  class="h-4 w-4"
                />
                <div class="flex-1 min-w-0">
                  <div class={t.done ? "text-gray-400 line-through" : ""}>{t.title}</div>
                  <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    {due !== null && (
                      <span class={overdue ? "font-medium text-red-500" : "text-gray-500"}>
                        📅 {due.toLocaleDateString("ja-JP")}
                        {overdue && " (期限切れ)"}
                      </span>
                    )}
                    {t.tags.map((tag) => (
                      <Link
                        href={linkTo({ tag })}
                        class={cn(
                          "rounded px-2 py-0.5",
                          tag === activeTag
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                        )}
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.delete(`/tasks/${t.id}`, { preserveScroll: true })}
                  class="text-sm text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
