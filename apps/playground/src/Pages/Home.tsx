type HomeProps = {
  greeting: string
}

export default function Home(props: HomeProps) {
  return (
    <>
      <h1>{props.greeting}</h1>
      <p>Hono Inertia + hono/jsx — Step 3: クライアント hydration が動いた</p>
      <nav>
        <a href="/users">Users</a>
      </nav>
    </>
  )
}
