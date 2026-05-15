import { createInertiaApp, type ResolvedComponent } from '@ts-76/inertia-hono-jsx'

createInertiaApp({
  resolve: (name: string) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.tsx', { eager: true })
    return pages[`./Pages/${name}.tsx`]
  },
})
