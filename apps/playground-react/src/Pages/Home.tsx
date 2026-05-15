import type { PageProps } from '@hono/inertia'

export default function Home(props: PageProps<'Home'>) {
  return (
    <>
      <h1>{props.greeting}</h1>
      <p>Hono Inertia + React — 対照実験用</p>
      <nav>
        <a href="/users">Users</a>
      </nav>
    </>
  )
}
