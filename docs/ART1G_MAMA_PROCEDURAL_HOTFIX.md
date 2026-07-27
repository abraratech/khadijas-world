# ART.1G Mama Procedural Visual Hotfix

## Decision

Mama now uses the hero-style procedural visual on every graphics preset.

Her Meshy GLB remains in the repository as an archived rollback asset, but it is
not registered in `PRODUCTION_NPC_ASSETS` and is therefore never requested by
the runtime.

## Why

The supplied Mama GLB contains a walking clip but no genuine idle, talking,
gesturing, sitting, or item-use animation. Holding a corrected frame while idle
removed the A-pose, but it still made Mama look static beside the procedural
characters.

The procedural rig already supports:

- breathing and idle movement;
- blinking and looking around;
- walking;
- facial expressions;
- talking reactions;
- carrying and handing over items;
- sitting and everyday gestures.

Mama keeps the stable `parent` NPC ID, saved position, dialogue memory,
friendship, gifts, movement bounds, seat assignment, and interactions.

## Visual tuning

The procedural Mama profile remains teal, adult-proportioned, and family
oriented. Her root scale is now `1.08`, making her slightly taller than the other
procedural adults without affecting room coordinates or save data.

## Rollback

The archived definition and file remain at:

- `src/game/assets/characterAssets.ts` — `MAMA_PRODUCTION_ASSET`
- `public/assets/characters/mama/mama-v1.glb`

Re-registering `parent: MAMA_PRODUCTION_ASSET` would restore the imported visual.
