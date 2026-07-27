# ART.1E Hero-Style Procedural Cast

ART.1E replaces the visibly mismatched Quaternius runtime characters with a
shared, custom procedural character language. Khadija and Mama remain the two
approved Meshy hero assets. The family companions and world NPCs use lightweight
Babylon geometry designed specifically for Khadija's World.

## Active visual roster

- Khadija — Meshy GLB on Medium/High, procedural fallback on Low or failure
- Mama — Meshy GLB on Medium/High, hero procedural fallback
- Little sister — hero procedural toddler
- Brother — hero procedural child
- Auntie Noor — hero procedural neighborhood resident
- Ms. Sana — hero procedural café worker
- Mr. Sami — hero procedural park keeper
- Auntie Layla — hero procedural caregiver
- Mr. Kareem — hero procedural shopkeeper
- Mrs. Huda — hero procedural older shopper

## Visual improvements

The shared `applyHeroCharacterPolish` layer adds:

- character-specific skin, hair, eye, outfit, accent, and shoe palettes
- layered irises, eye highlights, ears, lashes, and accessories
- bespoke hair silhouettes including double buns, fluffy crop, bob, low bun,
  wrapped scarf, garden crop, silver bob, and neat crop
- dress, tunic, apron, cardigan, work-shirt, and hoodie overlays
- collars, cuffs, shoulder caps, buttons, pockets, badges, scarf tails, hats,
  glasses, earrings, and chef cap
- rounded shoe toes and laces
- age-specific head, shoulder, torso, and leg proportions
- shared low-spec materials without image textures or transparency

## Stable gameplay behavior

The visual pass does not change:

- character or NPC IDs
- save schema
- room ownership
- movement bounds
- dialogue activation
- memory and relationships
- item giving and held-item state
- seating and sleeping
- fallback behavior

The unused Quaternius definitions and files remain in the source temporarily for
license auditing and rollback, but they are not in the active runtime registry.
They may be removed in a later cleanup after ART.1E is approved.
