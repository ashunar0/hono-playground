import { inertiaFlash } from "@ashunar0/hono-inertia-flash";
import { inertiaPlus, type PageObject, type RootView } from "@ashunar0/hono-inertia-plus";
import type { InertiaAppSSRResponse, Page } from "@inertiajs/core";
import { createInertiaApp } from "@ts-76/inertia-hono-jsx";
import { renderToString } from "hono/jsx/dom/server";
import { Link as ViteLink, Script, ViteClient } from "vite-ssr-components/hono";
import { resolve } from "./pages";

const version = "v1";

// plus (サーバの吐くページ形) → core の Page (クライアントが食う形) の橋渡し。
// errors/flash/rescuedProps/rememberedState は SSR 時点では参照されないが Page 型で必須。
// scrollProps だけは plus の ScrollDescriptor が core の ScrollProp の部分集合 (reset 欠落)
// なので、その 1 フィールドのみ境界アサート。他は本物の Page 型でチェックさせる。
const toInertiaPage = (page: PageObject): Page => ({
  ...page,
  scrollProps: page.scrollProps as Page["scrollProps"],
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

// plus が render を握り (partial / defer / merge / shared data)、flash はその上に
// c.flash / c.back を足す薄い層。plus → flash の順で use すること。
export const inertia = inertiaPlus({ version, rootView });
export const flash = inertiaFlash();
