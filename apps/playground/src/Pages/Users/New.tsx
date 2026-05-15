import type { PageProps } from '@hono/inertia'
import { Link, useForm } from '@ts-76/inertia-hono-jsx'

export default function UsersNew(_props: PageProps<'Users/New'>) {
  const form = useForm({ name: '', role: '' })

  const onSubmit = (e: Event) => {
    e.preventDefault()
    form.post('/users')
  }

  return (
    <>
      <h1>New User</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label>
            Name
            <input
              type="text"
              value={form.data.name}
              onInput={(e) => form.setData('name', (e.target as HTMLInputElement).value)}
            />
          </label>
          {form.errors.name && <span style="color:red">{form.errors.name}</span>}
        </div>
        <div>
          <label>
            Role
            <input
              type="text"
              value={form.data.role}
              onInput={(e) => form.setData('role', (e.target as HTMLInputElement).value)}
            />
          </label>
          {form.errors.role && <span style="color:red">{form.errors.role}</span>}
        </div>
        <button type="submit" disabled={form.processing}>
          {form.processing ? 'Submitting…' : 'Create'}
        </button>
      </form>
      <p>
        <Link href="/users">Back to users</Link>
      </p>
    </>
  )
}
