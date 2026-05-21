// @ashunar0/hono-inertia-flash の InertiaFlashStore を declare module で拡張して、
// c.flash(key, value) の (key, value) ペアを型レベルで縛る。
// 同じ key/value の形を client 側 sharedPageProps (types/inertia.d.ts) と一致させる。
declare module "@ashunar0/hono-inertia-flash" {
  interface InertiaFlashStore {
    toast: { type: "success" | "error" | "info"; message: string } | null;
    errors: Record<string, string>;
  }
}

export {};
