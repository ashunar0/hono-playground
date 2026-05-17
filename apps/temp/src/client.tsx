import { createInertiaApp, type ResolvedComponent } from "@ts-76/inertia-hono-jsx";

const pages = import.meta.glob<ResolvedComponent>("./Pages/**/*.tsx", { eager: true });

void createInertiaApp({
  resolve: (name) => pages[`./Pages/${name}.tsx`],
});
