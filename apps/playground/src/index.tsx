import { Hono } from 'hono'
import { renderer } from './renderer'

const users = [
  { id: 1, name: 'Taka', role: 'Designer' },
  { id: 2, name: 'Mika', role: 'Engineer' },
  { id: 3, name: 'Ren', role: 'Product' },
]

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.render(
    <>
      <h1>Playground</h1>
      <p>Hono Inertia + hono/jsx を最小から積み上げる研究の場</p>
      <nav>
        <a href="/users">Users</a>
      </nav>
    </>,
  )
})

app.get('/users', (c) => {
  return c.render(
    <>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li>
            <a href={`/users/${user.id}`}>{user.name}</a>
          </li>
        ))}
      </ul>
      <a href="/">Home</a>
    </>,
  )
})

app.get('/users/:id', (c) => {
  const user = users.find((u) => u.id === Number(c.req.param('id')))
  if (!user) return c.notFound()
  return c.render(
    <>
      <h1>{user.name}</h1>
      <p>Role: {user.role}</p>
      <a href="/users">Back to users</a>
    </>,
  )
})

export default app
