import { Hono } from "hono";
import { authApp } from "./features/auth";
import { tasksApp } from "./features/tasks";
import { flash, inertia } from "./inertia";
import { authMiddleware, type AuthVariables } from "./middleware/auth";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>()
  .use(authMiddleware)
  .use(inertia)
  .use(flash)
  .route("/", authApp)
  .route("/", tasksApp);

export default app;
