# ART.1F Generation Report

## Scope

- Reviewed every direct `StandardMaterial` constructor in the ART.1E source.
- Replaced near-zero blanket specular settings with finish-aware values.
- Applied the same finish system to shared, hero, and decorative materials.
- Added cool fill / warm key light color separation.
- Reduced global ambient wash slightly.
- Added lightweight static contact shadows to major props outside the home.
- Added material-finish unit coverage.

## Constructor audit

Direct `StandardMaterial` creation exists in:

1. `src/game/shared/createMaterials.ts`
2. `src/game/characters/applyHeroCharacterPolish.ts`
3. `src/game/locations/shared/applyWorldArtPolish.ts`
4. The world hotspot material inside `createMaterials.ts`

All four paths are covered by ART.1F.

## Validation available in the generation environment

- TypeScript transpilation syntax check
- JSON parsing
- asset manifest validation
- package ZIP integrity
- source-level audit for direct StandardMaterial construction

The real Vite render, Vitest dependency run, production build, WAMP deployment,
and physical older-laptop performance test must be completed locally.
