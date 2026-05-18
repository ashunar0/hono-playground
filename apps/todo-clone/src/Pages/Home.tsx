import type { PageProps } from "@hono/inertia";
import { Form, router } from "@ts-76/inertia-hono-jsx";

export default function Home({ tasks }: PageProps<"Home">) {
  return (
    <>
      <h1>todo-clone</h1>

      <Form action="/tasks" method="post" resetOnSuccess>
        {() => (
          <div>
            <input type="text" name="title" placeholder="新しいタスク..." required />
            <button type="submit">追加</button>
          </div>
        )}
      </Form>

      <ul>
        {tasks.map((t) => (
          <li>
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
            />
            <span style={t.done ? "text-decoration: line-through" : undefined}>{t.title}</span>
            <button
              type="button"
              onClick={() => router.delete(`/tasks/${t.id}`, { preserveScroll: true })}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
