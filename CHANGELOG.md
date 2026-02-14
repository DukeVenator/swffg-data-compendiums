# Changelog

All notable changes to this project are documented here.

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
