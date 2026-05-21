import type { PageProps } from "@hono/inertia";

export default function Home({ message }: PageProps<"Home">) {
  return (
    <div class="min-h-screen bg-slate-50 text-slate-900">
      <div class="mx-auto max-w-3xl px-6 py-16">
        <h1 class="text-3xl font-bold tracking-tight">Hono + Inertia App</h1>
        <p class="mt-4 text-slate-600">{message}</p>
      </div>
    </div>
  );
}
