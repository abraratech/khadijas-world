# PERF.1 — Startup Bundle Splitting

## Baseline

The diagnostic build produced a roughly 6.6 MB minified entry chunk. The bundle
report showed broad Babylon core, WebGPU, XR, physics, Gaussian splatting, node
materials, post-processing, and the complete glTF loader graph in the startup
path.

## Changes

1. Babylon glTF loader registration is now requested through one cached dynamic
   import. Character and furniture loading share the same promise.
2. Vite 8 / Rolldown code splitting creates bounded Babylon loader, Babylon
   core, and game-runtime chunks.
3. Strict execution order remains enabled because Babylon uses module side
   effects for feature registration.
4. `npm run check:bundle` rejects JavaScript chunks larger than 500 KiB.
5. `npm run build:verified` performs the normal build followed by the bundle
   budget check.

## Validation

```powershell
npm run validate:assets
npm run check
npm test
npm run build:verified
```

The build should no longer print Vite's larger-than-500-kB chunk warning. The
bundle checker prints the ten largest generated JavaScript files.

## Manual regression checks

- Start a new world and load an existing save.
- Confirm Khadija's production GLB loads on Medium and High.
- Confirm procedural fallback remains available.
- Visit rooms containing imported furniture.
- Move between all locations.
- Reload from WAMP or another relative subpath deployment.

## Scope

This milestone changes loading and output organization only. It does not change
save schema, gameplay IDs, visual profiles, interactions, or asset files.
