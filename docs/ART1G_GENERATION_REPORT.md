# ART.1G Generation Report

## Package

- Repository package version: `0.19.0`
- Public version: `0.1.9`
- Build: `art-1g-family-home-high-quality`
- Base: ART.1F source package

## Implemented

- Added `applyFamilyHomeHighPolish.ts` as a dedicated visual-only High detail
  layer for the family home.
- Replaced the previous generic home section of the shared world-polish pass with
  the dedicated ART.1G pass.
- Added architecture, window, living-room, media, kitchen, domestic-staging, and
  restrained environmental-motion layers.
- Kept every new mesh non-pickable and registered through `detailMeshes`.
- Preserved High/Low behavior through the existing quality system.
- Added the ordered production roadmap through ART.1O.
- Updated release metadata and documentation.

## Validation completed in the packaging environment

- Production asset validator passed for seven recorded GLBs.
- All 62 TypeScript files passed syntax transpilation.
- The new ART.1G module and its direct local dependencies passed strict semantic
  checking with local external-module declarations.
- All JSON files parsed successfully.
- The update and full-source ZIPs passed ZIP integrity checking.

## Validation not completed here

`npm ci` could not complete in the packaging environment because dependency
retrieval timed out. Therefore the following remain required on the Windows
project machine:

- real project `tsc --noEmit` using installed Babylon.js declarations;
- Vitest test suite;
- Vite production build;
- WAMP deployment;
- rendered visual review;
- physical High and Low performance checks.

## Manual approval focus

- Confirm decorative geometry does not visually overlap Khadija, Mama, NPCs,
  interactive props, the sofa seats, cupboard door, TV interaction, or kitchen
  hotspots.
- Confirm High presents the complete pass and Low hides it.
- Confirm curtain, steam, clock, plant, and emissive movement remain subtle.
- Confirm the room is visually improved enough to serve as the benchmark for
  ART.1H–ART.1J.
