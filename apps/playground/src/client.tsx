import { createInertiaApp } from "@ts-76/inertia-hono-jsx";
import MainLayout from "./Layouts/MainLayout";
import { resolve } from "./pages";

console.log("🌱 client booted", new Date().toISOString());

void createInertiaApp({
  resolve,
  defaultLayout: () => MainLayout,
});
