#!/usr/bin/env node
/**
 * Build script: reads src/data/dice_helper.json, builds a Foundry JournalEntry
 * document, and compiles it into a LevelDB compendium pack at packs/dice-helper/
 * using @foundryvtt/foundryvtt-cli. Requires: npm install && npm run build
 */

import { readFileSync, mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { buildJournalEntry } from "./lib/build-journal.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SRC_DATA = join(ROOT, "src", "data", "dice_helper.json");
const BUILD_SRC_DIR = join(ROOT, "build", "dice-helper-src");
const PACK_OUTPUT = join(ROOT, "packs", "dice-helper");

const DEBUG = process.env.DEBUG !== undefined && process.env.DEBUG !== "";

function build() {
  console.log("[build] Starting build...");
  console.log("[build] ROOT:", ROOT);
  console.log("[build] SRC_DATA:", SRC_DATA, "exists:", existsSync(SRC_DATA));
  console.log("[build] BUILD_SRC_DIR:", BUILD_SRC_DIR);
  console.log("[build] PACK_OUTPUT:", PACK_OUTPUT);

  if (!existsSync(SRC_DATA)) {
    throw new Error(`Source data not found: ${SRC_DATA}`);
  }

  console.log("[build] Reading source data...");
  const dataRaw = readFileSync(SRC_DATA, "utf-8");
  if (DEBUG) console.log("[build] Raw data length:", dataRaw.length);
  const data = JSON.parse(dataRaw);
  if (DEBUG) console.log("[build] Parsed data keys:", Object.keys(data));

  const journalEntry = buildJournalEntry(data);
  if (DEBUG) console.log("[build] Journal entry keys:", journalEntry ? Object.keys(journalEntry) : "null");

  if (existsSync(BUILD_SRC_DIR)) {
    console.log("[build] Clearing BUILD_SRC_DIR");
    rmSync(BUILD_SRC_DIR, { recursive: true });
  }
  mkdirSync(BUILD_SRC_DIR, { recursive: true });

  const docPath = join(BUILD_SRC_DIR, "Dice_Helper_All_Skills.json");
  const docJson = JSON.stringify(journalEntry, null, 2);
  writeFileSync(docPath, docJson, "utf-8");
  console.log("[build] Wrote document to", docPath, "size:", docJson.length, "bytes");

  if (existsSync(PACK_OUTPUT)) {
    console.log("[build] Clearing PACK_OUTPUT");
    rmSync(PACK_OUTPUT, { recursive: true });
  }
  mkdirSync(dirname(PACK_OUTPUT), { recursive: true });

  console.log("[build] Compiling LevelDB pack...");
  return compilePack(BUILD_SRC_DIR, PACK_OUTPUT, { log: true });
}

build()
  .then(() => {
    console.log("[build] Done. Pack output:", PACK_OUTPUT);
    if (existsSync(PACK_OUTPUT)) {
      try {
        const files = readdirSync(PACK_OUTPUT);
        console.log("[build] Pack directory contents:", files);
      } catch (e) {
        console.log("[build] Could not list pack dir:", e.message);
      }
    } else {
      console.warn("[build] Pack output directory does not exist after compile.");
    }
  })
  .catch((err) => {
    console.error("[build] Error:", err);
    process.exit(1);
  });
