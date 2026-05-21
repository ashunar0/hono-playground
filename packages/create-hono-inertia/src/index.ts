#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cancel, confirm, intro, isCancel, outro, spinner, text } from "@clack/prompts";
import pc from "picocolors";

type PM = "npm" | "pnpm" | "yarn" | "bun";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateDir = resolve(__dirname, "../templates/cf-workers-hono-jsx");
const patchesDir = resolve(__dirname, "../templates/_patches");

function detectPM(): PM {
  const ua = process.env.npm_config_user_agent ?? "";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("yarn")) return "yarn";
  if (ua.startsWith("bun")) return "bun";
  return "npm";
}

function validateProjectName(name: string): string | undefined {
  if (!name) return "Project name is required.";
  if (name.length > 214) return "Project name must be 214 characters or fewer.";
  if (/[A-Z]/.test(name)) return "Project name must be lowercase.";
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name)) {
    return "Use letters, numbers, '.', '_' or '-' (must start with a letter or number).";
  }
  if (existsSync(resolve(process.cwd(), name))) {
    return `Directory '${name}' already exists.`;
  }
  return undefined;
}

function runOrCancel<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  return value;
}

function parseArgs(argv: string[]) {
  const flags = new Set(argv.filter((a) => a.startsWith("-")));
  const positional = argv.filter((a) => !a.startsWith("-"));
  return {
    name: positional[0],
    yes: flags.has("--yes") || flags.has("-y"),
    skipInstall: flags.has("--skip-install"),
    skipGit: flags.has("--skip-git"),
    skipTailwind: flags.has("--skip-tailwind"),
    skipAlias: flags.has("--skip-alias"),
  };
}

function buildViteConfig(opts: { tailwind: boolean; alias: boolean }): string {
  const imports = [
    opts.alias ? `import path from "node:path";` : null,
    `import { cloudflare } from "@cloudflare/vite-plugin";`,
    `import { inertiaPages } from "@hono/inertia/vite";`,
    opts.tailwind ? `import tailwindcss from "@tailwindcss/vite";` : null,
    `import { defineConfig } from "vite";`,
    `import ssrPlugin from "vite-ssr-components/plugin";`,
  ].filter(Boolean);

  const aliasBlock = opts.alias
    ? `  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
`
    : "";

  const plugins = [
    `    cloudflare(),`,
    opts.tailwind ? `    tailwindcss(),` : null,
    `    inertiaPages({
      pagesDir: "src/Pages",
      outFile: "src/pages.gen.ts",
      serverModule: "./index",
    }),`,
    `    ssrPlugin(),`,
  ].filter(Boolean);

  return `${imports.join("\n")}

export default defineConfig({
${aliasBlock}  esbuild: {
    jsxImportSource: "hono/jsx",
  },
  plugins: [
${plugins.join("\n")}
  ],
});
`;
}

type JsonObject = { [k: string]: unknown };

function isPlainObject(v: unknown): v is JsonObject {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function mergeJson(target: JsonObject, source: JsonObject): JsonObject {
  const out: JsonObject = { ...target };
  for (const [key, value] of Object.entries(source)) {
    const existing = out[key];
    out[key] = isPlainObject(value) && isPlainObject(existing) ? mergeJson(existing, value) : value;
  }
  return out;
}

function sortDeps(pkg: JsonObject): JsonObject {
  const out = { ...pkg };
  for (const key of ["dependencies", "devDependencies", "peerDependencies"]) {
    const deps = out[key];
    if (isPlainObject(deps)) {
      out[key] = Object.fromEntries(Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)));
    }
  }
  return out;
}

const MERGE_SUFFIX = ".merge.json";

function applyPatch(targetDir: string, patchName: string) {
  const patchDir = resolve(patchesDir, patchName);
  if (!existsSync(patchDir)) return;

  const overlayDir = resolve(patchDir, "overlay");
  if (existsSync(overlayDir)) {
    cpSync(overlayDir, targetDir, { recursive: true });
  }

  for (const entry of readdirSync(patchDir)) {
    if (!entry.endsWith(MERGE_SUFFIX)) continue;
    const targetName = entry.slice(0, -MERGE_SUFFIX.length);
    const targetPath = resolve(targetDir, targetName);
    if (!existsSync(targetPath)) continue;
    const target = JSON.parse(readFileSync(targetPath, "utf-8")) as JsonObject;
    const patch = JSON.parse(readFileSync(resolve(patchDir, entry), "utf-8")) as JsonObject;
    let merged = mergeJson(target, patch);
    if (targetName === "package.json") merged = sortDeps(merged);
    writeFileSync(targetPath, `${JSON.stringify(merged, null, 2)}\n`);
  }
}

async function main() {
  intro(pc.bgCyan(pc.black(" create-hono-inertia ")));

  const args = parseArgs(process.argv.slice(2));
  const argError = args.name ? validateProjectName(args.name) : undefined;

  if (args.yes && (!args.name || argError)) {
    cancel(argError ?? "Project name is required with --yes.");
    process.exit(1);
  }

  const projectName =
    args.name && !argError
      ? args.name
      : runOrCancel(
          await text({
            message: "Project name",
            placeholder: "my-app",
            initialValue: args.name && !argError ? args.name : "",
            validate: (v) => validateProjectName(v ?? ""),
          }),
        );

  const doTailwind = args.yes
    ? !args.skipTailwind
    : runOrCancel(
        await confirm({
          message: "Add Tailwind CSS?",
          initialValue: true,
        }),
      );

  const doAlias = args.yes
    ? !args.skipAlias
    : runOrCancel(
        await confirm({
          message: `Add import alias (${pc.cyan("@/*")} → ${pc.cyan("./src/*")})?`,
          initialValue: true,
        }),
      );

  const pm = detectPM();

  const doInstall = args.yes
    ? !args.skipInstall
    : runOrCancel(
        await confirm({
          message: `Install dependencies with ${pc.cyan(pm)}?`,
          initialValue: true,
        }),
      );

  const doGit = args.yes
    ? !args.skipGit
    : runOrCancel(
        await confirm({
          message: "Initialize a git repository?",
          initialValue: true,
        }),
      );

  const targetDir = resolve(process.cwd(), projectName);

  const s1 = spinner();
  s1.start("Scaffolding project");
  cpSync(templateDir, targetDir, { recursive: true });
  renameSync(resolve(targetDir, "_gitignore"), resolve(targetDir, ".gitignore"));
  for (const file of ["package.json", "wrangler.jsonc"]) {
    const filePath = resolve(targetDir, file);
    const contents = readFileSync(filePath, "utf-8");
    writeFileSync(
      filePath,
      contents.replace(/"name": "cf-workers-hono-jsx"/, `"name": "${projectName}"`),
    );
  }
  if (doTailwind) applyPatch(targetDir, "tailwind");
  if (doAlias) applyPatch(targetDir, "alias");
  writeFileSync(
    resolve(targetDir, "vite.config.ts"),
    buildViteConfig({ tailwind: doTailwind, alias: doAlias }),
  );
  s1.stop(`Scaffolded ${pc.cyan(projectName)}`);

  if (doGit) {
    const s2 = spinner();
    s2.start("Initializing git repository");
    try {
      execFileSync("git", ["init", "-q"], { cwd: targetDir, stdio: "ignore" });
      execFileSync("git", ["add", "-A"], { cwd: targetDir, stdio: "ignore" });
      execFileSync("git", ["commit", "-m", "Initial commit", "-q"], {
        cwd: targetDir,
        stdio: "ignore",
      });
      s2.stop("Git repository initialized");
    } catch {
      s2.stop(pc.yellow("Skipped git init (git not available or commit failed)"));
    }
  }

  if (doInstall) {
    const s3 = spinner();
    s3.start(`Installing dependencies with ${pm}`);
    try {
      execFileSync(pm, ["install"], { cwd: targetDir, stdio: "ignore" });
      s3.stop("Dependencies installed");
    } catch {
      s3.stop(pc.yellow(`Install failed. Run '${pm} install' manually.`));
    }
  }

  const runDev = pm === "npm" ? "npm run dev" : `${pm} dev`;
  const lines = [
    `${pc.green("✓")} Project ready in ${pc.cyan(projectName)}`,
    "",
    "Next steps:",
    `  ${pc.dim("cd")} ${projectName}`,
  ];
  if (!doInstall) lines.push(`  ${pc.dim(`${pm} install`)}`);
  lines.push(`  ${pc.dim(runDev)}`);
  outro(lines.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
