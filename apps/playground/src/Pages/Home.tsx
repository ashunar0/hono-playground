import type { PageProps } from '@hono/inertia'
import { Link } from '@ts-76/inertia-hono-jsx'

export default function Home(props: PageProps<'Home'>) {
  return (
    <>
      <h1>{props.greeting}</h1>
      <p>Hono Inertia + hono/jsx — Step 5: Link で SPA ナビゲーション</p>
      <nav>
        <Link href="/users">Users</Link>
      </nav>
    </>
  )
}
