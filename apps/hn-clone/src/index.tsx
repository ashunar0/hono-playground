import { Hono } from "hono";
import { authApp } from "./features/auth";
import { storiesApp } from "./features/stories";
import { flash, inertia } from "./inertia";
import { authMiddleware, type AuthVariables } from "./middleware/auth";
import { shareUser } from "./middleware/share-user";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>()
  .use(authMiddleware)
  .use(inertia)
  .use(flash)
  // shareUser は c.share (plus) に依存するので inertia の後。
  .use(shareUser)
  .route("/", authApp)
  .route("/", storiesApp);

export default app;
