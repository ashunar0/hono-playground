declare module "@inertiajs/core" {
  interface InertiaConfig {
    sharedPageProps: {
      // flash パッケージが always(fn) で share する。consumed 後は null。
      toast?: { type: "success" | "error" | "info"; message: string } | null;
      // shareUser middleware が全リクエストで注入する。未ログインは null。
      user?: { id: string; name: string } | null;
    };
  }
}

export {};
