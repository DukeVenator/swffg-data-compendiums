/**
 * Schema/validation tests for src/data/dice_helper.json.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC_DATA = join(ROOT, "src", "data", "dice_helper.json");

const REQUIRED_SKILL_KEYS = ["su", "ad", "tr", "fa", "th"];
const OPTIONAL_SKILL_KEYS = ["de"];
const OUTCOME_KEYS = ["text", "required"];

function loadDiceHelper() {
  const raw = readFileSync(SRC_DATA, "utf-8");
  return JSON.parse(raw);
}

function isValidOutcome(item) {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof item.text === "string" &&
    typeof item.required === "number"
  );
}

function isValidSkillObject(skill) {
  if (typeof skill !== "object" || skill === null) return false;
  for (const key of REQUIRED_SKILL_KEYS) {
    if (!(key in skill) || !Array.isArray(skill[key])) return false;
    for (const item of skill[key]) {
      if (!isValidOutcome(item)) return false;
    }
  }
  for (const key of OPTIONAL_SKILL_KEYS) {
    if (key in skill) {
      if (!Array.isArray(skill[key])) return false;
      for (const item of skill[key]) {
        if (!isValidOutcome(item)) return false;
      }
    }
  }
  return true;
}

describe("dice_helper.json", () => {
  let data;

  beforeAll(() => {
    data = loadDiceHelper();
  });

  it("is valid JSON and a non-empty object", () => {
    expect(data).toBeDefined();
    expect(typeof data).toBe("object");
    expect(data).not.toBeNull();
    expect(Object.keys(data).length).toBeGreaterThan(0);
  });

  it("has only string keys (skill IDs)", () => {
    for (const key of Object.keys(data)) {
      expect(typeof key).toBe("string");
      expect(key.length).toBeGreaterThan(0);
    }
  });

  it("each skill has required keys su, ad, tr, fa, th and valid outcome arrays", () => {
    for (const [skillId, skill] of Object.entries(data)) {
      expect(isValidSkillObject(skill)).toBe(true);
    }
  });

  it("each outcome in any array has text (string) and required (number)", () => {
    for (const skill of Object.values(data)) {
      for (const key of [...REQUIRED_SKILL_KEYS, ...OPTIONAL_SKILL_KEYS]) {
        if (!(key in skill)) continue;
        for (const item of skill[key]) {
          expect(item).toHaveProperty("text");
          expect(item).toHaveProperty("required");
          expect(typeof item.text).toBe("string");
          expect(typeof item.required).toBe("number");
        }
      }
    }
  });
});
