import { createInertiaApp, type ResolvedComponent } from '@ts-76/inertia-hono-jsx'

console.log('🌱 client booted', new Date().toISOString())

createInertiaApp({
  resolve: (name: string) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.tsx', { eager: true })
    return pages[`./Pages/${name}.tsx`]
  },
})
