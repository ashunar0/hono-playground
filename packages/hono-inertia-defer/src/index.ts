import type { Context, MiddlewareHandler } from "hono";

const DEFER_MARKER = Symbol.for("@ashunar0/hono-inertia-defer/marker");

export interface DeferredProp<T = unknown> {
  [DEFER_MARKER]: true;
  group: string;
  resolve: () => T | Promise<T>;
}

/**
 * Marks a prop as lazy. The resolver function is NOT called on the initial
 * Inertia response; instead the prop name is advertised via
 * `page.deferredProps`, and the client's `<Deferred>` component triggers a
 * partial reload to fetch the value.
 *
 * @example
 * ```ts
 * c.render('Users/Index', {
 *   users,
 *   stats: defer(() => computeHeavyStats()),
 * })
 * ```
 *
 * @param resolver Function that computes the prop value
 * @param group Optional group name (defaults to `'default'`). Multiple
 *   deferred props in the same group are fetched in a single partial reload.
 */
export const defer = <T>(resolver: () => T | Promise<T>, group = "default"): DeferredProp<T> => ({
  [DEFER_MARKER]: true,
  group,
  resolve: resolver,
});

const isDeferred = (value: unknown): value is DeferredProp => {
  return typeof value === "object" && value !== null && DEFER_MARKER in value;
};

export interface PageObject {
  component: string;
  props: Record<string, unknown>;
  url: string;
  version: string | null;
  deferredProps?: Record<string, string[]>;
}

export type RootView = (page: PageObject, c: Context) => string | Promise<string>;

export interface InertiaWithDeferOptions {
  /**
   * Asset version. When an Inertia GET request's `X-Inertia-Version` header
   * does not match this value, the middleware short-circuits with `409` and
   * `X-Inertia-Location`.
   */
  version?: string | null;
  /**
   * Renders the initial HTML shell for non-Inertia (full page) requests.
   */
  rootView?: RootView;
}

const defaultRootView: RootView = (page) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><div id="app" data-page='${JSON.stringify(page).replace(/'/g, "&#39;")}'></div></body></html>`;

/**
 * Drop-in replacement for `inertia()` from `@hono/inertia`, adding:
 * - **Deferred props**: `defer(() => ...)` resolvers are skipped on the
 *   initial response and advertised via `page.deferredProps`.
 * - **Server-side partial reload**: respects `X-Inertia-Partial-Component`
 *   and `X-Inertia-Partial-Data` / `X-Inertia-Partial-Except` headers,
 *   computing only the requested deferred resolvers and stripping non-
 *   requested eager props.
 *
 * @example
 * ```ts
 * app.use(inertiaWithDefer({ version, rootView }))
 *   .get('/users', (c) => c.render('Users/Index', {
 *     users,
 *     stats: defer(() => computeStats()),
 *   }))
 * ```
 */
export const inertiaWithDefer = (options: InertiaWithDeferOptions = {}): MiddlewareHandler => {
  const version = options.version ?? null;
  const rootView = options.rootView ?? defaultRootView;

  return async (c, next) => {
    if (c.req.header("X-Inertia") && c.req.method === "GET") {
      if ((c.req.header("X-Inertia-Version") ?? "") !== (version ?? "")) {
        c.header("X-Inertia-Location", c.req.url);
        return c.body(null, 409);
      }
    }

    // biome-ignore lint: c.setRenderer type comes from @hono/inertia's module augmentation
    c.setRenderer((async (component: string, props: Record<string, unknown> = {}) => {
      const url = new URL(c.req.url);

      const partialComponent = c.req.header("X-Inertia-Partial-Component");
      const partialData = c.req.header("X-Inertia-Partial-Data");
      const partialExcept = c.req.header("X-Inertia-Partial-Except");
      const isPartial = partialComponent === component && Boolean(partialData || partialExcept);

      const onlyKeys =
        isPartial && partialData
          ? partialData
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : null;
      const exceptKeys =
        isPartial && partialExcept
          ? partialExcept
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : null;

      const deferredGroups: Record<string, string[]> = {};
      const resolvedProps: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(props)) {
        const isExcluded =
          (onlyKeys !== null && !onlyKeys.includes(key)) ||
          (exceptKeys !== null && exceptKeys.includes(key));

        if (isDeferred(value)) {
          if (!isPartial) {
            const group = value.group;
            deferredGroups[group] ??= [];
            deferredGroups[group].push(key);
            continue;
          }
          if (isExcluded) continue;
          resolvedProps[key] = await value.resolve();
          continue;
        }

        if (isPartial && isExcluded) continue;
        resolvedProps[key] = value;
      }

      const page: PageObject = {
        component,
        props: resolvedProps,
        url: url.pathname + url.search,
        version,
      };
      if (!isPartial && Object.keys(deferredGroups).length > 0) {
        page.deferredProps = deferredGroups;
      }

      c.header("Vary", "Accept, X-Inertia");
      if (c.req.header("X-Inertia")) {
        c.header("X-Inertia", "true");
        return c.json(page);
      }
      if (c.req.header("Accept")?.includes("application/json")) return c.json(resolvedProps);
      const rendered = await rootView(page, c);
      return c.html(rendered);
      // biome-ignore lint: type assertion needed
    }) as never);

    return next();
  };
};
