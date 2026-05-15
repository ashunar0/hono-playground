import type { MiddlewareHandler } from "hono";

interface InertiaPageObject {
  component: string;
  props: Record<string, unknown>;
  url: string;
  version: string | null;
}

const PARTIAL_COMPONENT_HEADER = "X-Inertia-Partial-Component";
const PARTIAL_DATA_HEADER = "X-Inertia-Partial-Data";
const PARTIAL_EXCEPT_HEADER = "X-Inertia-Partial-Except";

/**
 * Filter middleware that adds server-side partial reload support to
 * `@hono/inertia`.
 *
 * Place this AFTER `inertia()`. It inspects the response on Inertia
 * requests, and when the partial reload headers are present and the
 * component matches, narrows `page.props` to only the requested keys
 * (or excludes the listed keys).
 *
 * @example
 * ```ts
 * app.use(inertia({ version, rootView }))
 * app.use(inertiaPartialFilter())
 * ```
 */
export const inertiaPartialFilter = (): MiddlewareHandler => {
  return async (c, next) => {
    await next();

    if (!c.req.header("X-Inertia")) return;
    if (c.req.method !== "GET") return;

    const partialComponent = c.req.header(PARTIAL_COMPONENT_HEADER);
    if (!partialComponent) return;

    const partialData = c.req.header(PARTIAL_DATA_HEADER);
    const partialExcept = c.req.header(PARTIAL_EXCEPT_HEADER);
    if (!partialData && !partialExcept) return;

    const res = c.res;
    if (!res.headers.get("content-type")?.includes("application/json")) return;

    let page: InertiaPageObject;
    try {
      page = (await res.clone().json()) as InertiaPageObject;
    } catch {
      return;
    }

    if (page.component !== partialComponent) return;

    const onlyKeys = partialData
      ? partialData
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null;
    const exceptKeys = partialExcept
      ? partialExcept
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null;

    const filteredProps = Object.fromEntries(
      Object.entries(page.props).filter(([key]) => {
        if (onlyKeys && !onlyKeys.includes(key)) return false;
        if (exceptKeys && exceptKeys.includes(key)) return false;
        return true;
      }),
    );

    const newBody = JSON.stringify({ ...page, props: filteredProps });
    const headers = new Headers(res.headers);
    headers.set("content-length", new TextEncoder().encode(newBody).byteLength.toString());

    c.res = new Response(newBody, {
      status: res.status,
      headers,
    });
  };
};
