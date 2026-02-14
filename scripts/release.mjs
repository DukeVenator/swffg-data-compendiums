#!/usr/bin/env node
/**
 * Create the release zip (same contents as the GitHub Actions release step).
 * Run after `npm run build`. Output: dist/<module-id>.zip
 */

import { createWriteStream, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MODULE_ID = "swrpg-dice-helper-compendium";
const DIST = join(ROOT, "dist");
const ZIP_PATH = join(DIST, `${MODULE_ID}.zip`);

const RELEASE_FILES = [
  ["module.json", "module.json"],
  ["README.md", "README.md"]
];

const RELEASE_DIRS = [
  ["packs", "packs"],
  ["scripts", "scripts"],
  ["styles", "styles"],
  ["docs", "docs"]
];

async function run() {
  if (!existsSync(join(ROOT, "packs", "dice-helper"))) {
    console.error("Run 'npm run build' first to generate packs/dice-helper/");
    process.exit(1);
  }

  if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true });

  const out = createWriteStream(ZIP_PATH);
  const archive = archiver("zip", { zlib: { level: 9 } });

  out.on("close", () => {
    console.log(`Created ${ZIP_PATH} (${(archive.pointer() / 1024).toFixed(1)} KB)`);
  });

  archive.on("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  archive.pipe(out);

  for (const [src, name] of RELEASE_FILES) {
    const path = join(ROOT, src);
    if (existsSync(path)) archive.file(path, { name });
  }

  for (const [src, name] of RELEASE_DIRS) {
    const path = join(ROOT, src);
    if (existsSync(path)) archive.directory(path, name);
  }

  await archive.finalize();
}

run();
