import { inertia, serializePage, type RootView } from '@hono/inertia'
import { Hono } from 'hono'
import { renderToString } from 'hono/jsx/dom/server'
import { Link as ViteLink, ViteClient } from 'vite-ssr-components/hono'

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
    <title>Playground</title>
    ${renderToString(<ViteClient />)}
    ${renderToString(<ViteLink href="/src/style.css" rel="stylesheet" />)}
  </head>
  <body>
    <script data-page="app" type="application/json">${serializePage(page)}</script>
    <div id="app"></div>
  </body>
</html>`

const app = new Hono()
  .use(inertia({ version, rootView }))
  .get('/', (c) => c.render('Home', { greeting: 'Hello from Hono Inertia' }))
  .get('/users', (c) => c.render('Users/Index', { users }))
  .get('/users/:id', (c) => {
    const user = users.find((u) => u.id === Number(c.req.param('id')))
    if (!user) return c.notFound()
    return c.render('Users/Show', { user })
  })

export default app
