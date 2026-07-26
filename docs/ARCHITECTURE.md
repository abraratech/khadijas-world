# Architecture

## World creation

`src/game/createPrototypeRoom.ts` remains the stable public entry point. It
delegates to `src/game/world/createWorld.ts`, the small world coordinator. The
coordinator calls `createWorldRuntime`, which owns only the cross-location
systems that must share state: transitions, player/companion and NPC registries,
holding/hand-offs, recipes, storage, autonomy, camera, lighting, save callbacks,
and quality controls.

The runtime intentionally keeps these coupled gameplay systems together for this
mechanical refactor. It is the largest remaining module and the primary
candidate for later extraction by system, after ART.1 has a stable asset
contract.

## Typed contexts and ownership

Public world callbacks and results live in `world/WorldContext.ts`. Each location
receives a focused typed context containing only its scene, shared materials,
position transform, relevant save state, detail-mesh collection, and player
feedback callback.

`WorldRegistry` owns location lifecycle order. Activating a location deactivates
the previous one before activating the next. The current game keeps activation
hooks behavior-neutral because every location has always remained resident in a
single scene; the hooks provide an explicit extension point without changing
runtime behavior.

`DisposableBag` owns cross-module callbacks such as engine resize observation
and shared door interactions. Scene observers and mesh action managers created
inside a builder are owned by that builder's scene/root and are released when
the root or scene is disposed. World disposal is idempotent: shared callbacks
are removed, location roots are disposed, then the scene is disposed.

## Location-builder contract

Builders return `LocationBuildResult`:

- stable save-compatible `id`
- zero-transform location `root`
- interactive mesh references
- seat and placement-slot references
- `activate`, `deactivate`, and `dispose` hooks

Builders create only their own location geometry and self-contained
interactions. References needed by shared systems are explicit additions to the
builder result, such as the bedroom bed hotspot or café pastry hotspot. A
builder must not inspect another location's private mesh tree.

Current builders:

- `locations/familyHome/buildFamilyHome.ts`
- `locations/bedroom/buildBedroom.ts`
- `locations/street/buildStreet.ts`
- `locations/cafe/buildCafe.ts`
- `locations/park/buildParkLocation.ts`
- `locations/grocery/buildGroceryLocation.ts`

`world3Locations.ts` is a compatibility aggregator for existing park/grocery
callers; geometry ownership remains in the two individual builders.

## Shared materials and helpers

`shared/createMaterials.ts` creates one typed `WorldMaterialRegistry` per world.
The names, colors, emissive values, specular values, and alpha values match the
pre-refactor implementation. Location builders receive that registry rather
than recreating shared materials.

`shared/meshHelpers.ts` owns standard box/cylinder construction, blob shadows,
and rotation animation. `locations/familyHome/homeVisualHelpers.ts` adds the
single-mesh rounded-cuboid and home-only soft-detail helpers used by ART.1B.
`shared/placementHelpers.ts` owns snap targets and drag placement.
`shared/interactionHelpers.ts` owns reusable pick registration and callback
disposal. `shared/interactionSlotRegistry.ts` supplies pure exclusive slot
behavior.

`items/productionItemVisuals.ts` owns lightweight hero-item construction plus
the data-driven hold presentation registry. Gameplay continues to use stable
item IDs while visual scale, offset, rotation, footprint, and hold type are
resolved from this module.

## Character-visual contract

`characters/createCharacterVisual.ts` owns primitive construction, proportions,
hair, face, outfit material, expressions, movement, idle behavior, use
gestures, selection, seating, sleeping, and held-item positioning.

Each rig exposes stable semantic references for the visual root, body, head,
eyes, mouth, arms, hands, outfit meshes, held-item anchor, seat anchor, and sleep
anchor. Shared gameplay uses the rig API and semantic references rather than
discovering raw primitive names.

Existing character IDs (`khadija`, `sister`, `brother`), outfits, expressions,
movement, animation behavior, and save data remain stable. Khadija is the only
playable ID; sister and brother are persistent companions that reuse the existing
logical rig and save-compatible state.

## Production character asset layer

`assets/characterAssets.ts` is the typed manifest-facing registry for production
character files. `assets/productionCharacterVisual.ts` loads the Meshy GLB,
parents it to Khadija's existing authoritative gameplay root, maps semantic walk
and run actions, and toggles it against the procedural visual. Pink, teal, and yellow variants
swap optimized textures on the imported PBR material without replacing the
model. The procedural rig continues to own movement, bounds, item anchors,
selection, seating, sleeping, state restoration, and unsupported specialist
poses.

Asset URLs resolve from `document.baseURI`, preserving both the Vite root and the
WAMP `/khadijas-world/` subpath. A load or animation failure is non-fatal and
restores the procedural model. Production assets are validated by
`scripts/validate-assets.mjs` against `art/ASSET_MANIFEST.json`.

## Adding a location

1. Add the stable `RoomId` only as part of an intentional save-schema change.
2. Create a builder under `src/game/locations/<location>`.
3. Accept a focused typed context and the shared material registry.
4. Parent top-level meshes to a zero-transform root.
5. Return the `LocationBuildResult` contract plus explicitly typed shared
   references.
6. Register the result with `WorldRegistry`, add its transition wiring, and add
   pure ID/lifecycle tests.
7. Exercise all transitions, save restoration, low-spec settings, touch input,
   disposal, and WAMP deployment.

## Adding a character visual

1. Preserve or intentionally migrate the stable `CharacterId`.
2. Add data-driven visual values to `characterVisuals.ts`.
3. Construct semantic parts in `createCharacterVisual.ts`; do not make gameplay
   search primitive mesh names.
4. Keep outfit, expression, held-item, seat, sleep, and animation controllers on
   the rig contract.
5. Add semantic-key and save-ID regression coverage.

## Known remaining large modules

- `world/createWorldRuntime.ts` still contains cross-location gameplay wiring
  for holding, recipes, storage, NPC behavior, seating, transitions, and input.
- `storage.ts` remains the central save normalization and migration module.

These are documented risks, not duplicated location or character construction.
Future extraction should remain mechanical and land separately from art,
content, or schema changes.

## ARCHITECTURE.1 validation snapshot

The pre-refactor baseline and final branch were both checked with `npm test`,
`npm run build`, and `npm run deploy:wamp`.

| Measure | Baseline | Final |
| --- | ---: | ---: |
| Automated tests | 15 passing | 21 passing |
| World entry point | 4,804 lines | 25 lines |
| Main production JavaScript | 5,102.56 kB | 5,108.65 kB |
| Main production JavaScript, gzip | 1,151.38 kB | 1,153.37 kB |
| Production CSS, gzip | 7.05 kB | 7.05 kB |

The main JavaScript difference is +6.09 kB minified (+0.12%) and +1.99 kB
gzip (+0.17%). Browser regression showed instant in-scene location changes,
one active location selection, restored save state, no console errors, and no
duplicate player-facing controls after title return and continue. The existing
large-chunk advisory remains unchanged; no new build warning was introduced.

Measured physical-device FPS and long-session heap profiling remain part of the
hardware regression checklist. This mechanical refactor does not add assets,
network requests, render loops, save fields, or gameplay systems.

## ART.1D production character loading

Production character artwork is registered in
`src/game/assets/characterAssets.ts` and attached to the existing procedural
`CharacterRig` roots through `createProductionCharacterVisual`.

The ART.1D loading policy is location-aware:

- hero home assets may start during title-screen world construction
- Brother loads when his saved room is active
- world NPCs load on the first visit to their own location
- loaded visuals remain attached and cached for return visits
- a missing/failed asset keeps the procedural visual active

The logical character/NPC root remains authoritative for movement, bounds,
click metadata, held items, save state, dialogue, and relationships. GLBs are a
replaceable visible layer, not gameplay state.
