import type { PageComponent } from '@ts-76/inertia-hono-jsx'

const Home: PageComponent<'Home'> = (props) => {
  return (
    <>
      <h1>{props.greeting}</h1>
      <p>Hono Inertia + hono/jsx — Step 4: 型がサーバから貫通している</p>
      <nav>
        <a href="/users">Users</a>
      </nav>
    </>
  )
}

export default Home
