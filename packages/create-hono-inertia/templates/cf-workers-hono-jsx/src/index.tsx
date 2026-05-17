import { Hono } from "hono";
import { inertia } from "./inertia";

const app = new Hono()
  .use(inertia)
  .get("/", (c) => c.render("Home", { message: "Hello from Hono Inertia!" }));

export default app;
