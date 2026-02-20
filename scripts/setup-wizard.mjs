/**
 * First-time setup wizard: offers to create the Dice Helper journal in the world
 * by importing from this module's compendium. Runs once per world unless skipped.
 * Can also set the FFG Star Wars Enhancements "Dice Helper Data" setting to point at the journal.
 */

import {
  MODULE_ID,
  PACK_ID,
  DEFAULT_JOURNAL_NAME,
  ENHANCEMENTS_MODULE_ID,
  CREATED_BY_MODULE_FLAG,
  DIALOG_TITLE,
  BUTTON_LABEL_SETUP,
  BUTTON_LABEL_SKIP,
  isJournalCreatedByUs,
  setEnhancementsJournal as setEnhancementsJournalWithGame
} from "./lib/setup-helpers.mjs";

function setEnhancementsJournal(journalName) {
  return setEnhancementsJournalWithGame(game, journalName);
}

Hooks.once("init", () => {
  console.log("[swrpg-dice-helper-compendium] init: registering settings");
  game.settings.register(MODULE_ID, "setup-done", {
    name: "Setup wizard completed",
    hint: "Whether the first-time Dice Helper journal setup has been run or skipped.",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register(MODULE_ID, "reset-setup", {
    name: "Reset setup state",
    hint: "Clear setup state so the first-time wizard can show again. Use if the compendium was empty and you have now rebuilt/reinstalled.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      if (!value) return;
      game.settings.set(MODULE_ID, "setup-done", false);
      for (const j of game.journal) {
        if (j.getFlag(MODULE_ID, CREATED_BY_MODULE_FLAG)) {
          j.unsetFlag(MODULE_ID, CREATED_BY_MODULE_FLAG);
          console.log("[swrpg-dice-helper-compendium] Cleared createdByModule flag from journal:", j.name);
        }
      }
      game.settings.set(MODULE_ID, "reset-setup", false);
      console.log("[swrpg-dice-helper-compendium] Setup state reset. Reload the world to see the wizard again.");
      ui.notifications.info("Setup state reset. Reload the world to see the wizard again.");
    }
  });

  console.log("[swrpg-dice-helper-compendium] init: registering menu type PointEnhancementsMenu");
  game.settings.registerMenu(MODULE_ID, "point-enhancements", {
    name: "Point Enhancements at journal",
    label: "Set Enhancements setting…",
    hint: "Set FFG Star Wars Enhancements' 'Dice Helper Data' to a journal so the Dice Helper uses it.",
    icon: "fas fa-book",
    type: PointEnhancementsMenu,
    restricted: true
  });
  console.log("[swrpg-dice-helper-compendium] init: complete");
});

Hooks.on("renderCompendium", (app, html, data) => {
  if (app.collection?.collection !== PACK_ID) return;
  const pack = game.packs.get(PACK_ID);
  if (!pack) return;
  pack.getDocuments().then((docs) => {
    console.log("[swrpg-dice-helper-compendium] Compendium opened, document count:", docs.length);
    if (docs.length === 0) {
      console.warn("[swrpg-dice-helper-compendium] This compendium is empty. Run 'npm run build' and reinstall the module.");
    }
  }).catch((e) => console.log("[swrpg-dice-helper-compendium] Compendium getDocuments on open:", e));
});

/**
 * FormApplication used by game.settings.registerMenu. Must extend FormApplication or ApplicationV2
 * so Foundry accepts it as a menu type.
 */
class PointEnhancementsMenu extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: "Point Enhancements at journal",
      id: "point-enhancements-menu",
      template: `modules/${MODULE_ID}/templates/point-enhancements.html`,
      width: 360,
      height: "auto"
    });
  }

  getData(options = {}) {
    const enhancementsActive = !!game.modules.get(ENHANCEMENTS_MODULE_ID)?.active;
    const current = enhancementsActive
      ? game.settings.get(ENHANCEMENTS_MODULE_ID, ENHANCEMENTS_SETTING_KEY)
      : null;
    const journals = game.journal.map((j) => ({
      name: j.name,
      key: `j-${j.name.replace(/\W/g, "_")}`,
      isCurrent: j.name === current
    }));
    console.log("[swrpg-dice-helper-compendium] PointEnhancementsMenu getData:", { enhancementsActive, current, journalCount: journals.length });
    return { enhancementsActive, journals };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.querySelectorAll("button.journal-choice").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const name = ev.currentTarget.dataset.journalName;
        if (name && setEnhancementsJournal(name)) {
          ui.notifications.info(`Enhancements "Dice Helper Data" set to "${name}".`);
          this.close();
        } else {
          ui.notifications.warn("FFG Star Wars Enhancements is not enabled.");
        }
      });
    });
    html.querySelector("button[name='cancel']")?.addEventListener("click", () => this.close());
  }

  _updateObject(_event, _formData) {
    // No form to submit; choices are applied via button clicks.
  }

  constructor(object = {}, options = {}) {
    super(object, options);
  }
}

Hooks.once("ready", async () => {
  const setupDone = game.settings.get(MODULE_ID, "setup-done");
  const ourJournal = game.journal.find((j) => isJournalCreatedByUs(j));
  const sameNameJournal = game.journal.find((j) => j.name === DEFAULT_JOURNAL_NAME);
  console.log("[swrpg-dice-helper-compendium] ready: hook fired", {
    isGM: game.user.isGM,
    setupDone,
    ourJournalExists: !!ourJournal,
    sameNameJournalExists: !!sameNameJournal,
    sameNameIsOurs: sameNameJournal ? isJournalCreatedByUs(sameNameJournal) : null
  });
  if (!game.user.isGM) {
    console.log("[swrpg-dice-helper-compendium] ready: skipping (not GM)");
    return;
  }
  if (ourJournal) {
    console.log("[swrpg-dice-helper-compendium] ready: our journal exists (created by this module), skipping");
    game.settings.set(MODULE_ID, "setup-done", true);
    return;
  }
  if (game.settings.get(MODULE_ID, "setup-done")) {
    console.log("[swrpg-dice-helper-compendium] ready: skipping (setup already done, no journal created by this module)");
    return;
  }

  const pack = game.packs.get(PACK_ID);
  console.log("[swrpg-dice-helper-compendium] ready: pack", PACK_ID, "found:", !!pack, "total packs:", game.packs.size);
  if (!pack) {
    console.log("[swrpg-dice-helper-compendium] ready: no pack, wizard not shown");
    return;
  }

  let docCount = 0;
  try {
    const docs = await pack.getDocuments();
    docCount = docs.length;
    console.log("[swrpg-dice-helper-compendium] ready: pack document count:", docCount, "first id:", docs[0]?.id);
    if (docCount === 0) {
      console.warn("[swrpg-dice-helper-compendium] Compendium is empty. Run 'npm run build' in the module folder and reinstall/update the module so the pack contains data.");
    }
  } catch (e) {
    console.log("[swrpg-dice-helper-compendium] ready: getDocuments error:", e);
  }

  console.log("[swrpg-dice-helper-compendium] ready: showing first-time setup Dialog");
  new Dialog(
    {
      title: DIALOG_TITLE,
      content: `
        <p>Create the <strong>Dice Helper</strong> journal in this world so
        <strong>FFG Star Wars Enhancements</strong> can show dice result spending tips for all skills.</p>
        <p>This will import the journal from the <strong>Dice Helper (All Skills)</strong> compendium
        and name it <code>${DEFAULT_JOURNAL_NAME}</code>, which matches the default setting in Enhancements.</p>
        ${docCount === 0 ? "<p class='notes'><strong>Compendium is currently empty.</strong> Run <code>npm run build</code> in the module source and reinstall the module, then use Module Settings → Reset setup state and reload.</p>" : ""}
        <p><strong>Set up now?</strong></p>
      `,
      buttons: {
        setup: {
          icon: "<i class=\"fas fa-check\"></i>",
          label: BUTTON_LABEL_SETUP,
          callback: async () => {
            console.log("[swrpg-dice-helper-compendium] setup button: starting import");
            try {
              const docs = await pack.getDocuments();
              console.log("[swrpg-dice-helper-compendium] setup button: getDocuments count:", docs.length);
              const entry = docs[0];
              if (!entry) {
                console.log("[swrpg-dice-helper-compendium] setup button: no entry, compendium empty");
                ui.notifications.warn("Dice Helper compendium is empty.");
                return;
              }
              console.log("[swrpg-dice-helper-compendium] setup button: importing id:", entry.id, "name:", entry.name);
              // Foundry v13: use the world collection's importFromCompendium so the document type matches (JournalEntry).
              const imported = await game.journal.importFromCompendium(pack, entry.id, { name: DEFAULT_JOURNAL_NAME });
              console.log("[swrpg-dice-helper-compendium] setup button: imported", !!imported, imported?.name);
              if (imported) {
                await imported.setFlag(MODULE_ID, CREATED_BY_MODULE_FLAG, true);
                console.log("[swrpg-dice-helper-compendium] setup button: set createdByModule flag on journal");
              }
              game.settings.set(MODULE_ID, "setup-done", true);
              const didSet = setEnhancementsJournal(DEFAULT_JOURNAL_NAME);
              console.log("[swrpg-dice-helper-compendium] setup button: done, setEnhancementsJournal:", didSet);
              ui.notifications.info(
                didSet
                  ? `Dice Helper journal created and Enhancements "Dice Helper Data" set to "${DEFAULT_JOURNAL_NAME}".`
                  : `Dice Helper journal "${DEFAULT_JOURNAL_NAME}" created. Enable FFG Star Wars Enhancements and use Module Settings → "Set Enhancements setting…" to point it at this journal.`
              );
            } catch (err) {
              console.log("[swrpg-dice-helper-compendium] setup button: error", err);
              console.error("[swrpg-dice-helper-compendium] setup:", err);
              ui.notifications.error("Failed to create Dice Helper journal. See console.");
            }
          }
        },
        skip: {
          icon: "<i class=\"fas fa-times\"></i>",
          label: BUTTON_LABEL_SKIP,
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
