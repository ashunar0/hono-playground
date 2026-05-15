type User = { id: number; name: string; role: string }

type Props = {
  user: User
}

export default function UsersShow(props: Props) {
  return (
    <>
      <h1>{props.user.name}</h1>
      <p>Role: {props.user.role}</p>
      <a href="/users">Back to users</a>
    </>
  )
}
