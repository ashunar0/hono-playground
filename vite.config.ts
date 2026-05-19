import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "packages/**/*": "vp check --fix",
    "apps/website/**/*": "vp check --fix",
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ["**/templates/**"],
    rules: {
      "import/no-duplicates": "error",
      "no-debugger": "error",
      "no-console": "warn",
    },
    overrides: [
      {
        // CLI ツールは console.log で user-facing output を出すのが正規動作
        files: ["packages/create-hono-inertia/**"],
        rules: {
          "no-console": "off",
        },
      },
    ],
  },
  fmt: {
    ignorePatterns: ["**/pages.gen.ts", "**/templates/**"],
  },
});
