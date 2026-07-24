# WORLD.2 — Neighborhood Accelerated

## Goal

Expand the benchmark from a two-room home into a small playable neighborhood while retaining the older-laptop performance target.

## Included locations

- Family home
- Khadija's bedroom
- Neighborhood street
- Sunny Café

## Included play systems

- Four-location HUD navigation
- Clickable doors between home, street, bedroom and café
- Saved active location and location-specific character position
- Street bench seating
- Simple scooter ride sequence
- Café chair seating
- Pastry display interaction
- Cupcake and sandwich holding, eating and respawning
- Café drink service using the existing cup system
- Cross-location item carrying and placement targets
- Location-aware lighting for indoor and outdoor scenes
- Migration from WORLD.1 saves

## Performance strategy

All locations exist in one Babylon.js scene at separated world offsets. The orthographic camera targets only the active location, allowing Babylon.js frustum culling to keep the active-mesh count low without introducing room-loading delays. Decorative road markings and menu details remain disabled in low and adaptive presets.

## Approval gate

1. Existing WORLD.1 save loads without losing outfit, held item or object placement.
2. All four location buttons work.
3. Teal doors reach their stated destinations.
4. Khadija can walk in every location without crossing its bounds.
5. Street bench, scooter, café chair, pastry case and drink machine respond.
6. Cupcake and sandwich can be held, eaten and respawned.
7. Held items can travel between locations and remain saved.
8. Adaptive mode remains near the 30 FPS target on the designated older laptop.
9. `npm run deploy:wamp` passes.
