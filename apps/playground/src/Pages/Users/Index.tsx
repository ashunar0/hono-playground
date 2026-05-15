type User = { id: number; name: string; role: string }

type Props = {
  users: User[]
}

export default function UsersIndex(props: Props) {
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
