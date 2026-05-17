import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "packages/**/*": "vp check --fix",
    "apps/website/**/*": "vp check --fix",
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ["**/templates/**"],
  },
  fmt: {
    ignorePatterns: ["**/pages.gen.ts", "**/templates/**"],
  },
});
