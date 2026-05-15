import { inertia, serializePage, type RootView } from '@hono/inertia'
import { Hono } from 'hono'

const version = 'v1'

const users = [
  { id: 1, name: 'Taka', role: 'Designer' },
  { id: 2, name: 'Mika', role: 'Engineer' },
  { id: 3, name: 'Ren', role: 'Product' },
]

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
  .get('/users/:id', (c) => {
    const user = users.find((u) => u.id === Number(c.req.param('id')))
    if (!user) return c.notFound()
    return c.render('Users/Show', { user })
  })

export default app
