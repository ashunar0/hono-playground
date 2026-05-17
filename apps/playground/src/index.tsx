import { Hono } from "hono";
import { inertia } from "./inertia";
import usersRoutes from "./routes/users";

const app = new Hono()
  .use(inertia)
  .get("/", (c) => c.render("Home", { greeting: "Hello from Hono Inertia" }))
  .route("/", usersRoutes);

export default app;
