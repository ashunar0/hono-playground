import type { PageComponent } from '@ts-76/inertia-hono-jsx'

const UsersShow: PageComponent<'Users/Show'> = (props) => {
  return (
    <>
      <h1>{props.user.name}</h1>
      <p>Role: {props.user.role}</p>
      <a href="/users">Back to users</a>
    </>
  )
}

export default UsersShow
