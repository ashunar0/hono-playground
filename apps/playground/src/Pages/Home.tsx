import type { PageProps } from '@hono/inertia'

export default function Home(props: PageProps<'Home'>) {
  return (
    <>
      <h1>{props.greeting}</h1>
      <p>Hono Inertia + hono/jsx — Step 4 リベンジ: PageProps 直使いで型貫通</p>
      <nav>
        <a href="/users">Users</a>
      </nav>
    </>
  )
}
