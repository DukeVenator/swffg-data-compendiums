/**
 * Testable setup-wizard helpers: constants and pure logic.
 * Used by scripts/setup-wizard.mjs and by tests.
 */

export const MODULE_ID = "swrpg-dice-helper-compendium";
export const PACK_ID = `${MODULE_ID}.dice-helper`;
export const DEFAULT_JOURNAL_NAME = "dice_helper";
export const ENHANCEMENTS_MODULE_ID = "ffg-star-wars-enhancements";
export const ENHANCEMENTS_SETTING_KEY = "dice-helper-data";

/** Flag we set on journals we create so we can tell ours from another module's same-named journal. */
export const CREATED_BY_MODULE_FLAG = "createdByModule";

/** Dialog title for first-time setup. */
export const DIALOG_TITLE = "Dice Helper – First-time setup";

/** Setup button label; Skip button label. */
export const BUTTON_LABEL_SETUP = "Set up";
export const BUTTON_LABEL_SKIP = "Skip";

/**
 * @param {object} [journal] - Journal document with getFlag(scope, key).
 * @returns {boolean}
 */
export function isJournalCreatedByUs(journal) {
  return journal?.getFlag(MODULE_ID, CREATED_BY_MODULE_FLAG) === true;
}

/**
 * Set Enhancements module's Dice Helper Data setting. Testable with a mock game object.
 * @param {{ modules: { get: (id: string) => { active?: boolean } | undefined }, settings: { set: (mod: string, key: string, value: string) => void } }} gameLike
 * @param {string} journalName
 * @returns {boolean}
 */
export function setEnhancementsJournal(gameLike, journalName) {
  const mod = gameLike?.modules?.get(ENHANCEMENTS_MODULE_ID);
  if (typeof mod?.active !== "boolean" || !mod.active) {
    return false;
  }
  try {
    gameLike.settings.set(ENHANCEMENTS_MODULE_ID, ENHANCEMENTS_SETTING_KEY, journalName);
    return true;
  } catch (_) {
    return false;
  }
}
