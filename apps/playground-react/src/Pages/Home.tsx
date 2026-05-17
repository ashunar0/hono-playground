import type { PageProps } from "@hono/inertia";
import { Link } from "@inertiajs/react";

export default function Home(props: PageProps<"Home">) {
  return (
    <>
      <h1>{props.greeting}</h1>
      <p>Hono Inertia + React — Step 5: Link で SPA ナビゲーション</p>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link href="/users">Users</Link>
        <Link href="/adapter/head-keys">Head Demo</Link>
      </nav>
    </>
  );
}
