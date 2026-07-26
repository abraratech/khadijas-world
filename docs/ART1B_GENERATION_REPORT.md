# ART.1B Generation Report

Generated from the uploaded ARCHITECTURE.1 / ART.1A source snapshot on
25 July 2026.

## Implemented

- Included the ART.1A scale and outfit-persistence corrections.
- Added rounded single-mesh home furniture generation.
- Polished the family-home hero furniture and kitchen silhouettes.
- Added quality-controlled decorative trim and soft shadows.
- Upgraded teddy, book, apple, cup, plate, bowl, and serving-tray visuals.
- Added data-driven hold scale, offsets, rotations, footprints, and hold types.
- Preserved schema 12 and stable gameplay IDs.
- Updated release metadata, documentation, credits, tests, and package version.

## Automated validation completed in the generation environment

- Parsed all project JSON files.
- Transpiled all 56 TypeScript files with the TypeScript compiler API: no
  syntax diagnostics.
- Ran a full project structural type check with temporary local declarations for
  unavailable Babylon/Vite/Vitest packages: passed, including unused-symbol
  checks.
- Ran a stricter targeted type check for the new item and home visual modules:
  passed.
- Ran `node scripts/validate-assets.mjs`: passed for the production Khadija GLB.

## Validation not available in the generation environment

The package registry was unavailable, so dependencies could not be installed
reliably. Therefore the real commands below must be run on the Windows source
repository before approval:

```powershell
npm install
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

Browser visual inspection, item-hand calibration, and Intel HD performance are
also manual approval gates.
