import { inertia, serializePage, type RootView } from '@hono/inertia'
import { Hono } from 'hono'

const version = 'v1'

const users = [
  { id: 1, name: 'Taka', role: 'Designer' },
  { id: 2, name: 'Mika', role: 'Engineer' },
  { id: 3, name: 'Ren', role: 'Product' },
]

type UserFormErrors = { name?: string; role?: string }
const noUserFormErrors: UserFormErrors = {}

const rootView: RootView = (page) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Playground (React)</title>
    <script type="module" src="/@vite/client"></script>
    <link href="/src/style.css" rel="stylesheet" />
  </head>
  <body>
    <script data-page="app" type="application/json">${serializePage(page)}</script>
    <div id="app"></div>
    <script type="module" src="/src/client.tsx"></script>
  </body>
</html>`

const app = new Hono()
  .use(inertia({ version, rootView }))
  .get('/', (c) => c.render('Home', { greeting: 'Hello from Hono Inertia (React)' }))
  .get('/users', (c) => c.render('Users/Index', { users }))
  .get('/users/new', (c) => c.render('Users/New', { errors: noUserFormErrors }))
  .post('/users', async (c) => {
    const body = await c.req.json<{ name?: string; role?: string }>()
    const name = (body.name ?? '').trim()
    const role = (body.role ?? '').trim()

    const errors: UserFormErrors = {}
    if (!name) errors.name = 'Name is required'
    if (!role) errors.role = 'Role is required'

    if (errors.name || errors.role) {
      return c.render('Users/New', { errors })
    }

    const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1
    users.push({ id, name, role })
    return c.redirect('/users')
  })
  .get('/users/:id', (c) => {
    const user = users.find((u) => u.id === Number(c.req.param('id')))
    if (!user) return c.notFound()
    return c.render('Users/Show', { user })
  })

export default app
