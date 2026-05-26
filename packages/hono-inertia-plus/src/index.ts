import type { Context, MiddlewareHandler } from "hono";

const DEFER_MARKER = Symbol.for("@ashunar0/hono-inertia-plus/defer");
const SCROLL_MARKER = Symbol.for("@ashunar0/hono-inertia-plus/scroll");
const ALWAYS_MARKER = Symbol.for("@ashunar0/hono-inertia-plus/always");
const MERGE_MARKER = Symbol.for("@ashunar0/hono-inertia-plus/merge");

type MergeStrategy = "append" | "prepend" | "deep";

declare module "hono" {
  interface Context {
    /**
     * Registers props merged into every subsequent `c.render(...)` within
     * this request — Inertia's official "shared data" (`Inertia::share`)
     * concept. Opinionated session helpers (e.g.
     * `@ashunar0/hono-inertia-flash`'s `c.flash` / `c.back`) build on top of it.
     */
    share(props: Record<string, unknown>): void;
    /**
     * Toggles Inertia v3 history encryption for this response. When `true`
     * (default), the client encrypts the page object with AES-256-GCM before
     * storing it in `window.history.state`, so back/forward navigation after
     * logout cannot reveal cached data. Pass `false` to explicitly opt out.
     *
     * The flag is omitted from the page object unless this is called, in which
     * case the client inherits the previous page's setting.
     *
     * Mirrors Laravel Inertia's `Inertia::encryptHistory()`.
     */
    encryptHistory(value?: boolean): void;
    /**
     * Sets `clearHistory: true` on this response so the client rotates its
     * sessionStorage encryption key/IV, making previously-encrypted history
     * entries unreadable. Use on logout or other sensitive state transitions.
     *
     * Mirrors Laravel Inertia's `Inertia::clearHistory()`.
     */
    clearHistory(): void;
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

export interface MergeProp<T = unknown> {
  [MERGE_MARKER]: true;
  strategy: MergeStrategy;
  data: T;
  matchOn: string[];
}

export interface MergeOptions {
  /**
   * Dot-path(s) used by the client to dedupe array items during merge
   * (e.g. `"id"` for `posts: merge([...], { matchOn: 'id' })` ⇒ `matchPropsOn: ['posts.id']`).
   */
  matchOn?: string | string[];
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

const isMerge = (value: unknown): value is MergeProp => {
  return typeof value === "object" && value !== null && MERGE_MARKER in value;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  !isDeferred(value) &&
  !isScroll(value) &&
  !isAlways(value) &&
  !isMerge(value);

// プレーンな object か array — どちらも子要素を path 構築しながら walk できる。
// `Object.entries(array)` は ['0', value] 形で回るので、object/array を 1 ループで扱える。
const isWalkable = (value: unknown): value is Record<string, unknown> | unknown[] =>
  Array.isArray(value) || isPlainObject(value);

// Inertia v3 dot-notation partial reload の bidirectional matching helper。
// 例: only:['stats.revenue'] のとき、key='stats' は ancestor (leadsToOnly) で通過、
// key='stats.revenue' は exact match (matchesOnly) で通過、key='user' は両方 false で除外。
const matchesOnly = (path: string, only: string[]): boolean =>
  only.some((p) => p === path || path.startsWith(`${p}.`));

const leadsToOnly = (path: string, only: string[]): boolean =>
  only.some((p) => p.startsWith(`${path}.`));

const matchesExcept = (path: string, except: string[]): boolean =>
  except.some((p) => p === path || path.startsWith(`${p}.`));

const shouldIncludePath = (
  path: string,
  only: string[] | null,
  except: string[] | null,
): boolean => {
  if (except !== null && matchesExcept(path, except)) return false;
  if (only === null) return true;
  return matchesOnly(path, only) || leadsToOnly(path, only);
};

const buildMerge =
  (strategy: MergeStrategy) =>
  <T>(data: T, options: MergeOptions = {}): T => {
    const matchOn = options.matchOn
      ? Array.isArray(options.matchOn)
        ? options.matchOn
        : [options.matchOn]
      : [];
    const marker: MergeProp<T> = {
      [MERGE_MARKER]: true,
      strategy,
      data,
      matchOn,
    };
    return marker as unknown as T;
  };

/**
 * Marks a prop for **shallow append merge** on partial reloads. The client
 * concatenates incoming array items to the cached array (or shallow-spreads
 * incoming object keys onto the cached object). Provide `matchOn` to dedupe
 * array items by a unique key.
 *
 * Mirrors Laravel Inertia's `Inertia::merge($value)`.
 *
 * @example
 * ```ts
 * c.render('Posts/Index', {
 *   posts: merge(await db.posts(page), { matchOn: 'id' }),
 * })
 * ```
 */
export const merge: <T>(data: T, options?: MergeOptions) => T = buildMerge("append");

/**
 * Marks a prop for **shallow prepend merge** on partial reloads. Same as
 * `merge()` but new array items are prepended instead of appended.
 *
 * Mirrors Laravel Inertia's `Inertia::merge($value)->prepend()`.
 */
export const prepend: <T>(data: T, options?: MergeOptions) => T = buildMerge("prepend");

/**
 * Marks a prop for **recursive deep merge** on partial reloads. The client
 * walks the incoming value object-by-object: arrays follow `matchOn` dedupe
 * rules (or concat), nested objects merge recursively, scalars replace.
 *
 * Use for wrapper-shaped paginated props like `{ data: [...], meta: {...} }`
 * where shallow merge would lose the inner `data` array.
 *
 * Mirrors Laravel Inertia's `Inertia::deepMerge($value)`.
 *
 * @example
 * ```ts
 * c.render('Posts/Index', {
 *   feed: deepMerge(
 *     { data: await db.posts(page), meta: { total, nextCursor } },
 *     { matchOn: 'data.id' },
 *   ),
 * })
 * ```
 */
export const deepMerge: <T>(data: T, options?: MergeOptions) => T = buildMerge("deep");

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
  deepMergeProps?: string[];
  matchPropsOn?: string[];
  encryptHistory?: boolean;
  clearHistory?: boolean;
}

export type RootView = (page: PageObject, c: Context) => string | Promise<string>;

export interface InertiaPlusOptions {
  version?: string | null;
  rootView?: RootView;
}

const defaultRootView: RootView = (page) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><div id="app" data-page='${JSON.stringify(page).replace(/'/g, "&#39;")}'></div></body></html>`;

/**
 * Resolution context shared across the recursive `resolveProps` walk.
 *
 * Holds the partial-reload state (`isPartial` / `onlyKeys` / `exceptKeys` /
 * `mergeIntent`) and the metadata accumulators that build up the page object's
 * `deferredProps` / `scrollProps` / `mergeProps` / `prependProps` /
 * `deepMergeProps` / `matchPropsOn` fields as nested marker positions are
 * visited.
 */
interface ResolveCtx {
  isPartial: boolean;
  onlyKeys: string[] | null;
  exceptKeys: string[] | null;
  mergeIntent: string | undefined;
  deferredGroups: Record<string, string[]>;
  scrollProps: Record<string, ScrollDescriptor>;
  mergeProps: string[];
  prependProps: string[];
  deepMergeProps: string[];
  matchPropsOn: string[];
}

/**
 * Recursively walks `input` (object or array) building dot-paths
 * (`stats.revenue`, `items.0.bar`), evaluating Inertia markers
 * (defer/always/merge/scroll) at any nesting depth and emitting their
 * metadata into `ctx` against the resolved path.
 *
 * Mirrors Laravel adapter's `PropsResolver::resolveProps`:
 * - `AlwaysProp` and `parentWasResolved=true` subtrees bypass partial filtering.
 * - `DeferredProp` on initial visits is skipped (closure not invoked) and
 *   advertised via `ctx.deferredGroups[group]` at its dot-path.
 * - Markers whose resolved value is walkable recurse with
 *   `parentWasResolved=true` so the user-constructed children bypass the
 *   request's `only`/`except` filter — they were already opted-in by the
 *   marker call itself.
 * - Arrays preserve their shape: `Object.entries` yields ['0', value] tuples
 *   so index becomes part of the path, and we push to `out` instead of
 *   assigning by key.
 */
const resolveProps = async <T extends Record<string, unknown> | unknown[]>(
  input: T,
  prefix: string,
  parentWasResolved: boolean,
  ctx: ResolveCtx,
): Promise<T> => {
  const isArr = Array.isArray(input);
  const out: Record<string, unknown> | unknown[] = isArr ? [] : {};
  const assign = (key: string, value: unknown) => {
    if (isArr) (out as unknown[]).push(value);
    else (out as Record<string, unknown>)[key] = value;
  };

  for (const [key, raw] of Object.entries(input)) {
    const path = prefix === "" ? key : `${prefix}.${key}`;

    // Partial filter. AlwaysProp and parentWasResolved subtrees bypass.
    if (ctx.isPartial && !isAlways(raw) && !parentWasResolved) {
      if (!shouldIncludePath(path, ctx.onlyKeys, ctx.exceptKeys)) continue;
    }

    // Defer on initial visit: emit metadata and skip resolution.
    if (isDeferred(raw)) {
      if (!ctx.isPartial) {
        const group = raw.group;
        ctx.deferredGroups[group] ??= [];
        ctx.deferredGroups[group].push(path);
        continue;
      }
      const value = await raw.resolve();
      assign(key, isWalkable(value) ? await resolveProps(value, path, true, ctx) : value);
      continue;
    }

    if (isAlways(raw)) {
      const value = await raw.resolve();
      assign(key, isWalkable(value) ? await resolveProps(value, path, true, ctx) : value);
      continue;
    }

    if (isScroll(raw)) {
      assign(key, raw.data);
      ctx.scrollProps[path] = {
        previousPage: raw.previousPage,
        nextPage: raw.nextPage,
        currentPage: raw.currentPage,
        pageName: raw.pageName,
      };
      if (ctx.isPartial && ctx.mergeIntent === "append") {
        ctx.mergeProps.push(path);
        if (raw.matchOn) ctx.matchPropsOn.push(`${path}.${raw.matchOn}`);
      } else if (ctx.isPartial && ctx.mergeIntent === "prepend") {
        ctx.prependProps.push(path);
        if (raw.matchOn) ctx.matchPropsOn.push(`${path}.${raw.matchOn}`);
      }
      continue;
    }

    if (isMerge(raw)) {
      assign(key, raw.data);
      if (raw.strategy === "append") ctx.mergeProps.push(path);
      else if (raw.strategy === "prepend") ctx.prependProps.push(path);
      else ctx.deepMergeProps.push(path);
      for (const p of raw.matchOn) ctx.matchPropsOn.push(`${path}.${p}`);
      continue;
    }

    if (isWalkable(raw)) {
      assign(key, await resolveProps(raw, path, parentWasResolved, ctx));
    } else {
      assign(key, raw);
    }
  }

  return out as T;
};

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

    let encryptHistoryFlag: boolean | undefined;
    let clearHistoryFlag = false;
    c.encryptHistory = (value = true) => {
      encryptHistoryFlag = value;
    };
    c.clearHistory = () => {
      clearHistoryFlag = true;
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

      const ctx: ResolveCtx = {
        isPartial,
        onlyKeys,
        exceptKeys,
        mergeIntent: c.req.header("X-Inertia-Infinite-Scroll-Merge-Intent"),
        deferredGroups: {},
        scrollProps: {},
        mergeProps: [],
        prependProps: [],
        deepMergeProps: [],
        matchPropsOn: [],
      };

      const resolvedProps = await resolveProps(incomingProps, "", false, ctx);

      const page: PageObject = {
        component,
        props: resolvedProps,
        url: url.pathname + url.search,
        version,
      };
      if (!isPartial && Object.keys(ctx.deferredGroups).length > 0) {
        page.deferredProps = ctx.deferredGroups;
      }
      if (Object.keys(ctx.scrollProps).length > 0) {
        page.scrollProps = ctx.scrollProps;
      }
      if (ctx.mergeProps.length > 0) {
        page.mergeProps = ctx.mergeProps;
      }
      if (ctx.prependProps.length > 0) {
        page.prependProps = ctx.prependProps;
      }
      if (ctx.deepMergeProps.length > 0) {
        page.deepMergeProps = ctx.deepMergeProps;
      }
      if (ctx.matchPropsOn.length > 0) {
        page.matchPropsOn = ctx.matchPropsOn;
      }
      // `encryptHistory` は client が前ページから継承する。undefined のときは
      // page object に出さず継承させ、`true`/`false` 明示時のみ送る (v3 流儀)。
      if (encryptHistoryFlag !== undefined) {
        page.encryptHistory = encryptHistoryFlag;
      }
      if (clearHistoryFlag) {
        page.clearHistory = true;
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
