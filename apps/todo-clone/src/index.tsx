import { Hono } from "hono";
import { tasksApp } from "./features/tasks";
import { inertia } from "./inertia";

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use(inertia)
  .route("/", tasksApp);

export default app;
