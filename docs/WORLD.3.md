# WORLD.3 Accelerated

WORLD.3 expands Khadija's neighborhood with a park, a grocery shop, four new NPCs,
and a fully offline bounded conversation system.

## Locations

- The park includes benches, picnic seating, slide, swings, sandbox, fountain,
  flowers, birds, sign, bin, camera, watering can, and picnic basket.
- Sunny Basket Grocery includes fictional shelf products, produce, chilled goods,
  a shopping basket, checkout interaction, and reusable shopping bag.

## Save migration

Save schema 10 adds `world3` and `dialogue`. Saves from versions 6 through 9 and
older legacy keys retain characters, locations, held items, rooms, NPCs, everyday
state, audio, and graphics. Missing or malformed WORLD.3 fields are normalized to
safe defaults. NPC memory lists and transcripts are bounded during load.

## Low-spec behavior

The new locations use shared simple materials and low-segment procedural meshes.
Only the active location receives full playable-character and NPC updates. Dialogue
recognition runs only on message submission. Physical Intel HD 4400/4600 validation
remains required before claiming the 30 FPS target.
