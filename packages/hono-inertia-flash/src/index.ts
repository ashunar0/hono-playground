import { always } from "@ashunar0/hono-inertia-plus";
import type { Context, MiddlewareHandler } from "hono";
import { getCookie, setCookie } from "hono/cookie";

const COOKIE_NAME = "__inertia_flash";
const DEFAULT_KEYS = ["toast", "errors"] as const;

export interface InertiaFlashOptions {
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
  /**
   * Flash keys to always advertise as shared props. Each listed key is wrapped
   * with plus's `always(fn)` so that on partial reloads the server overwrites
   * the client's previously cached value (with `null` after the cookie is
   * consumed), preventing a flashed toast from re-firing on every subsequent
   * partial reload.
   *
   * If you flash custom keys beyond the defaults, list them here.
   *
   * @default ["toast", "errors"]
   */
  keys?: readonly string[];
}

/**
 * Extension point — declare your flash keys and their value types here, à la
 * Hono's `ContextVariableMap`. Each `c.flash(key, value)` call narrows to the
 * declared pair. Leave empty to keep the loose `(string, unknown)` fallback.
 *
 * @example
 * ```ts
 * declare module "@ashunar0/hono-inertia-flash" {
 *   interface InertiaFlashStore {
 *     toast: { type: "success" | "error"; message: string } | null;
 *     errors: Record<string, string>;
 *   }
 * }
 * ```
 */
// biome-ignore lint/suspicious/noEmptyInterface: extension point for module augmentation
export interface InertiaFlashStore {}

declare module "hono" {
  interface Context {
    /**
     * Provided at runtime by `@ashunar0/hono-inertia-plus`'s `inertiaPlus()`.
     * Re-declared here so this package type-checks in isolation; the signature
     * is identical and merges with plus's declaration when used together.
     */
    share(props: Record<string, unknown>): void;
    /**
     * Stores a value to be flashed to the next request via cookie. The
     * following request sees it injected as shared data (`c.share`) and emitted
     * on every page object — Laravel's `redirect()->with(...)` analogue.
     *
     * Augment `InertiaFlashStore` to narrow the (key, value) pair. Keys not in
     * the store fall back to `unknown` so untyped flashes still compile.
     */
    flash<K extends string>(
      key: K,
      value: K extends keyof InertiaFlashStore ? InertiaFlashStore[K] : unknown,
    ): void;
    /**
     * 303 redirect to the `Referer` request header (falls back to `fallback`
     * if the header is absent or malformed). Pairs with `c.flash` for
     * "redirect back with errors" validation flows.
     */
    back(fallback?: string): Response;
  }
}

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
 * Laravel/Rails-style flash session + redirect-back, layered on top of
 * `@ashunar0/hono-inertia-plus`. This middleware owns no renderer; it relies
 * on plus for `c.share` and rendering, and only adds the opinionated session
 * helpers `c.flash` and `c.back`.
 *
 * Register it AFTER `inertiaPlus()` so `c.share` exists.
 *
 * @example
 * ```ts
 * import { Hono } from 'hono'
 * import { inertiaPlus } from '@ashunar0/hono-inertia-plus'
 * import { inertiaFlash } from '@ashunar0/hono-inertia-flash'
 *
 * const app = new Hono()
 *   .use(inertiaPlus({ version, rootView }))
 *   .use(inertiaFlash())
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
  const cookieName = options.cookieName ?? COOKIE_NAME;
  const flashMaxAge = options.flashMaxAge ?? 60;
  const knownKeys = options.keys ?? DEFAULT_KEYS;

  return async (c, next) => {
    if (typeof c.share !== "function") {
      throw new Error(
        "inertiaFlash() requires inertiaPlus() to be registered first (it provides c.share).",
      );
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

    // 既知 key を `always(fn)` で share する。partial reload で `only`/`except` に
    // 含まれなくても client に返却されるため、cookie 消費後は `null` で前回値を
    // 上書きでき、トーストが再発火しない。Laravel Inertia の
    // `Inertia::always(fn () => session()->get('flash'))` 流儀。
    const sharedFlash: Record<string, unknown> = {};
    for (const key of knownKeys) {
      sharedFlash[key] = always(() => flashIn[key] ?? null);
    }
    c.share(sharedFlash);

    const flashOut: Record<string, unknown> = {};
    // overload された signature の実装側は loose 型 (key: string, value: unknown) で受ける。
    c.flash = ((key: string, value: unknown) => {
      flashOut[key] = value;
    }) as Context["flash"];
    c.back = (fallback = "/") => c.redirect(refererPath(c, fallback), 303);

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
