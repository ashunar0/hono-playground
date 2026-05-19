import { Toaster } from "@/components/Toaster";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import { TaskItem } from "@/features/tasks/components/TaskItem";
import type { ListFilter } from "@/features/tasks/schema";
import type { Task } from "@/features/tasks/types";
import { cn } from "@/lib/cn";
import { href } from "@/lib/href";
import type { AuthVariables } from "@/middleware/auth";
import { Form, Link } from "@ts-76/inertia-hono-jsx";

type FilterStatus = "open" | "done" | "all";
type FilterOverrides = Partial<{ status: FilterStatus; tag: string | undefined; overdue: boolean }>;
type User = NonNullable<AuthVariables["user"]>;

type HomeProps = { tasks: Task[]; filter: ListFilter; user: User };

export default function Home({ tasks, filter, user }: HomeProps) {
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
            {tasks.map((t) => (
              <TaskItem task={t} activeTag={activeTag} now={now} linkTo={linkTo} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
