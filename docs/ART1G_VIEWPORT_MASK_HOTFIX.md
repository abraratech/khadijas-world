# ART.1G Dollhouse Viewport Mask Hotfix

## Purpose

The closer ART.1G camera framing made the room easier to read, but also exposed
visual-only geometry that extends beyond the architectural shell. This hotfix
adds a responsive screen-space matte around the Babylon canvas.

## Implementation

- `cameraFraming.ts` converts the shared dollhouse shell bounds to responsive CSS
  inset percentages.
- `createWorldRuntime.ts` writes those percentages to canvas custom properties
  whenever renderer framing changes.
- `styles.css` clips the canvas with `clip-path: inset(...)` and gives the page
  the same pale-blue color as the Babylon scene clear color.

The canvas remains full-screen internally. Rendering resolution, Babylon pointer
coordinates, room geometry, collision bounds, hotspots, saves, and DOM interface
positions are unchanged. Only pixels outside the dollhouse shell are hidden.

## Interior-pack note

The Quaternius Ultimate House Interior preview is suitable as a source library,
but the actual Blend/FBX/OBJ archive was not present in this update. When the
archive is supplied, selected pieces should be evaluated individually rather
than importing the whole pack as a single scene. The preferred source is the
Blend edition because it normally preserves object separation, materials, and
hierarchy for selective export.

## Local checks

1. Open every location at High, Medium, and Low.
2. Confirm visual overflow is hidden beyond the room frame.
3. Confirm room doors, item picking, click-to-walk, NPC chat, and dragging still
   work near the visible edges.
4. Resize the browser and test fullscreen.
5. Confirm the top and bottom interface remain outside the mask.
