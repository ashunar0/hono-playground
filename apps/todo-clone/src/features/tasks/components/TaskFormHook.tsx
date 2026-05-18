import { useForm } from "@ts-76/inertia-hono-jsx";
import { cn } from "@/lib/cn";

export function TaskFormHook() {
  const form = useForm({
    title: "",
    dueAt: "",
    tagNames: "",
  });

  const onSubmit = (e: Event) => {
    e.preventDefault();
    form.post("/tasks", {
      onSuccess: () => form.reset(),
    });
  };

  const inputClass = (hasError: boolean, extra?: string) =>
    cn(
      "rounded border px-3 py-2 focus:outline-none",
      extra,
      hasError ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-blue-500",
    );

  return (
    <form onSubmit={onSubmit} class="mb-6 flex flex-col gap-2">
      <input
        type="text"
        placeholder="新しいタスク..."
        value={form.data.title}
        onInput={(e) => form.setData("title", (e.currentTarget as HTMLInputElement).value)}
        aria-invalid={form.errors.title ? "true" : undefined}
        class={inputClass(!!form.errors.title)}
      />
      {form.errors.title && <p class="text-sm text-red-500">{form.errors.title}</p>}
      <div class="flex flex-wrap gap-2">
        <input
          type="date"
          value={form.data.dueAt}
          onInput={(e) => form.setData("dueAt", (e.currentTarget as HTMLInputElement).value)}
          aria-invalid={form.errors.dueAt ? "true" : undefined}
          class={inputClass(!!form.errors.dueAt)}
        />
        <input
          type="text"
          placeholder="タグ (カンマ区切り)"
          value={form.data.tagNames}
          onInput={(e) => form.setData("tagNames", (e.currentTarget as HTMLInputElement).value)}
          aria-invalid={form.errors.tagNames ? "true" : undefined}
          class={inputClass(!!form.errors.tagNames, "min-w-0 flex-1")}
        />
        <button
          type="submit"
          disabled={form.processing}
          class="rounded bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {form.processing ? "送信中..." : "追加"}
        </button>
      </div>
      {form.errors.dueAt && <p class="text-sm text-red-500">{form.errors.dueAt}</p>}
      {form.errors.tagNames && <p class="text-sm text-red-500">{form.errors.tagNames}</p>}
    </form>
  );
}
