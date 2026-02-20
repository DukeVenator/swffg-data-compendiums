# SWRPG Dice Helper Compendium

Dice-helper data for **all skills** (FFG Star Wars) in a Journal compendium. Works with [FFG Star Wars Enhancements](https://github.com/wrycu/StarWarsFFG-Enhancements) when you click “Help me spend results” on a roll, it’ll have suggestions for every skill, not just combat.

Foundry v13 only. Needs the [Star Wars FFG](https://github.com/StarWarsFoundryVTT/StarWarsFFG) system.

## Install

1. In Foundry, go to **Add-on Modules** → **Install Module**.
2. Paste this **Manifest URL** and click **Install**:

   ```
   https://raw.githubusercontent.com/DukeVenator/swffg-data-compendiums/main/module.json
   ```

   If that fails (e.g. “does not provide a download URL” or network error), try this CDN mirror:

   ```
   https://cdn.jsdelivr.net/gh/DukeVenator/swffg-data-compendiums@main/module.json
   ```

3. Enable **SWRPG Dice Helper Compendium** in your world’s module list.

## Why this exists

Enhancements’ Dice Helper shows tips for spending advantage, threat, triumph, etc. The main module didn’t ship that text for every skill (copyright / size). This module is just the data in a compendium so you can pull it in and point Enhancements at it.

## How to use it

1. Install and enable **SWRPG Dice Helper Compendium** in your world.
2. A one-time setup popup will offer to create the journal for you—hit **Set up** and it imports the compendium entry and names it `dice_helper`. If you skipped it, open the Compendium tab, find **Dice Helper (All Skills)**, and import that journal yourself.
3. In **Game Settings → Module Settings → FFG Star Wars Enhancements**, set **Dice Helper Data** to the journal name (default is `dice_helper`, so if you used the wizard you’re already good).

Done. “Help me spend results” will now have tips for all skills.


## Building the pack (if you’re hacking on this repo)

```bash
npm install
npm run build
```

That reads `src/data/dice_helper.json`, turns it into a Journal entry, and compiles the LevelDB pack into `packs/dice-helper/`. Commit the built `packs/` folder so releases work without users having to run the build.

## Releasing

**Local:** `npm run release` runs the build and creates `dist/swrpg-dice-helper-compendium.zip` (same contents the GitHub workflow would pack). Use it to test the zip or upload a release manually.

**GitHub:** Push a tag like `v1.0.0`—the **Release** workflow builds, zips the module, and attaches the zip to the GitHub release. You can also run **Actions → Release → Run workflow** and optionally type a version; otherwise it uses the one in `package.json`. Bump `version` in `module.json` and `package.json` before you tag if needed.


The tip text is community reference for the FFG game; we’re not claiming any official content.
