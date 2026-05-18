import type { Context, MiddlewareHandler } from "hono";
import { getCookie, setCookie } from "hono/cookie";

const COOKIE_NAME = "__inertia_flash";

export interface PageObject {
  component: string;
  props: Record<string, unknown>;
  url: string;
  version: string | null;
}

export type RootView = (page: PageObject, c: Context) => string | Promise<string>;

export interface InertiaFlashOptions {
  /**
   * Asset version. Mirrors @hono/inertia's behavior: when an `X-Inertia` GET
   * request's `X-Inertia-Version` does not match, returns a 409 with
   * `X-Inertia-Location` so the client triggers a full reload.
   */
  version?: string | null;
  /**
   * Renders the initial HTML document for non-Inertia (full page) requests.
   * Defaults to a minimal shell that embeds the page object into
   * `<script data-page="app" type="application/json">`.
   */
  rootView?: RootView;
  /**
   * Cookie name used to persist flashed values across the redirect.
   * @default "__inertia_flash"
   */
  cookieName?: string;
  /**
   * Max-age in seconds for the flash cookie. Short by design — flashed data
   * is meant to be consumed by the very next request.
   * @default 60
   */
  flashMaxAge?: number;
  /**
   * Mark the flash cookie as `Secure`. Auto-detected from the request URL
   * scheme by default (`true` for `https`, `false` for `http`).
   */
  secureCookie?: boolean;
}

declare module "hono" {
  interface Context {
    /**
     * Registers props to be merged into every subsequent `c.render(...)`
     * within this request. Inertia equivalent of Laravel's `Inertia::share()`.
     */
    share(props: Record<string, unknown>): void;
    /**
     * Stores a value to be flashed to the next request via cookie. The
     * following request will see it injected as a shared prop and emitted
     * on every page object — Laravel's `redirect()->with(...)` analogue.
     */
    flash(key: string, value: unknown): void;
    /**
     * 303 redirect to the `Referer` request header (falls back to `fallback`
     * if the header is absent or malformed). Designed to pair with `c.flash`
     * for "redirect back with errors" validation flows.
     */
    back(fallback?: string): Response;
  }
}

const serializePage = (page: PageObject) => JSON.stringify(page).replace(/\//g, "\\/");

const defaultRootView: RootView = (page) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script data-page="app" type="application/json">${serializePage(page)}</script>
    <div id="app"></div>
  </body>
</html>`;

const refererPath = (c: Context, fallback: string): string => {
  const ref = c.req.header("Referer");
  if (!ref) return fallback;
  try {
    const u = new URL(ref);
    return u.pathname + u.search;
  } catch {
    return fallback;
  }
};

/**
 * Drop-in replacement for `@hono/inertia`'s `inertia()` that adds
 * Laravel/Rails-style shared data, flash session, and `redirect back`.
 *
 * @example
 * ```ts
 * import { Hono } from 'hono'
 * import { inertiaFlash } from '@ashunar0/hono-inertia-flash'
 *
 * const app = new Hono()
 *   .use(inertiaFlash())
 *
 * app.use(async (c, next) => {
 *   c.share({ auth: { user: c.get('user') } })
 *   await next()
 * })
 *
 * app.post('/tasks', validator('json', schema, (result, c) => {
 *   if (!result.success) {
 *     c.flash('errors', toErrors(result.error))
 *     return c.back()
 *   }
 * }), handler)
 * ```
 */
export const inertiaFlash = (options: InertiaFlashOptions = {}): MiddlewareHandler => {
  const version = options.version ?? null;
  const rootView = options.rootView ?? defaultRootView;
  const cookieName = options.cookieName ?? COOKIE_NAME;
  const flashMaxAge = options.flashMaxAge ?? 60;

  return async (c, next) => {
    if (c.req.header("X-Inertia") && c.req.method === "GET") {
      if ((c.req.header("X-Inertia-Version") ?? "") !== (version ?? "")) {
        c.header("X-Inertia-Location", c.req.url);
        return c.body(null, 409);
      }
    }

    const raw = getCookie(c, cookieName);
    const flashIn: Record<string, unknown> = (() => {
      if (!raw) return {};
      try {
        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed !== null ? parsed : {};
      } catch {
        return {};
      }
    })();
    if (raw) {
      setCookie(c, cookieName, "", { maxAge: 0, path: "/" });
    }

    const shared: Record<string, unknown> = { ...flashIn };
    const flashOut: Record<string, unknown> = {};

    c.share = (props) => {
      Object.assign(shared, props);
    };
    c.flash = (key, value) => {
      flashOut[key] = value;
    };
    c.back = (fallback = "/") => c.redirect(refererPath(c, fallback), 303);

    // biome-ignore lint: c.setRenderer type comes from @hono/inertia's module augmentation
    c.setRenderer(((component: string, props: Record<string, unknown> = {}) => {
      const url = new URL(c.req.url);
      const mergedProps = { ...shared, ...props };
      const page: PageObject = {
        component,
        props: mergedProps,
        url: url.pathname + url.search,
        version,
      };
      c.header("Vary", "Accept, X-Inertia");
      if (c.req.header("X-Inertia")) {
        c.header("X-Inertia", "true");
        return c.json(page);
      }
      if (c.req.header("Accept")?.includes("application/json")) return c.json(mergedProps);
      const rendered = rootView(page, c);
      if (rendered instanceof Promise) return rendered.then((html) => c.html(html));
      return c.html(rendered);
      // biome-ignore lint: type assertion needed
    }) as never);

    await next();

    if (Object.keys(flashOut).length > 0) {
      const secure = options.secureCookie ?? new URL(c.req.url).protocol === "https:";
      setCookie(c, cookieName, JSON.stringify(flashOut), {
        maxAge: flashMaxAge,
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
        secure,
      });
    }
  };
};

export { serializePage };
