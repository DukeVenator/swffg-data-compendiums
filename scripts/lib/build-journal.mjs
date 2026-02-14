/**
 * Pure build logic: given dice-helper data, returns a Foundry JournalEntry document.
 * Used by scripts/build.mjs and by tests.
 */

export function randomId() {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

/**
 * Build a Foundry JournalEntry object from parsed dice-helper data.
 * @param {object} data - Parsed dice_helper.json (skill key -> outcome arrays).
 * @param {{ pageId?: string, entryId?: string }} [options] - Optional fixed IDs for tests.
 * @returns {object} JournalEntry document shape.
 */
export function buildJournalEntry(data, options = {}) {
  const content = JSON.stringify(data);
  const pageId = options.pageId ?? randomId();
  const entryId = options.entryId ?? randomId();

  return {
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
}
