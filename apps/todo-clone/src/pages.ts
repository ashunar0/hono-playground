import { resolvePageComponent } from "@ashunar0/hono-inertia-pages";
import type { ResolvedComponent } from "@ts-76/inertia-hono-jsx";

const pages = import.meta.glob<{ default: ResolvedComponent }>("./Pages/**/*.tsx");

export const resolve = (name: string) =>
  resolvePageComponent<ResolvedComponent>(`./Pages/${name}.tsx`, pages);
