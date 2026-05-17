/** @jsxImportSource hono/jsx */
import { inertiaWithDefer, type PageObject, type RootView } from "@ashunar0/hono-inertia-defer";
import { serializePage } from "@hono/inertia";
import { renderToString } from "hono/jsx/dom/server";
import { Link as ViteLink, Script, ViteClient } from "vite-ssr-components/hono";

const version = "v1";

const RootDocument = ({ page }: { page: PageObject }) => (
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Playground</title>
      <ViteClient />
      <ViteLink href="/src/style.css" rel="stylesheet" />
    </head>
    <body>
      <script
        data-page="app"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: serializePage(page) }}
      />
      <div id="app" />
      <Script src="/src/client.tsx" />
    </body>
  </html>
);

const rootView: RootView = (page) =>
  "<!doctype html>" + renderToString(<RootDocument page={page} />);

export const inertia = inertiaWithDefer({ version, rootView });
