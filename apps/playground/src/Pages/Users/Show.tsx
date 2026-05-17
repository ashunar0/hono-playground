import type { PageProps } from "@hono/inertia";
import { Link } from "@ts-76/inertia-hono-jsx";

export default function UsersShow(props: PageProps<"Users/Show">) {
  return (
    <>
      <h1>{props.user.name}</h1>
      <p>Role: {props.user.role}</p>
      <Link href="/users">Back to users</Link>
    </>
  );
}
