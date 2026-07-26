# ART.1B — Family Home and Playable Item Polish

ART.1B establishes the first reusable environment-production style without
adding a new location or changing save data.

## Scope

- Family-home sofa, coffee table, TV unit, rug, curtains, fridge, counters,
  island, stools, cupboard, plants, trim, and decorative shadows
- Single-mesh rounded-cuboid helper for toy-like furniture silhouettes
- Production-style teddy, book, apple, cup, plate, mixing bowl, and serving tray
- Data-driven hold scale, offset, rotation, footprint, and hold type
- Pink, teal, and yellow Meshy outfit texture swapping retained from ART.1A

## Rendering approach

The home uses lightweight Babylon geometry and shared standard materials. Large
rounded furniture is generated as one mesh per object from six subdivided faces,
then projected onto an anisotropic rounded-box surface. This avoids external
asset downloads, texture memory, and the draw-call cost of stacking many boxes
and cylinders.

Decorative shadows, rug stripes, baseboards, sofa feet, and small trim are added
to the existing detail-mesh collection. Low quality may disable those details
while preserving the main furniture and all interactions.

## Item presentation registry

`src/game/items/productionItemVisuals.ts` records presentation data separately
from gameplay logic:

- floor height
- held scale
- held offset
- held rotation
- placement footprint
- semantic hold type

Items without an ART.1B entry continue to use their existing behavior. Stable
item IDs and save keys are unchanged.

## Compatibility

- Save schema remains 12.
- Room, character, NPC, outfit, item, recipe, and dialogue IDs are unchanged.
- Existing prop positions continue restoring by the same mesh names.
- Khadija remains the sole playable character.
- Sister and brother remain persistent companion NPCs.
- The Meshy visual remains available for pink, teal, and yellow outfits.
- Sitting, sleeping, unsupported specialist poses, Low quality, and load failure
  still use the procedural compatibility visual.

## Manual checks

1. Start New World and Continue an existing save.
2. Enter the family home on Low, Medium/Adaptive, and High.
3. Click the floor around the rug, sofa, island, and kitchen.
4. Sit in both sofa slots.
5. Toggle the television and cupboard.
6. Pick up, drop, drag, save, and reload the teddy, book, apple, and cup.
7. Confirm the item appears in front of Khadija and remains pickable after drop.
8. Use the plate, bowl, appliances, recipes, storage, and cleaning targets.
9. Carry the serving tray in Sunny Café.
10. Switch pink, teal, and yellow outfits and verify the Meshy visual remains.
11. Travel through every location and hard-refresh the WAMP build.

## Known limits

- The production Khadija model remains above the long-term triangle budget.
- The current model has no dedicated idle, sit, sleep, facial, or hand-pose
  animations.
- Held offsets are calibrated against the existing semantic anchor rather than
  a hand bone exposed by the Meshy model.
- ART.1B polishes the family home only; other locations retain their existing
  prototype geometry until later location passes.
- Physical performance on the designated Intel HD laptop remains a manual gate.
