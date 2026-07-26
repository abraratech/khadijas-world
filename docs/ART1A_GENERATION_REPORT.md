# ART.1A Generation Report

Generated from the user-supplied ARCHITECTURE.1 project ZIP and Meshy animated
GLB on 25 July 2026.

## Completed in this update

- Added the production Khadija GLB and typed asset registry.
- Added lazy Babylon GLB loading with procedural fallback.
- Mapped the supplied `Walking` and `Running` animation groups.
- Made Khadija the sole player while retaining sister/brother companion state.
- Added schema-12-compatible selected-sibling normalization.
- Added asset manifest, SHA-256 validation, tests, UI copy, and documentation.

## Automated checks run in the generation environment

- `node scripts/validate-assets.mjs`: passed.
- TypeScript source transpilation/syntax check: 52 files, zero syntax diagnostics.
- ZIP integrity test after packaging: required before delivery.

## Checks that still require the Windows development machine

The generation environment could not reach the npm registry, and the uploaded
source did not contain `node_modules`. Therefore full dependency-aware commands
were not run here. Run the following after extracting the update:

```powershell
npm install
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

Complete the ART.1A manual section in `docs/REGRESSION_CHECKLIST.md`, especially
model scale/orientation, walking loop, WAMP hard refresh, missing-asset fallback,
and physical older-laptop performance.

## Approval status

This is an ART.1A integration candidate, not an `art-1-approved` release. Do not
create the approval tag until automated and manual Windows/WAMP checks pass.
