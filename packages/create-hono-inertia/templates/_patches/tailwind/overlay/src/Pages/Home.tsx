import type { PageProps } from "@hono/inertia";

export default function Home({ message }: PageProps<"Home">) {
  return (
    <main class="mx-auto max-w-2xl p-8 font-sans">
      <h1 class="text-3xl font-bold text-gray-900">Hono + Inertia App</h1>
      <p class="mt-2 text-gray-600">{message}</p>
    </main>
  );
}
