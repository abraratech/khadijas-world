# ART.1K-D Test Reliability and Visual Regression Foundation

ART.1K-D restores the full automated test gate by supplying a test-only
`OffscreenCanvas` surface for Babylon `DynamicTexture` construction under
Vitest's Node environment.

## Scope

- Add `vitest.config.ts` with a reusable setup file.
- Add `src/test/setupOffscreenCanvas.ts`.
- Keep `createWorldPlaque` production rendering unchanged.
- Continue constructing the real Babylon `DynamicTexture` in tests.
- Preserve meaningful orientation, culling, texture-size, and alpha assertions.
- Avoid native canvas packages and browser emulation dependencies.

## Why this is test-only

The browser already supplies the real canvas APIs used at runtime. Babylon's
headless `NullEngine` still creates a canvas when a `DynamicTexture` is
constructed. Node does not provide `OffscreenCanvas` in every supported test
environment, so Vitest installs the smallest surface required by the plaque
renderer before test modules are imported.

## Validation

```powershell
npm run check
npm test
npm run build
```

Expected test result: all test files and tests pass, including
`src/game/readability/createWorldPlaque.test.ts`.

## Regression checks

Run the application and confirm that room and object plaques:

- face the fixed dollhouse camera;
- never display mirrored lettering through the back face;
- retain rounded backgrounds and borders;
- preserve custom rotations where supplied;
- render correctly in the production browser build.
