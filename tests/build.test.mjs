/**
 * Unit tests for build-journal transformation and randomId.
 */
import { describe, it, expect } from "vitest";
import { buildJournalEntry, randomId } from "../scripts/lib/build-journal.mjs";

describe("randomId", () => {
  it("returns a 16-character string", () => {
    expect(randomId()).toHaveLength(16);
  });

  it("returns only hex characters", () => {
    const id = randomId();
    expect(id).toMatch(/^[0-9a-f]{16}$/);
  });

  it("returns different values on multiple calls", () => {
    const a = randomId();
    const b = randomId();
    expect(a).not.toBe(b);
  });
});

describe("buildJournalEntry", () => {
  const sampleData = {
    "SWFFG.SkillsNameMelee": {
      su: [],
      ad: [{ text: "Apply critical", required: 1 }],
      tr: [],
      fa: [],
      th: [{ text: "Suffer strain", required: 1 }]
    }
  };

  it("returns an object with _id, name, pages, ownership, flags", () => {
    const entry = buildJournalEntry(sampleData, { entryId: "e1", pageId: "p1" });
    expect(entry).toHaveProperty("_id", "e1");
    expect(entry).toHaveProperty("name", "Dice Helper (All Skills)");
    expect(entry).toHaveProperty("pages");
    expect(entry).toHaveProperty("ownership", { default: 0 });
    expect(entry).toHaveProperty("flags", {});
  });

  it("has exactly one page", () => {
    const entry = buildJournalEntry(sampleData, { entryId: "e1", pageId: "p1" });
    expect(Array.isArray(entry.pages)).toBe(true);
    expect(entry.pages).toHaveLength(1);
  });

  it("page has name dice_helper, type text, and text.content as stringified data", () => {
    const entry = buildJournalEntry(sampleData, { entryId: "e1", pageId: "p1" });
    const page = entry.pages[0];
    expect(page).toHaveProperty("_id", "p1");
    expect(page).toHaveProperty("name", "dice_helper");
    expect(page).toHaveProperty("type", "text");
    expect(page).toHaveProperty("text");
    expect(page.text).toHaveProperty("content", JSON.stringify(sampleData));
    expect(page.text).toHaveProperty("format", 1);
    expect(page.text).toHaveProperty("markdown", "");
    expect(page).toHaveProperty("sort", 0);
    expect(page).toHaveProperty("ownership", { default: 0 });
    expect(page).toHaveProperty("flags", {});
  });

  it("uses provided options.pageId and options.entryId when given", () => {
    const entry = buildJournalEntry(sampleData, { entryId: "abc", pageId: "def" });
    expect(entry._id).toBe("abc");
    expect(entry.pages[0]._id).toBe("def");
  });

  it("generates random IDs when options omitted", () => {
    const entry = buildJournalEntry(sampleData);
    expect(entry._id).toMatch(/^[0-9a-f]{16}$/);
    expect(entry.pages[0]._id).toMatch(/^[0-9a-f]{16}$/);
  });
});
