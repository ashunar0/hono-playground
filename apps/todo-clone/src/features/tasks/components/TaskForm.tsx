import { Form } from "@ts-76/inertia-hono-jsx";
import { cn } from "../../../lib/cn";

const inputClass = (hasError: boolean, extra?: string) =>
  cn(
    "rounded border px-3 py-2 focus:outline-none",
    extra,
    hasError ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-blue-500",
  );

export function TaskForm() {
  return (
    <Form action="/tasks" method="post" resetOnSuccess>
      {({ errors }) => (
        <div class="mb-6 flex flex-col gap-2">
          <input
            type="text"
            name="title"
            placeholder="新しいタスク..."
            aria-invalid={errors.title ? "true" : undefined}
            class={inputClass(!!errors.title)}
          />
          {errors.title && <p class="text-sm text-red-500">{errors.title}</p>}
          <div class="flex flex-wrap gap-2">
            <input
              type="date"
              name="dueAt"
              aria-invalid={errors.dueAt ? "true" : undefined}
              class={inputClass(!!errors.dueAt)}
            />
            <input
              type="text"
              name="tagNames"
              placeholder="タグ (カンマ区切り)"
              aria-invalid={errors.tagNames ? "true" : undefined}
              class={inputClass(!!errors.tagNames, "min-w-0 flex-1")}
            />
            <button
              type="submit"
              class="rounded bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
            >
              追加
            </button>
          </div>
          {errors.dueAt && <p class="text-sm text-red-500">{errors.dueAt}</p>}
          {errors.tagNames && <p class="text-sm text-red-500">{errors.tagNames}</p>}
        </div>
      )}
    </Form>
  );
}
