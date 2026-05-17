import type { PageProps } from "@hono/inertia";
import { Link } from "@inertiajs/react";

export default function Home(props: PageProps<"Home">) {
  return (
    <>
      <h1>{props.greeting}</h1>
      <p>Hono Inertia + React — Step 5: Link で SPA ナビゲーション</p>
      <nav>
        <Link href="/users">Users</Link>
      </nav>
    </>
  );
}
