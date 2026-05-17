import {
  defer,
  inertiaWithDefer,
  type PageObject,
  type RootView,
} from "@ashunar0/hono-inertia-defer";
import { createInertiaApp } from "@inertiajs/react";
import type { InertiaAppSSRResponse, Page } from "@inertiajs/core";
import { Hono } from "hono";
import ReactDOMServer from "react-dom/server";
import { Link as ViteLink, ReactRefresh, Script, ViteClient } from "vite-ssr-components/react";
import { resolve } from "./pages";

const version = "v1";

const users = [
  { id: 1, name: "Taka", role: "Designer" },
  { id: 2, name: "Mika", role: "Engineer" },
  { id: 3, name: "Ren", role: "Product" },
];

type UserFormErrors = { name?: string; role?: string };
const noUserFormErrors: UserFormErrors = {};

const RootDocument = ({ body }: { body: string }) => (
  <html lang="ja">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Playground (React)</title>
      <ViteClient />
      <ReactRefresh />
      <ViteLink href="/src/style.css" rel="stylesheet" />
    </head>
    <body>
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <Script src="/src/client.tsx" />
    </body>
  </html>
);

const rootView: RootView = async (page: PageObject) => {
  const { head, body } = (await createInertiaApp({
    page: page as unknown as Page,
    render: ReactDOMServer.renderToString,
    resolve,
    setup: ({ App, props }) => <App {...props} />,
    // eslint-disable-next-line
  } as never)) as unknown as InertiaAppSSRResponse;
  const html = ReactDOMServer.renderToString(<RootDocument body={body} />);
  return "<!doctype html>" + html.replace("</head>", head.join("") + "</head>");
};

const app = new Hono()
  .use(inertiaWithDefer({ version, rootView }))
  .get("/", (c) => c.render("Home", { greeting: "Hello from Hono Inertia (React)" }))
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
