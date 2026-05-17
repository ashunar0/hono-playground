import { createInertiaApp, type ResolvedComponent } from "@ts-76/inertia-hono-jsx";
import MainLayout from "./Layouts/MainLayout";

console.log("🌱 client booted", new Date().toISOString());

void createInertiaApp({
  resolve: (name: string) => {
    const pages = import.meta.glob<ResolvedComponent>("./Pages/**/*.tsx", { eager: true });
    return pages[`./Pages/${name}.tsx`];
  },
  defaultLayout: () => MainLayout,
});
