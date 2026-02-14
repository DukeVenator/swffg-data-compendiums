#!/usr/bin/env node
/**
 * Build script: reads src/data/dice_helper.json, builds a Foundry JournalEntry
 * document, and compiles it into a LevelDB compendium pack at packs/dice-helper/
 * using @foundryvtt/foundryvtt-cli. Requires: npm install && npm run build
 */

import { readFileSync, mkdirSync, writeFileSync, rmSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { compilePack } from "@foundryvtt/foundryvtt-cli";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SRC_DATA = join(ROOT, "src", "data", "dice_helper.json");
const BUILD_SRC_DIR = join(ROOT, "build", "dice-helper-src");
const PACK_OUTPUT = join(ROOT, "packs", "dice-helper");

function randomId() {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function build() {
  console.log("Reading source data...");
  const dataRaw = readFileSync(SRC_DATA, "utf-8");
  const data = JSON.parse(dataRaw);
  const content = JSON.stringify(data);

  const pageId = randomId();
  const entryId = randomId();

  const journalEntry = {
    _id: entryId,
    name: "Dice Helper (All Skills)",
    pages: [
      {
        _id: pageId,
        name: "dice_helper",
        type: "text",
        text: {
          content,
          format: 1,
          markdown: ""
        },
        sort: 0,
        ownership: { default: 0 },
        flags: {}
      }
    ],
    ownership: { default: 0 },
    flags: {}
  };

  if (existsSync(BUILD_SRC_DIR)) {
    rmSync(BUILD_SRC_DIR, { recursive: true });
  }
  mkdirSync(BUILD_SRC_DIR, { recursive: true });

  const docPath = join(BUILD_SRC_DIR, "Dice_Helper_All_Skills.json");
  writeFileSync(docPath, JSON.stringify(journalEntry, null, 2), "utf-8");
  console.log("Wrote document to", docPath);

  if (existsSync(PACK_OUTPUT)) {
    rmSync(PACK_OUTPUT, { recursive: true });
  }
  mkdirSync(dirname(PACK_OUTPUT), { recursive: true });

  console.log("Compiling LevelDB pack...");
  return compilePack(BUILD_SRC_DIR, PACK_OUTPUT, { log: true });
}

build()
  .then(() => {
    console.log("Done. Pack output:", PACK_OUTPUT);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
