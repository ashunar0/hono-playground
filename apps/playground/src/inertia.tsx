/** @jsxImportSource hono/jsx */
import { inertiaWithDefer, type RootView } from "@ashunar0/hono-inertia-defer";
import { serializePage } from "@hono/inertia";
import { renderToString } from "hono/jsx/dom/server";
import { Link as ViteLink, Script, ViteClient } from "vite-ssr-components/hono";

const version = "v1";

const rootView: RootView = (page) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Playground</title>
    ${renderToString(<ViteClient />)}
    ${renderToString(<ViteLink href="/src/style.css" rel="stylesheet" />)}
  </head>
  <body>
    <script data-page="app" type="application/json">${serializePage(page)}</script>
    <div id="app"></div>
    ${renderToString(<Script src="/src/client.tsx" />)}
  </body>
</html>`;

export const inertia = inertiaWithDefer({ version, rootView });
