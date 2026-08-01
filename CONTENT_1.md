# CONTENT.1 — Neighborhood Adventures

Khadija's World 0.26.0 adds an optional Adventure Book on top of the existing
open-ended dollhouse play. Adventures never lock rooms or objects. They simply
notice meaningful play moments and celebrate them with stars and stickers.

## Adventure set

1. Home Helper
2. Story Time
3. Kitchen Creator
4. Self-Care Star
5. Neighborhood Friend
6. Scooter Story
7. Sunny Café Helper
8. Park Caretaker
9. Playground Fun
10. Picnic Planner
11. Smart Shopper
12. Photo Story
13. World Explorer

The set covers all six locations and reuses the existing authoritative
interactions. Completing an adventure once earns its stars and sticker.
Repeating it records an encore moment without blocking free play.

## Save behavior

Adventure progress lives inside the existing `ContentState` save envelope:

- completed adventure IDs
- visited rooms
- derived star total
- derived sticker labels
- currently suggested adventure
- repeatable encore counts

Normalization removes unknown IDs, clamps counts, recomputes rewards, and chooses
a valid unfinished adventure after upgrades or imported saves.

## UI behavior

The book button appears in the top-right game controls. The panel shows:

- total progress and stars
- the next suggested adventure
- a direct travel button for location-specific adventures
- all adventure cards
- earned stickers
- repeatable encore moments

The panel uses normal semantic buttons, visible focus, live progress updates,
safe-area-aware sizing, reduced-motion support, and high-contrast borders.

## Dialogue

Suggested topics now include specific story ideas for Home, Bedroom,
Neighborhood, Sunny Café, Park, and Sunny Basket. Rule-based replies include
more varied child-safe encouragement and Adventure Book guidance.

## Validation

`npm run content:check` verifies the Adventure Book source, UI markers, save
fields, dialogue coverage, release metadata, and public notes. CONTENT.1 uses
TypeScript, production build, PWA artifact, bundle budget, release audit, and
Cloudflare Pages Functions compilation as deterministic gates. Browser
automation is not a publishing gate.
