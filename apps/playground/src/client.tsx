import { createInertiaApp } from "@ts-76/inertia-hono-jsx";
import MainLayout from "./Layouts/MainLayout";
import { resolve } from "./pages";

void createInertiaApp({
  resolve,
  defaultLayout: () => MainLayout,
});
