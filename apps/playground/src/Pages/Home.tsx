import type { PageProps } from "@hono/inertia";

export default function Home(props: PageProps<"Home">) {
  return (
    <>
      <h1>{props.greeting}</h1>
      <p>Hono Inertia + hono/jsx — Step 9a: 永続レイアウト</p>
    </>
  );
}
