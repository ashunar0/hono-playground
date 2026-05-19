import { Hono } from "hono";
import { authApp } from "./features/auth";
import { tasksApp } from "./features/tasks";
import { inertia } from "./inertia";
import { authMiddleware, type AuthVariables } from "./middleware/auth";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>()
  .use(authMiddleware)
  .use(inertia)
  .route("/", authApp)
  .route("/", tasksApp);

export default app;
