import type { PageProps } from '@hono/inertia'

export default function UsersShow(props: PageProps<'Users/Show'>) {
  return (
    <>
      <h1>{props.user.name}</h1>
      <p>Role: {props.user.role}</p>
      <a href="/users">Back to users</a>
    </>
  )
}
