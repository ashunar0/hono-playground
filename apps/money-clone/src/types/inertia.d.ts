declare module "@inertiajs/core" {
  interface InertiaConfig {
    sharedPageProps: {
      toast?: { type: "success" | "error" | "info"; message: string };
      // shareUser middleware が全リクエストで注入する。未ログインは null。
      user?: { id: string; name: string } | null;
    };
  }
}

export {};
