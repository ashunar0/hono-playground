/**
 * Resolves an Inertia page component from a glob-style page map.
 *
 * Designed as a Hono-side counterpart to Laravel's `resolvePageComponent`
 * helper (`laravel-vite-plugin/inertia-helpers`). It handles the four shapes
 * that `import.meta.glob` can return:
 *
 *   - lazy   default-export module: `() => Promise<{ default: T }>`
 *   - lazy   namespace module:      `() => Promise<T>`
 *   - eager  default-export module: `{ default: T }`
 *   - eager  namespace module:      `T`
 *
 * A single string or an array of candidate paths can be supplied. The first
 * match wins; misses throw to surface scaffolding errors loudly.
 */
type ModuleShape<T> = T | { default: T };
type LazyLoader<T> = () => Promise<ModuleShape<T>>;
export type PageEntry<T> = ModuleShape<T> | LazyLoader<T>;
export type PageMap<T> = Record<string, PageEntry<T>>;

export async function resolvePageComponent<T>(
  path: string | string[],
  pages: PageMap<T>,
): Promise<T> {
  const candidates = Array.isArray(path) ? path : [path];
  for (const candidate of candidates) {
    const entry = pages[candidate];
    if (entry === undefined) continue;
    // import.meta.glob() returns plain modules for eager and `() => Promise<Module>` for lazy.
    // A bare function entry is therefore always the lazy loader, never the page itself.
    const resolved =
      typeof entry === "function" ? await (entry as LazyLoader<T>)() : (entry as ModuleShape<T>);
    return unwrapDefault(resolved);
  }
  throw new Error(
    `Inertia page not found. Tried: ${candidates.join(", ")}. ` +
      `Available: ${Object.keys(pages).join(", ") || "(empty)"}`,
  );
}

function unwrapDefault<T>(mod: ModuleShape<T>): T {
  if (mod && typeof mod === "object" && "default" in mod) {
    return (mod as { default: T }).default;
  }
  return mod as T;
}
