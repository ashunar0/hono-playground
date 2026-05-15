import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import { createRoot, hydrateRoot } from 'react-dom/client'

console.log('🌱 client booted', new Date().toISOString())

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.tsx', { eager: true })
    return pages[`./Pages/${name}.tsx`]
  },
  setup({ el, App, props }) {
    if (el.hasAttribute('data-server-rendered')) {
      hydrateRoot(el, <App {...props} />)
    } else {
      createRoot(el).render(<App {...props} />)
    }
  },
})
