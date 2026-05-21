import type { Context, MiddlewareHandler } from "hono";

const DEFER_MARKER = Symbol.for("@ashunar0/hono-inertia-plus/defer");
const SCROLL_MARKER = Symbol.for("@ashunar0/hono-inertia-plus/scroll");
const ALWAYS_MARKER = Symbol.for("@ashunar0/hono-inertia-plus/always");

declare module "hono" {
  interface Context {
    /**
     * Registers props merged into every subsequent `c.render(...)` within
     * this request — Inertia's official "shared data" (`Inertia::share`)
     * concept. Opinionated session helpers (e.g.
     * `@ashunar0/hono-inertia-flash`'s `c.flash` / `c.back`) build on top of it.
     */
    share(props: Record<string, unknown>): void;
  }
}

export interface DeferredProp<T = unknown> {
  [DEFER_MARKER]: true;
  group: string;
  resolve: () => T | Promise<T>;
}

export interface ScrollProp<T = unknown> {
  [SCROLL_MARKER]: true;
  data: T[];
  previousPage: number | null;
  nextPage: number | null;
  currentPage: number;
  pageName: string;
  matchOn?: string;
}

export interface ScrollDescriptor {
  previousPage: number | null;
  nextPage: number | null;
  currentPage: number;
  pageName: string;
}

export interface AlwaysProp<T = unknown> {
  [ALWAYS_MARKER]: true;
  resolve: () => T | Promise<T>;
}

const isDeferred = (value: unknown): value is DeferredProp => {
  return typeof value === "object" && value !== null && DEFER_MARKER in value;
};

const isScroll = (value: unknown): value is ScrollProp => {
  return typeof value === "object" && value !== null && SCROLL_MARKER in value;
};

const isAlways = (value: unknown): value is AlwaysProp => {
  return typeof value === "object" && value !== null && ALWAYS_MARKER in value;
};

/**
 * Marks a prop as a paginated scroll source. The page object emitted to the
 * client will contain `props[name] = data` and `scrollProps[name] = { previousPage, nextPage, currentPage, pageName }`,
 * which Inertia's `<InfiniteScroll data="name">` reads to drive `Fetch previous`
 * / `Fetch next` partial reloads.
 *
 * The `pageName` is the query-string parameter used for pagination requests
 * (e.g. `pageName: 'users_page'` ⇒ partial reload appends `?users_page=2`).
 *
 * @example
 * ```ts
 * c.render('Users/Index', {
 *   users: scroll({
 *     data: getUsersPage(currentPage),
 *     currentPage,
 *     lastPage: 6,
 *     pageName: 'users_page',
 *   }),
 * })
 * ```
 */
export const scroll = <T>(args: {
  data: T[];
  currentPage: number;
  lastPage: number;
  pageName: string;
  /**
   * Field name used by Inertia core to dedupe items when merging incoming pages
   * with the cached array. Defaults to `'id'`. Set to `null` to skip dedupe.
   */
  matchOn?: string | null;
}): T[] => {
  const marker: ScrollProp<T> = {
    [SCROLL_MARKER]: true,
    data: args.data,
    previousPage: args.currentPage > 1 ? args.currentPage - 1 : null,
    nextPage: args.currentPage < args.lastPage ? args.currentPage + 1 : null,
    currentPage: args.currentPage,
    pageName: args.pageName,
    matchOn: args.matchOn === null ? undefined : (args.matchOn ?? "id"),
  };
  return marker as unknown as T[];
};

/**
 * Marks a prop as lazy. The resolver function is NOT called on the initial
 * Inertia response; instead the prop name is advertised via
 * `page.deferredProps`, and the client's `<Deferred>` component triggers a
 * partial reload to fetch the value.
 */
export const defer = <T>(resolver: () => T | Promise<T>, group = "default"): T | undefined => {
  const marker: DeferredProp<T> = {
    [DEFER_MARKER]: true,
    group,
    resolve: resolver,
  };
  return marker as unknown as T | undefined;
};

/**
 * Marks a prop as **always returned**, even on partial reloads where the prop
 * is excluded by `only` / `except`. The resolver runs on every render and the
 * returned value is sent to the client, which overwrites its cached value.
 *
 * Use for props that must reflect their current source on every navigation —
 * notably one-shot session data like flashed messages, errors, CSRF tokens, or
 * authenticated user info. Without this marker, partial reloads omit the prop
 * and the client keeps its previous value, so a flashed toast would re-fire
 * on every subsequent partial reload.
 *
 * Mirrors Laravel Inertia's `Inertia::always()`.
 *
 * @example
 * ```ts
 * c.share({
 *   flash: always(() => readFlashFromCookie(c)),
 * })
 * ```
 */
export const always = <T>(resolver: () => T | Promise<T>): T => {
  const marker: AlwaysProp<T> = {
    [ALWAYS_MARKER]: true,
    resolve: resolver,
  };
  return marker as unknown as T;
};

export interface PageObject {
  component: string;
  props: Record<string, unknown>;
  url: string;
  version: string | null;
  deferredProps?: Record<string, string[]>;
  scrollProps?: Record<string, ScrollDescriptor>;
  mergeProps?: string[];
  prependProps?: string[];
  matchPropsOn?: string[];
}

export type RootView = (page: PageObject, c: Context) => string | Promise<string>;

export interface InertiaPlusOptions {
  version?: string | null;
  rootView?: RootView;
}

const defaultRootView: RootView = (page) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><div id="app" data-page='${JSON.stringify(page).replace(/'/g, "&#39;")}'></div></body></html>`;

/**
 * Middleware that augments `@hono/inertia` with:
 * - **Deferred props**: `defer(() => ...)` resolvers are skipped on the
 *   initial response and advertised via `page.deferredProps`.
 * - **Scroll props**: `scroll({ data, currentPage, lastPage, pageName })`
 *   marks a paginated prop and emits `page.scrollProps[name]` describing the
 *   previous/next page cursor for Inertia's `<InfiniteScroll>` adapter.
 * - **Server-side partial reload**: respects `X-Inertia-Partial-Component`
 *   and `X-Inertia-Partial-Data` / `X-Inertia-Partial-Except` headers,
 *   computing only the requested deferred resolvers and stripping non-
 *   requested eager props.
 * - **Shared data** (`c.share`): props merged into every render this request.
 */
export const inertiaPlus = (options: InertiaPlusOptions = {}): MiddlewareHandler => {
  const version = options.version ?? null;
  const rootView = options.rootView ?? defaultRootView;

  return async (c, next) => {
    if (c.req.header("X-Inertia") && c.req.method === "GET") {
      if ((c.req.header("X-Inertia-Version") ?? "") !== (version ?? "")) {
        c.header("X-Inertia-Location", c.req.url);
        return c.body(null, 409);
      }
    }

    const shared: Record<string, unknown> = {};
    c.share = (props) => {
      Object.assign(shared, props);
    };

    // biome-ignore lint: c.setRenderer type comes from @hono/inertia's module augmentation
    c.setRenderer((async (component: string, props: Record<string, unknown> = {}) => {
      const url = new URL(c.req.url);
      const incomingProps = { ...shared, ...props };

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

      const mergeIntent = c.req.header("X-Inertia-Infinite-Scroll-Merge-Intent");
      const deferredGroups: Record<string, string[]> = {};
      const scrollProps: Record<string, ScrollDescriptor> = {};
      const mergeProps: string[] = [];
      const prependProps: string[] = [];
      const matchPropsOn: string[] = [];
      const resolvedProps: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(incomingProps)) {
        // `always(fn)` は partial reload の only/except を無視して毎回評価・返却される。
        // flash / CSRF token / auth user など「partial reload でも常に上書きしたい」 props 向け。
        if (isAlways(value)) {
          resolvedProps[key] = await value.resolve();
          continue;
        }

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

        if (isScroll(value)) {
          if (isPartial && isExcluded) continue;
          resolvedProps[key] = value.data;
          scrollProps[key] = {
            previousPage: value.previousPage,
            nextPage: value.nextPage,
            currentPage: value.currentPage,
            pageName: value.pageName,
          };
          if (isPartial && mergeIntent === "append") {
            mergeProps.push(key);
            if (value.matchOn) matchPropsOn.push(`${key}.${value.matchOn}`);
          } else if (isPartial && mergeIntent === "prepend") {
            prependProps.push(key);
            if (value.matchOn) matchPropsOn.push(`${key}.${value.matchOn}`);
          }
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
      if (Object.keys(scrollProps).length > 0) {
        page.scrollProps = scrollProps;
      }
      if (mergeProps.length > 0) {
        page.mergeProps = mergeProps;
      }
      if (prependProps.length > 0) {
        page.prependProps = prependProps;
      }
      if (matchPropsOn.length > 0) {
        page.matchPropsOn = matchPropsOn;
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
