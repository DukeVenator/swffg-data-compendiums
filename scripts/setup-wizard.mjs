/**
 * First-time setup wizard: offers to create the Dice Helper journal in the world
 * by importing from this module's compendium. Runs once per world unless skipped.
 * Can also set the FFG Star Wars Enhancements "Dice Helper Data" setting to point at the journal.
 */

const MODULE_ID = "swrpg-dice-helper-compendium";
const PACK_ID = `${MODULE_ID}.dice-helper`;
const DEFAULT_JOURNAL_NAME = "dice_helper";
const ENHANCEMENTS_MODULE_ID = "ffg-star-wars-enhancements";
const ENHANCEMENTS_SETTING_KEY = "dice-helper-data";

function setEnhancementsJournal(journalName) {
  if (typeof game.modules.get(ENHANCEMENTS_MODULE_ID)?.active !== "boolean" || !game.modules.get(ENHANCEMENTS_MODULE_ID).active) {
    return false;
  }
  try {
    game.settings.set(ENHANCEMENTS_MODULE_ID, ENHANCEMENTS_SETTING_KEY, journalName);
    return true;
  } catch (_) {
    return false;
  }
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "setup-done", {
    name: "Setup wizard completed",
    hint: "Whether the first-time Dice Helper journal setup has been run or skipped.",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.registerMenu(MODULE_ID, "point-enhancements", {
    name: "Point Enhancements at journal",
    label: "Set Enhancements setting…",
    hint: "Set FFG Star Wars Enhancements' 'Dice Helper Data' to a journal so the Dice Helper uses it.",
    icon: "fas fa-book",
    type: PointEnhancementsMenu,
    restricted: true
  });
});

class PointEnhancementsMenu {
  constructor() {
    const enhancementsActive = !!game.modules.get(ENHANCEMENTS_MODULE_ID)?.active;
    const journals = game.journal.map((j) => j.name);
    const current = enhancementsActive
      ? game.settings.get(ENHANCEMENTS_MODULE_ID, ENHANCEMENTS_SETTING_KEY)
      : null;

    const buttons = {};
    journals.forEach((name) => {
      const key = `j-${name.replace(/\W/g, "_")}`;
      buttons[key] = {
        icon: current === name ? "fas fa-check" : "fas fa-book",
        label: name + (current === name ? " (current)" : ""),
        callback: () => {
          if (setEnhancementsJournal(name)) {
            ui.notifications.info(`Enhancements "Dice Helper Data" set to "${name}".`);
          } else {
            ui.notifications.warn("FFG Star Wars Enhancements is not enabled.");
          }
        }
      };
    });

    new Dialog(
      {
        title: "Point Enhancements at journal",
        content: `
          <p>Set <strong>FFG Star Wars Enhancements</strong> “Dice Helper Data” to one of your journals:</p>
          ${!enhancementsActive ? '<p class="notes">Enable FFG Star Wars Enhancements first.</p>' : ""}
          ${journals.length === 0 ? '<p class="notes">No journals in this world. Import the Dice Helper from the Compendium first.</p>' : ""}
        `,
        buttons: journals.length
          ? { ...buttons, cancel: { icon: "fas fa-times", label: "Cancel", callback: () => {} } }
          : { ok: { icon: "fas fa-check", label: "OK", callback: () => {} } }
      },
      { width: 360, classes: ["swrpg-dice-helper-dialog"] }
    ).render(true);
  }
}

Hooks.once("ready", async () => {
  if (!game.user.isGM) return;
  if (game.settings.get(MODULE_ID, "setup-done")) return;

  const pack = game.packs.get(PACK_ID);
  if (!pack) return;

  const existing = game.journal.find((j) => j.name === DEFAULT_JOURNAL_NAME);
  if (existing) {
    game.settings.set(MODULE_ID, "setup-done", true);
    return;
  }

  new Dialog(
    {
      title: "Dice Helper – First-time setup",
      content: `
        <p>Create the <strong>Dice Helper</strong> journal in this world so
        <strong>FFG Star Wars Enhancements</strong> can show dice result spending tips for all skills.</p>
        <p>This will import the journal from the <strong>Dice Helper (All Skills)</strong> compendium
        and name it <code>${DEFAULT_JOURNAL_NAME}</code>, which matches the default setting in Enhancements.</p>
        <p><strong>Set up now?</strong></p>
      `,
      buttons: {
        setup: {
          icon: "<i class=\"fas fa-check\"></i>",
          label: "Set up",
          callback: async () => {
            try {
              const docs = await pack.getDocuments();
              const entry = docs[0];
              if (!entry) {
                ui.notifications.warn("Dice Helper compendium is empty.");
                return;
              }
              const imported = await pack.importDocument(entry.id);
              if (imported && imported.name !== DEFAULT_JOURNAL_NAME) {
                await imported.update({ name: DEFAULT_JOURNAL_NAME });
              }
              game.settings.set(MODULE_ID, "setup-done", true);
              const didSet = setEnhancementsJournal(DEFAULT_JOURNAL_NAME);
              ui.notifications.info(
                didSet
                  ? `Dice Helper journal created and Enhancements "Dice Helper Data" set to "${DEFAULT_JOURNAL_NAME}".`
                  : `Dice Helper journal "${DEFAULT_JOURNAL_NAME}" created. Enable FFG Star Wars Enhancements and use Module Settings → "Set Enhancements setting…" to point it at this journal.`
              );
            } catch (err) {
              console.error(`${MODULE_ID} setup:`, err);
              ui.notifications.error("Failed to create Dice Helper journal. See console.");
            }
          }
        },
        skip: {
          icon: "<i class=\"fas fa-times\"></i>",
          label: "Skip",
          callback: () => {
            game.settings.set(MODULE_ID, "setup-done", true);
            ui.notifications.info("You can import the Dice Helper journal from the Compendium tab anytime.");
          }
        }
      },
      default: "setup"
    },
    { width: 420, classes: ["swrpg-dice-helper-dialog"] }
  ).render(true);
});
