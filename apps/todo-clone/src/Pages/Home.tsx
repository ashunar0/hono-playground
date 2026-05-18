import type { PageProps } from "@hono/inertia";
import { Form, Link, router } from "@ts-76/inertia-hono-jsx";

type FilterStatus = "open" | "done" | "all";

const buildFilterHref = (filter: {
  status?: FilterStatus;
  tag?: string;
  overdue?: boolean;
}) => {
  const params = new URLSearchParams();
  if (filter.status && filter.status !== "open")
    params.set("status", filter.status);
  if (filter.tag) params.set("tag", filter.tag);
  if (filter.overdue) params.set("overdue", "1");
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
};

export default function Home({ tasks, filter }: PageProps<"Home">) {
  const now = Date.now();
  const status: FilterStatus = filter?.status ?? "open";
  const activeTag: string | undefined = filter?.tag;
  const overdueOn = Boolean(filter?.overdue);

  const tabClass = (active: boolean) =>
    `rounded px-3 py-1 text-sm ${
      active
        ? "bg-blue-500 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div class="mx-auto max-w-2xl p-8">
      <h1 class="mb-6 text-3xl font-bold tracking-tight">todo-clone</h1>

      <Form action="/tasks" method="post" resetOnSuccess>
        {({ errors }) => (
          <div class="mb-6 flex flex-col gap-2">
            <input
              type="text"
              name="title"
              placeholder="新しいタスク..."
              aria-invalid={errors.title ? "true" : undefined}
              class={`rounded border px-3 py-2 focus:outline-none ${
                errors.title
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />
            {errors.title && <p class="text-sm text-red-500">{errors.title}</p>}
            <div class="flex flex-wrap gap-2">
              <input
                type="date"
                name="dueAt"
                aria-invalid={errors.dueAt ? "true" : undefined}
                class={`rounded border px-3 py-2 focus:outline-none ${
                  errors.dueAt
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              <input
                type="text"
                name="tagNames"
                placeholder="タグ (カンマ区切り)"
                aria-invalid={errors.tagNames ? "true" : undefined}
                class={`min-w-0 flex-1 rounded border px-3 py-2 focus:outline-none ${
                  errors.tagNames
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              <button
                type="submit"
                class="rounded bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
              >
                追加
              </button>
            </div>
            {errors.dueAt && <p class="text-sm text-red-500">{errors.dueAt}</p>}
            {errors.tagNames && (
              <p class="text-sm text-red-500">{errors.tagNames}</p>
            )}
          </div>
        )}
      </Form>

      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href={buildFilterHref({
            status: "open",
            tag: activeTag,
            overdue: overdueOn,
          })}
          class={tabClass(status === "open")}
        >
          未完了
        </Link>
        <Link
          href={buildFilterHref({
            status: "done",
            tag: activeTag,
            overdue: overdueOn,
          })}
          class={tabClass(status === "done")}
        >
          完了
        </Link>
        <Link
          href={buildFilterHref({
            status: "all",
            tag: activeTag,
            overdue: overdueOn,
          })}
          class={tabClass(status === "all")}
        >
          すべて
        </Link>
        <Link
          href={buildFilterHref({
            status,
            tag: activeTag,
            overdue: !overdueOn,
          })}
          class={tabClass(overdueOn)}
        >
          期限切れのみ
        </Link>
        {activeTag && (
          <Link
            href={buildFilterHref({ status, overdue: overdueOn })}
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
                  <div class={t.done ? "text-gray-400 line-through" : ""}>
                    {t.title}
                  </div>
                  <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    {due !== null && (
                      <span
                        class={
                          overdue ? "font-medium text-red-500" : "text-gray-500"
                        }
                      >
                        📅 {due.toLocaleDateString("ja-JP")}
                        {overdue && " (期限切れ)"}
                      </span>
                    )}
                    {t.tags.map((tag) => (
                      <Link
                        href={buildFilterHref({
                          status,
                          tag,
                          overdue: overdueOn,
                        })}
                        class={`rounded px-2 py-0.5 ${
                          tag === activeTag
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    router.delete(`/tasks/${t.id}`, { preserveScroll: true })
                  }
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
