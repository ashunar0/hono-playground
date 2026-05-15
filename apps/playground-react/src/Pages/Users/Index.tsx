import type { PageProps } from '@hono/inertia'

export default function UsersIndex(props: PageProps<'Users/Index'>) {
  return (
    <>
      <h1>Users</h1>
      <ul>
        {props.users.map((u) => (
          <li key={u.id}>
            <a href={`/users/${u.id}`}>{u.name}</a>
          </li>
        ))}
      </ul>
      <a href="/">Home</a>
    </>
  )
}
