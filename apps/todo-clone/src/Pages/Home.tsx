import type { PageProps } from "@hono/inertia";

export default function Home({ tasks }: PageProps<"Home">) {
  return (
    <>
      <h1>todo-clone</h1>
      <p>tasks: {JSON.stringify(tasks)}</p>
    </>
  );
}
