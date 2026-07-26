# ART.1G Camera Framing Hotfix

## Reason

The original dollhouse camera used a fixed orthographic vertical half-span of
`5.2` at every aspect ratio. On a wide desktop window this exposed excessive
background around the room and made the characters and furnishings feel small.
The camera also retained non-pointer ArcRotate inputs after construction, even
though gameplay never intends the player to orbit or zoom the camera.

## New framing

`calculateDollhouseOrthoFrame()` uses:

- `4.65` as the preferred desktop vertical half-span;
- `6.15` world units as the room half-width including a safety margin;
- a larger vertical span only when a narrow aspect ratio requires it.

This makes the room about twelve percent larger than the previous framing on a
wide desktop while preserving the complete room on smaller or narrower views.

## Input lock

The camera input manager is cleared instead of attaching browser controls. The
rendering canvas also prevents middle-button `mousedown` and `auxclick` default
behavior. Item taps, NPC clicks, character drags, and click-to-walk actions now
ignore non-primary mouse buttons. Touch remains a primary-pointer interaction.

## Manual checks

1. Start the game at 1920×1080 or a similarly wide browser window.
2. Confirm that the room is visibly larger but its outside edges remain visible.
3. Visit every location and confirm that each remains fully framed.
4. Press and hold the middle mouse button over the canvas.
5. Confirm that the camera does not rotate, invert, zoom, or enter browser auto-scroll.
6. Confirm left-click, touch, character dragging, item pickup, NPC chat, and walking still work.
7. Resize the browser from wide landscape toward square and confirm no room side is clipped.

## Scope

This patch does not change geometry, character scale, room coordinates,
collisions, lighting, graphics quality, interactions, dialogue, or save data.
