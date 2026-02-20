# Changelog

All notable changes to this project are documented here.

## [1.1.4] - 2025-02-20

### Added

- **Test suite** — Vitest tests for data schema, build journal, pack content (extractPack round-trip), setup helpers (constants and logic with mocked `game`), and UI (template structure and CSS). Coverage enforced at 80% for `scripts/lib/`.
- **CI** — Test workflow runs on every push and pull request to `main`/`master`; failures block merges. Release workflow runs tests with coverage before building and publishing.
- **README badges** — Build status, latest release version, and test coverage via [Shields.io](https://shields.io/). Coverage percentage is parsed from the Test workflow shell output and written to `coverage-badge.json` (Shields endpoint badge); the workflow commits it on `main` so the badge stays up to date.
- **Setup helpers** — Extracted `scripts/lib/setup-helpers.mjs` with constants and pure functions (`isJournalCreatedByUs`, `setEnhancementsJournal`) so setup-wizard behaviour is unit-testable without Foundry.

### Changed

- **Release** — Version bump and tagged release `v1.1.4`. No changes to module behaviour or content.
- **Coverage badge** — Replaced Codecov with a script that parses Vitest coverage from the Actions log and writes a Shields.io endpoint JSON; job summary shows a coverage table and the README badge displays the current percentage.

---

## [1.1.3] - 2025-02-20

### Fixed

- **Settings menu (init crash)** — Replaced custom Dialog class with a proper `FormApplication` subclass for the "Point Enhancements at journal" menu so `game.settings.registerMenu` accepts it on Foundry v13. Fixes: "You must provide a menu type that is a FormApplication or ApplicationV2 instance or subclass".
- **Empty compendium** — Build now adds the required `_key` field to the journal and its page so `@foundryvtt/foundryvtt-cli` `compilePack` includes documents in the LevelDB pack. The compendium now contains the Dice Helper journal after `npm run build`.
- **Import error in v13** — Setup wizard now uses `game.journal.importFromCompendium(pack, id, updateData)` instead of `pack.importDocument(id)` so the imported document is correctly treated as a JournalEntry. Fixes: "You may not import a String Document into ... Compendium which contains JournalEntry Documents".

### Added

- **Own journal detection** — Journals created by this module are flagged (`createdByModule`). The wizard only considers setup "done" when that journal exists, so a same-named journal from another module no longer skips the wizard incorrectly.
- **Reset setup state** — New world setting (Module Settings) to clear setup state and the module flag from journals so the first-time wizard can show again (e.g. after fixing an empty compendium and reinstalling).
- **Templates in release** — The release zip now includes the `templates/` folder so the Point Enhancements settings menu works when installed from the manifest.
- **Console logging** — Build script and setup wizard log progress and decisions to the console (prefixed `[build]` / `[swrpg-dice-helper-compendium]`) to help debug empty compendium or wizard not showing.

### Changed

- First-time setup dialog shows a note when the compendium has zero documents, with instructions to run `npm run build` and use Reset setup state.

---

## [1.1.2] - 2025-02-14

### Fixed

- **Release workflow** — Wait 5 minutes after creating the GitHub release before updating the manifest on main, so the release zip is available before the download URL is published.

---

## [1.1.1] - 2025-02-14

### Fixed

- **Manifest install** — Added top-level `manifest` URL in `module.json` so Foundry reliably finds the manifest for install/update. Fixes “does not provide a download URL” on some setups.
- **README** — Added jsDelivr CDN as fallback Manifest URL when raw GitHub fails.

### Changed

- Release workflow now sets `manifest` when updating `module.json` on main.

---

## [1.1.0] - 2025-02-14

### Added

- **Manifest install** — README now includes a Manifest URL for installing the module directly from Foundry (Add-on Modules → Install Module).
- **Download URL in manifest** — `module.json` includes a `download` URL so Foundry can install from the manifest without "does not provide a download URL" errors.
- **Release workflow** — After each tagged release, the workflow updates `module.json` on `main` so the manifest always points at the latest release zip.

### Changed

- Release workflow now uses a token for checkout so it can push the post-release manifest update.

---

## [1.0.0] - 2025-02-14

### Added

- Initial release.
- Journal compendium **Dice Helper (All Skills)** with spending suggestions for advantage, threat, triumph, despair, and light/dark side for every FFG Star Wars skill.
- One-time setup wizard to create and link the `dice_helper` journal for FFG Star Wars Enhancements.
- Compatibility: Foundry v13, Star Wars FFG system.
