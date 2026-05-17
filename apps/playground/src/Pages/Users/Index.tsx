import type { PageProps } from "@hono/inertia";
import { Deferred, Link, router } from "@ts-76/inertia-hono-jsx";

export default function UsersIndex(props: PageProps<"Users/Index">) {
  return (
    <>
      <h1>Users</h1>
      <p>
        Server time (initial / last full): <strong>{props.serverTime}</strong>
      </p>
      <Deferred data="stats" fallback={<p>📊 Loading stats…</p>}>
        <p>
          📊 Total: <strong>{props.stats?.total}</strong> users, computed at{" "}
          <strong>{props.stats?.computedAt}</strong>
        </p>
      </Deferred>
      <p>
        <button type="button" onClick={() => router.reload({ only: ["users"] })}>
          Reload users only
        </button>{" "}
        <button type="button" onClick={() => router.reload()}>
          Full reload
        </button>
      </p>
      <p>
        <Link href="/users/new">+ Add new user</Link>
      </p>
      <ul>
        {props.users.map((u) => (
          <li>
            <Link href={`/users/${u.id}`}>{u.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
