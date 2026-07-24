# PLAY.1 — Accelerated Everyday Interaction Benchmark

## Goal

Combine the first object-use, seating, food/drink, wardrobe and persistence milestones into one playable release while keeping the Intel 4th-generation laptop as the performance gate.

## Included

- Click-to-hold teddy, book, apple and cup
- Compact use/drop interaction tray
- Item-specific reactions with distinct poses: hug, read, eat and drink
- Consumable apple with lightweight timed respawn
- Clickable sofa with walk-to-seat, sitting and standing poses
- Three Khadija outfit colours selectable from the wardrobe or HUD
- Existing drag-and-snap room arrangement retained
- Save migration from FOUNDATION.1 and FOUNDATION.2
- Saved held item, outfit and seated state
- Existing adaptive, low and balanced graphics presets
- Existing WAMP build/deployment workflow

## Deliberate limitations

- Procedural placeholder characters remain in use
- Gestures are lightweight transform animations, not final skeletal clips
- Clothing swaps change the hoodie material rather than replacing garment meshes
- Food use is a benchmark interaction, not a recipe system
- One active playable character
- One active room

## Approval tests

- [ ] `npm run dev` starts without TypeScript errors
- [ ] `npm run deploy:wamp` completes
- [ ] Teddy, book, apple and cup can each be clicked and held
- [ ] Dragging a holdable does not accidentally pick it up
- [ ] Use and Drop buttons enable only when an item is held
- [ ] Teddy hug, book reading, apple eating and cup drinking each use a visibly distinct forward-facing pose
- [ ] Apple returns to the fruit bowl after being eaten
- [ ] Sofa click walks Khadija to the seat and applies the sitting pose
- [ ] Floor click or movement keys stand Khadija up
- [ ] W/Up moves toward the top of the room and S/Down moves toward the bottom
- [ ] Pink, teal and yellow outfits work from both the wardrobe and HUD
- [ ] Outfit, held item and seated state survive refresh
- [ ] Existing cupboard, lamp, prop and movement saves still work
- [ ] Adaptive mode remains responsive on the designated older laptop
- [ ] Browser console has no recurring errors

## Next combined release

**WORLD.1 Accelerated** should replace the single-room-only structure with a room manager and add a second playable bedroom/wardrobe location. It should reuse the same Khadija interaction state and preserve low-spec loading discipline.
