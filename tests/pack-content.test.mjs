/**
 * Pack content test: after build, extractPack and validate journal entry and content.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { extractPack } from "@foundryvtt/foundryvtt-cli";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PACK_OUTPUT = join(ROOT, "packs", "dice-helper");
const SRC_DATA = join(ROOT, "src", "data", "dice_helper.json");
const REQUIRED_SKILL_KEYS = ["su", "ad", "tr", "fa", "th"];

describe("pack content", () => {
  let extractDir;

  beforeAll(() => {
    execSync("npm run build", { encoding: "utf-8", cwd: ROOT, stdio: "pipe" });
    extractDir = mkdtempSync(join(tmpdir(), "swrpg-pack-test-"));
  }, 60000);

  afterAll(() => {
    if (extractDir && existsSync(extractDir)) {
      rmSync(extractDir, { recursive: true, force: true });
    }
  });

  it("extractPack produces at least one JournalEntry JSON", async () => {
    expect(existsSync(PACK_OUTPUT)).toBe(true);
    await extractPack(PACK_OUTPUT, extractDir, { log: false });
    const files = readdirSync(extractDir).filter((f) => f.endsWith(".json"));
    expect(files.length).toBeGreaterThanOrEqual(1);
  });

  it("extracted document has name Dice Helper (All Skills) and one page dice_helper", async () => {
    await extractPack(PACK_OUTPUT, extractDir, { clean: true, log: false });
    const files = readdirSync(extractDir).filter((f) => f.endsWith(".json"));
    expect(files.length).toBe(1);
    const doc = JSON.parse(readFileSync(join(extractDir, files[0]), "utf-8"));
    expect(doc.name).toBe("Dice Helper (All Skills)");
    expect(Array.isArray(doc.pages)).toBe(true);
    expect(doc.pages).toHaveLength(1);
    expect(doc.pages[0].name).toBe("dice_helper");
    expect(doc.pages[0].type).toBe("text");
    expect(doc.pages[0].text).toBeDefined();
    expect(typeof doc.pages[0].text.content).toBe("string");
  });

  it("page text.content is valid JSON with same top-level keys as source data", async () => {
    await extractPack(PACK_OUTPUT, extractDir, { clean: true, log: false });
    const files = readdirSync(extractDir).filter((f) => f.endsWith(".json"));
    const doc = JSON.parse(readFileSync(join(extractDir, files[0]), "utf-8"));
    const content = JSON.parse(doc.pages[0].text.content);
    expect(typeof content).toBe("object");
    expect(content).not.toBeNull();
    const sourceData = JSON.parse(readFileSync(SRC_DATA, "utf-8"));
    const sourceKeys = Object.keys(sourceData).sort();
    const contentKeys = Object.keys(content).sort();
    expect(contentKeys).toEqual(sourceKeys);
  });

  it("each skill in content has required keys su, ad, tr, fa, th", async () => {
    await extractPack(PACK_OUTPUT, extractDir, { clean: true, log: false });
    const files = readdirSync(extractDir).filter((f) => f.endsWith(".json"));
    const doc = JSON.parse(readFileSync(join(extractDir, files[0]), "utf-8"));
    const content = JSON.parse(doc.pages[0].text.content);
    for (const [skillId, skill] of Object.entries(content)) {
      for (const key of REQUIRED_SKILL_KEYS) {
        expect(skill).toHaveProperty(key);
        expect(Array.isArray(skill[key])).toBe(true);
      }
    }
  });
});
