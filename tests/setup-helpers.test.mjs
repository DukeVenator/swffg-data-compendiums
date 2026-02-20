/**
 * Unit tests for setup-helpers: constants and setEnhancementsJournal / isJournalCreatedByUs.
 */
import { describe, it, expect } from "vitest";
import {
  MODULE_ID,
  PACK_ID,
  DEFAULT_JOURNAL_NAME,
  ENHANCEMENTS_MODULE_ID,
  ENHANCEMENTS_SETTING_KEY,
  CREATED_BY_MODULE_FLAG,
  DIALOG_TITLE,
  BUTTON_LABEL_SETUP,
  BUTTON_LABEL_SKIP,
  isJournalCreatedByUs,
  setEnhancementsJournal
} from "../scripts/lib/setup-helpers.mjs";

describe("setup-helpers constants", () => {
  it("MODULE_ID is the compendium module id", () => {
    expect(MODULE_ID).toBe("swrpg-dice-helper-compendium");
  });

  it("PACK_ID is module id plus dice-helper pack", () => {
    expect(PACK_ID).toBe("swrpg-dice-helper-compendium.dice-helper");
  });

  it("DEFAULT_JOURNAL_NAME is dice_helper", () => {
    expect(DEFAULT_JOURNAL_NAME).toBe("dice_helper");
  });

  it("ENHANCEMENTS_MODULE_ID and ENHANCEMENTS_SETTING_KEY are set", () => {
    expect(ENHANCEMENTS_MODULE_ID).toBe("ffg-star-wars-enhancements");
    expect(ENHANCEMENTS_SETTING_KEY).toBe("dice-helper-data");
  });

  it("CREATED_BY_MODULE_FLAG is createdByModule", () => {
    expect(CREATED_BY_MODULE_FLAG).toBe("createdByModule");
  });

  it("DIALOG_TITLE and button labels are set for first-time setup", () => {
    expect(DIALOG_TITLE).toBe("Dice Helper – First-time setup");
    expect(BUTTON_LABEL_SETUP).toBe("Set up");
    expect(BUTTON_LABEL_SKIP).toBe("Skip");
  });
});

describe("isJournalCreatedByUs", () => {
  it("returns false when journal is null", () => {
    expect(isJournalCreatedByUs(null)).toBe(false);
  });

  it("returns false when journal is undefined", () => {
    expect(isJournalCreatedByUs(undefined)).toBe(false);
  });

  it("returns false when getFlag returns false", () => {
    const journal = {
      getFlag: (scope, key) => {
        expect(scope).toBe(MODULE_ID);
        expect(key).toBe(CREATED_BY_MODULE_FLAG);
        return false;
      }
    };
    expect(isJournalCreatedByUs(journal)).toBe(false);
  });

  it("returns false when getFlag returns undefined", () => {
    const journal = { getFlag: () => undefined };
    expect(isJournalCreatedByUs(journal)).toBe(false);
  });

  it("returns true when getFlag returns true", () => {
    const journal = {
      getFlag: (scope, key) => {
        expect(scope).toBe(MODULE_ID);
        expect(key).toBe(CREATED_BY_MODULE_FLAG);
        return true;
      }
    };
    expect(isJournalCreatedByUs(journal)).toBe(true);
  });
});

describe("setEnhancementsJournal", () => {
  it("returns false when gameLike is null", () => {
    expect(setEnhancementsJournal(null, "dice_helper")).toBe(false);
  });

  it("returns false when Enhancements module is not active", () => {
    const gameLike = {
      modules: { get: () => ({ active: false }) },
      settings: { set: () => {} }
    };
    expect(setEnhancementsJournal(gameLike, "dice_helper")).toBe(false);
  });

  it("returns false when Enhancements module is missing", () => {
    const gameLike = {
      modules: { get: () => undefined },
      settings: { set: () => {} }
    };
    expect(setEnhancementsJournal(gameLike, "dice_helper")).toBe(false);
  });

  it("returns true and calls settings.set when module is active", () => {
    const setCalls = [];
    const gameLike = {
      modules: { get: (id) => (id === ENHANCEMENTS_MODULE_ID ? { active: true } : undefined) },
      settings: {
        set: (mod, key, value) => {
          setCalls.push({ mod, key, value });
        }
      }
    };
    expect(setEnhancementsJournal(gameLike, "my_journal")).toBe(true);
    expect(setCalls).toHaveLength(1);
    expect(setCalls[0]).toEqual({
      mod: ENHANCEMENTS_MODULE_ID,
      key: ENHANCEMENTS_SETTING_KEY,
      value: "my_journal"
    });
  });

  it("returns false when settings.set throws", () => {
    const gameLike = {
      modules: { get: () => ({ active: true }) },
      settings: { set: () => { throw new Error("no"); } }
    };
    expect(setEnhancementsJournal(gameLike, "dice_helper")).toBe(false);
  });
});
