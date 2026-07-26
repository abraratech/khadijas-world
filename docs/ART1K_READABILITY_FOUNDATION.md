# ART.1K Readability Foundation

## Problem

Khadija is the only playable character, so a permanent selection ring no longer
communicates a choice. Many small procedural props also share similar box,
cylinder, and sphere silhouettes. At dollhouse distance, color alone is not
enough to distinguish every appliance, product, container, or activity.

## Changes

### Khadija

- the floor selection ring is no longer created;
- the existing `setSelected` API remains as a compatibility no-op;
- movement, dragging, floor clicks, saves, outfit changes, expressions, and the
  production Khadija GLB are unchanged.

### Context labels

Interactive meshes can now carry three presentation-only metadata fields:

- `interactionLabel`;
- `interactionHint`;
- `interactionIcon`.

Mouse hover displays the label beside the pointer. Touch displays it briefly
when the object is tapped. The system walks parent nodes, so a child mesh can
inherit the description attached to its interactive root.

The labels do not create interactions. Existing action managers, pointer
observers, item IDs, NPC IDs, and room checks remain authoritative.

### High-quality play-set labels

High graphics adds decorative plaques for important visual categories:

- kitchen, oven, fridge, and toy box;
- sleep, wardrobe, wash, and toys;
- café menu, drinks, pastries, and toy corner;
- grocery produce, bakery, cold drinks, home care, and checkout.

The plaques use small dynamic textures, are non-pickable, and are included in
the existing decorative-detail collection. Low and Adaptive can disable them.
The hover/touch context labels remain available at every quality level because
they are a usability feature.

## Scope boundary

This is not the final prop-art pass. ART.1L will rebuild weak item silhouettes,
add packaging and surface detail, and improve pickup, carrying, handover,
eating, cooking, reading, shopping, and tidying feedback.
