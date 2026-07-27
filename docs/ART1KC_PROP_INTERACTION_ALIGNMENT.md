# ART.1K-C — Production Prop and Interaction Alignment

ART.1K-C refines the existing procedural handled-item system without changing
item IDs, save schema, room ownership, dialogue, recipes, or storage keys.

## Problems addressed

Before this pass, every held object was parented to the procedural rig's right
hand. That worked for cups and apples but caused books, teddy bears, trays, and
baskets to inherit one wrist's rotation. Prop scale also remained identical for
toddlers, children, and adults. Character handoffs reparented the mesh but did
not explicitly clear the giver's persistent held-item arm pose.

Portable containers accepted other portable containers, allowing nested
ownership states that were difficult to reason about and visually misleading.

## Runtime changes

- Adds a torso-centered `carryAnchor` to every character rig.
- Adds persistent held-item pose state for one-hand, two-hand, hug, read, and
  tray presentations.
- Selects the hand or center anchor from presentation metadata.
- Applies toddler, child, and adult transform adjustments.
- Keeps centered items framed by both arms during idle and walking.
- Clears held-item pose state during drops, NPC clearing, and sibling handoffs.
- Adds pure container compatibility rules outside the rendering layer.
- Prevents nested containers.
- Restricts the serving tray to food, drinks, and dishes.
- Preserves the existing toy-box rule.

## Presentation coverage

The registry explicitly covers:

- teddy
- book
- apple
- cup
- cupcake
- sandwich
- toy block
- serving tray
- prep plate
- mixing bowl
- backpack
- basket
- shopping basket
- shopping bag
- picnic basket

Items without an explicit presentation continue to use their existing prototype
hold scale, offset, rotation, and gesture.

## Compatibility

ART.1K-C does not change:

- save version or save keys
- item IDs
- character or NPC IDs
- storage and container IDs
- recipe definitions
- room bounds
- dialogue or memory events
- production asset paths
- procedural fallback behavior
