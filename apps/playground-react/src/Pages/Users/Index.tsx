import type { PageProps } from '@hono/inertia'
import { Link } from '@inertiajs/react'

export default function UsersIndex(props: PageProps<'Users/Index'>) {
  return (
    <>
      <h1>Users</h1>
      <ul>
        {props.users.map((u) => (
          <li key={u.id}>
            <Link href={`/users/${u.id}`}>{u.name}</Link>
          </li>
        ))}
      </ul>
      <Link href="/">Home</Link>
    </>
  )
}
