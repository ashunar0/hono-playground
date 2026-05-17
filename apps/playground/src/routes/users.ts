import { defer } from "@ashunar0/hono-inertia-defer";
import { Hono } from "hono";

const users = [
  { id: 1, name: "Taka", role: "Designer" },
  { id: 2, name: "Mika", role: "Engineer" },
  { id: 3, name: "Ren", role: "Product" },
];

type UserFormErrors = { name?: string; role?: string };
const noUserFormErrors: UserFormErrors = {};

const app = new Hono()
  .get("/users", (c) =>
    c.render("Users/Index", {
      users,
      serverTime: new Date().toISOString(),
      stats: defer(async () => {
        await new Promise((r) => setTimeout(r, 2500));
        return {
          total: users.length,
          computedAt: new Date().toISOString(),
        };
      }),
    }),
  )
  .get("/users/new", (c) => c.render("Users/New", { errors: noUserFormErrors }))
  .post("/users", async (c) => {
    const body = await c.req.json<{ name?: string; role?: string }>();
    const name = (body.name ?? "").trim();
    const role = (body.role ?? "").trim();

    const errors: UserFormErrors = {};
    if (!name) errors.name = "Name is required";
    if (!role) errors.role = "Role is required";

    if (errors.name || errors.role) {
      return c.render("Users/New", { errors });
    }

    const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    users.push({ id, name, role });
    return c.redirect("/users");
  })
  .get("/users/:id", (c) => {
    const user = users.find((u) => u.id === Number(c.req.param("id")));
    if (!user) return c.notFound();
    return c.render("Users/Show", { user });
  });

export default app;
