import {
  inertiaWithDeferAndScroll,
  type PageObject,
  type RootView,
} from "@ashunar0/hono-inertia-scroll";
import type { InertiaAppSSRResponse, Page } from "@inertiajs/core";
import { createInertiaApp } from "@ts-76/inertia-hono-jsx";
import { renderToString } from "hono/jsx/dom/server";
import { Link as ViteLink, Script, ViteClient } from "vite-ssr-components/hono";
import MainLayout from "./Layouts/MainLayout";
import { resolve } from "./pages";

const version = "v1";

const RootDocument = ({ body }: { body: string }) => (
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Playground</title>
      <ViteClient />
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
    render: renderToString,
    resolve,
    defaultLayout: () => MainLayout,
  })) as unknown as InertiaAppSSRResponse;
  const html = renderToString(<RootDocument body={body} />);
  return "<!doctype html>" + html.replace("</head>", head.join("") + "</head>");
};

export const inertia = inertiaWithDeferAndScroll({ version, rootView });
