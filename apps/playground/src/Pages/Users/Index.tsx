import type { PageComponent } from '@ts-76/inertia-hono-jsx'

const UsersIndex: PageComponent<'Users/Index'> = (props) => {
  return (
    <>
      <h1>Users</h1>
      <ul>
        {props.users.map((u) => (
          <li>
            <a href={`/users/${u.id}`}>{u.name}</a>
          </li>
        ))}
      </ul>
      <a href="/">Home</a>
    </>
  )
}

export default UsersIndex
