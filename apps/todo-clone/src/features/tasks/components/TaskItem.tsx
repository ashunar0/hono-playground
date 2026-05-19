import { cn } from "@/lib/cn";
import { Link, router } from "@ts-76/inertia-hono-jsx";
import type { HomePageProps, Task } from "../types";

type Props = {
  task: Task;
  activeTag?: string;
  now: number;
  linkTo: (overrides: { tag?: string }) => string;
};

export function TaskItem({ task, activeTag, now, linkTo }: Props) {
  const due = task.dueAt ? new Date(task.dueAt) : null;
  const overdue = due !== null && !task.done && due.getTime() < now;

  const handleToggle = (e: Event) => {
    const checked = (e.currentTarget as HTMLInputElement).checked;
    router
      .optimistic<HomePageProps>((pageProps) => ({
        tasks: pageProps.tasks.map((t) => (t.id === task.id ? { ...t, done: checked } : t)),
      }))
      .patch(`/tasks/${task.id}`, { done: checked }, { preserveScroll: true });
  };

  const handleDelete = () => {
    router
      .optimistic<HomePageProps>((pageProps) => ({
        tasks: pageProps.tasks.filter((t) => t.id !== task.id),
      }))
      .delete(`/tasks/${task.id}`, { preserveScroll: true });
  };

  return (
    <li class="flex items-center gap-3 p-3">
      <input type="checkbox" checked={task.done} onChange={handleToggle} class="h-4 w-4" />
      <div class="flex-1 min-w-0">
        <div class={task.done ? "text-gray-400 line-through" : ""}>{task.title}</div>
        <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
          {due !== null && (
            <span class={overdue ? "font-medium text-red-500" : "text-gray-500"}>
              📅 {due.toLocaleDateString("ja-JP")}
              {overdue && " (期限切れ)"}
            </span>
          )}
          {task.tags.map((tag) => (
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
      <button type="button" onClick={handleDelete} class="text-sm text-red-500 hover:text-red-700">
        削除
      </button>
    </li>
  );
}
