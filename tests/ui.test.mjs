/**
 * UI tests: template structure (point-enhancements.html) and dialogs.css.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TEMPLATE_PATH = join(ROOT, "templates", "point-enhancements.html");
const CSS_PATH = join(ROOT, "styles", "dialogs.css");

describe("point-enhancements.html template", () => {
  let template;

  beforeAll(() => {
    template = readFileSync(TEMPLATE_PATH, "utf-8");
  });

  it("contains a form with class flexcol", () => {
    expect(template).toContain("<form");
    expect(template).toContain("flexcol");
  });

  it("contains journal-choice buttons with data-journal-name", () => {
    expect(template).toContain("journal-choice");
    expect(template).toContain("data-journal-name");
  });

  it("contains Handlebars each for journals", () => {
    expect(template).toContain("{{#each journals}}");
  });

  it("contains Handlebars unless for enhancementsActive and journals.length", () => {
    expect(template).toContain("{{#unless enhancementsActive}}");
    expect(template).toContain("{{#unless journals.length}}");
  });

  it("contains cancel button with name cancel", () => {
    expect(template).toContain('name="cancel"');
    expect(template).toContain("Cancel");
  });

  it("uses data-key for journal key", () => {
    expect(template).toContain("data-key");
    expect(template).toContain("{{this.name}}");
    expect(template).toContain("{{this.key}}");
  });
});

describe("dialogs.css", () => {
  let css;

  beforeAll(() => {
    css = readFileSync(CSS_PATH, "utf-8");
  });

  it("is non-empty", () => {
    expect(css.length).toBeGreaterThan(0);
  });

  it("contains main dialog class swrpg-dice-helper-dialog", () => {
    expect(css).toContain("swrpg-dice-helper-dialog");
  });

  it("has balanced braces", () => {
    const open = (css.match(/{/g) || []).length;
    const close = (css.match(/}/g) || []).length;
    expect(close).toBe(open);
  });
});
