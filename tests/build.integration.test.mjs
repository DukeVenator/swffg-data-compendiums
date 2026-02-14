/**
 * Integration test: run full build and assert pack output exists.
 */
import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import { existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PACK_OUTPUT = join(ROOT, "packs", "dice-helper");

describe("build integration", () => {
  it("npm run build produces packs/dice-helper with LevelDB files", () => {
    execSync("npm run build", { encoding: "utf-8", cwd: ROOT, stdio: "pipe" });
    expect(existsSync(PACK_OUTPUT)).toBe(true);
    const files = readdirSync(PACK_OUTPUT);
    expect(files.length).toBeGreaterThan(0);
    expect(files).toContain("CURRENT");
  }, 60000);
});
