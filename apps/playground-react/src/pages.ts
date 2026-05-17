import type { ResolvedComponent } from "@inertiajs/react";

const pages = import.meta.glob<ResolvedComponent>("./Pages/**/*.tsx", { eager: true });

export const resolve = (name: string): ResolvedComponent => pages[`./Pages/${name}.tsx`];
