declare module "@inertiajs/core" {
  interface InertiaConfig {
    sharedPageProps: {
      toast?: { type: "success" | "error" | "info"; message: string };
    };
  }
}

export {};
