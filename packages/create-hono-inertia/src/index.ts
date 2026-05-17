#!/usr/bin/env node
import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateDir = resolve(__dirname, "../templates/cf-workers-hono-jsx");

const projectName = process.argv[2];

if (!projectName) {
  console.error("Usage: create-hono-inertia <project-name>");
  process.exit(1);
}

const targetDir = resolve(process.cwd(), projectName);

if (existsSync(targetDir)) {
  console.error(`Error: directory '${projectName}' already exists.`);
  process.exit(1);
}

cpSync(templateDir, targetDir, { recursive: true });

const replacements = [
  { file: "package.json", from: '"name": "cf-workers-hono-jsx"', to: `"name": "${projectName}"` },
  { file: "wrangler.jsonc", from: '"name": "cf-workers-hono-jsx"', to: `"name": "${projectName}"` },
];

for (const { file, from, to } of replacements) {
  const filePath = resolve(targetDir, file);
  const contents = readFileSync(filePath, "utf-8");
  writeFileSync(filePath, contents.replace(from, to));
}

console.log(`✓ Created ${projectName}\n`);
console.log("Next steps:");
console.log(`  cd ${projectName}`);
console.log("  pnpm install");
console.log("  pnpm dev");
