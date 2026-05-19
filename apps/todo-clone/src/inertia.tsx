import { inertiaFlash, type PageObject, type RootView } from "@ashunar0/hono-inertia-flash";
import type { InertiaAppSSRResponse, Page } from "@inertiajs/core";
import { createInertiaApp } from "@ts-76/inertia-hono-jsx";
import { renderToString } from "hono/jsx/dom/server";
import { Link as ViteLink, Script, ViteClient } from "vite-ssr-components/hono";
import { resolve } from "./pages";

const version = "v1";

// @hono/inertia の PageObject は @inertiajs/core の Page の部分集合。
// errors/flash/rescuedProps/rememberedState は SSR 時点では参照されないが Page 型で必須。
const toInertiaPage = (page: PageObject): Page => ({
  ...page,
  props: { ...page.props, errors: {} },
  flash: {},
  rescuedProps: [],
  rememberedState: {},
});

async function ssrRender(page: PageObject): Promise<InertiaAppSSRResponse> {
  return await createInertiaApp({
    page: toInertiaPage(page),
    render: renderToString,
    resolve,
  });
}

const RootDocument = ({ body }: { body: string }) => (
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>App</title>
      <ViteClient />
      <ViteLink href="/src/style.css" rel="stylesheet" />
    </head>
    <body>
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <Script src="/src/client.tsx" />
    </body>
  </html>
);

const rootView: RootView = async (page) => {
  const { head, body } = await ssrRender(page);
  const html = renderToString(<RootDocument body={body} />);
  return "<!doctype html>" + html.replace("</head>", head.join("") + "</head>");
};

export const inertia = inertiaFlash({ version, rootView });
