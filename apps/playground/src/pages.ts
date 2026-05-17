import type { ResolvedComponent } from "@ts-76/inertia-hono-jsx";

const pages = import.meta.glob<ResolvedComponent>("./Pages/**/*.tsx", { eager: true });

export const resolve = (name: string): ResolvedComponent => pages[`./Pages/${name}.tsx`];
