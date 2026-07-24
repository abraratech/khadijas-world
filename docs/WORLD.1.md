# WORLD.1 Accelerated — Multi-room Home

WORLD.1 combines the first location-expansion releases into one build. It proves that Khadija, held objects, room state and low-spec rendering can work across more than one playable space.

## Included

- Family home living room and kitchen
- Khadija's bedroom as a second full dollhouse zone
- Instant room switching through teal doors or the location tray
- Camera and movement bounds that follow the active room
- Persistent active room and return position
- Held items travelling with Khadija between rooms
- Bedroom placement targets for the teddy, book, plant, apple and cup
- Usable bed for sitting/relaxing
- Clickable bedroom lamp with saved state
- Bedroom desk, wardrobe, mirror, toy shelf, rug and window dressing
- Save migration from PLAY.1 and both FOUNDATION releases
- Short visual transition feedback when rooms change

## Test checklist

1. Start in the family home and switch to the bedroom using the teal doorway.
2. Return home using the bedroom doorway.
3. Repeat the transition using the two location buttons.
4. Confirm W/Up moves toward the top of both rooms.
5. Pick up the teddy in the home and carry it into the bedroom.
6. Drop or drag the teddy near the bed, rug or toy shelf and confirm snapping.
7. Carry the book, apple or cup into the bedroom and test bedroom placement points.
8. Click the bed and confirm Khadija walks over and relaxes.
9. Use movement to stand up from the bed.
10. Toggle the bedroom lamp.
11. Refresh while inside the bedroom and confirm the room, character, held item and lamp state return.
12. Test Adaptive 30 FPS and Older laptop modes on the target Intel 4th-generation laptop.
13. Run `npm run deploy:wamp` and repeat the room transition test at `http://localhost/khadijas-world/`.

## Approval gate

WORLD.1 is approved when both rooms remain responsive, state survives refresh, items can move between rooms, and the target laptop holds a stable playable frame rate without rendering the other location visibly at the edge of the screen.
