import { useState } from "hono/jsx";
import type { Child } from "hono/jsx/dom";
import { Link } from "@ts-76/inertia-hono-jsx";

export default function MainLayout({ children }: { children?: Child }) {
  const [clicks, setClicks] = useState(0);

  return (
    <>
      <header style="border-bottom:1px solid #ccc;padding:8px 16px;display:flex;gap:16px;align-items:center;">
        <strong>Playground</strong>
        <nav style="display:flex;gap:12px;">
          <Link href="/">Home</Link>
          <Link href="/users">Users</Link>
          <Link href="/adapter/head-keys">Head Demo</Link>
        </nav>
        <button type="button" style="margin-left:auto;" onClick={() => setClicks((n) => n + 1)}>
          Layout clicks: {clicks}
        </button>
      </header>
      <main style="padding:16px;">{children}</main>
    </>
  );
}
