# PLAY.3 Accelerated — Everyday Play Systems

PLAY.3 deepens the existing dollhouse play loop with small, visible world slots
instead of inventory screens or simulation-heavy systems.

## Recipes

Recipes are defined in `combinationRegistry.ts` and resolved only when the player
places an ingredient at a preparation station. The initial set is fruit bowl
(apple and banana), sandwich (bread and cheese), toast (bread and toaster),
fruit juice (berries and blender), cupcake (cake mix and oven), and warm tea
(tea leaves, cup, and kettle).

Ingredients begin on persistent refrigerator or cupboard shelves. Completed
food remains a normal holdable object, so it can be carried, tasted, shared, or
handed to another playable character or appropriate NPC.

## Storage and containers

Cupboards, drawers, refrigerator shelves, wardrobe shelves, toy storage, the
café display, and the return tray use capacity-limited ordered contents.
Backpacks, baskets, and serving trays keep up to three contents and show small
visible fill markers. Their contents travel with the container and survive room
changes and refreshes.

## Everyday routines

- The home supports table and counter wiping plus dish washing.
- The bedroom has a compact hygiene nook for hand washing, tooth brushing,
  clothed bubble-bath play, towel drying, and mirror smiles.
- Books and clothes can be tidied into their bedroom areas.
- The Together button chooses a nearby family member and provides reading,
  toy play, food/drink sharing, or a high-five.

## Save migration

The world save is version 9. Versions 8, 7, and 6 keep all existing character,
NPC, content, room, placement, lighting, outfit, expression, held-item, audio,
living-character, and picture-detail state. PLAY.3 fields receive safe defaults.
Malformed or duplicated slot contents are repaired while keeping the first
valid owner and the stored order.

## Performance

Recipe checks happen only after placement events. Storage and container
visuals update only after an interaction. Hygiene and cleaning use short
transform gestures and the existing pooled UI sparkle effect. Inactive rooms
retain no new update loops, physics, fluids, particle systems, or dependencies.
