# Changelog

All notable changes to this project are documented here.

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
