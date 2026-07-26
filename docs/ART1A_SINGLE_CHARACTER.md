# ART.1A — Single Playable Khadija

## Scope

This update is the first contained ART.1 production-asset integration. Khadija is
the sole playable character. Her sister and brother remain persistent living
family companions: they can wander, react, hold items, be dragged, and use seats,
but they are no longer selectable as the player.

## Production asset

- Runtime path: `public/assets/characters/khadija/khadija-v1.glb`
- Source: project-owner generated Meshy AI model
- File size: 14,557,592 bytes
- Geometry: 168,908 triangles / 91,293 vertices
- Skeleton: 24 joints
- Material count: 1
- Embedded texture: 2048×2048 PNG
- Included clips: `Walking`, `Running`
- Asset manifest: `art/ASSET_MANIFEST.json`

The model is intentionally retained without destructive optimization in this
first integration so its approved appearance is preserved. It exceeds the final
web triangle budget and therefore has a quality/fallback policy rather than being
forced onto every device.

## Runtime policy

The production Meshy visual is used when all of the following are true:

- Quality is Adaptive or High.
- Khadija is standing.
- Her interaction is idle or walking.
- Her outfit is the production pink outfit.
- Her expression is neutral or happy.
- The GLB loaded successfully.

The existing procedural Khadija visual is used for:

- Low quality, avoiding download/parsing of the 14 MB high-detail asset.
- Teal or yellow outfits.
- Excited, surprised, or sleepy expressions.
- Sitting and sleeping.
- Reading, hugging, eating, and drinking gestures.
- Missing, invalid, or failed GLB loads.

This keeps every existing gameplay action functional while production clips and
modular assets are expanded later.

## Save compatibility

Schema 12 and all character IDs remain unchanged. During normalization:

- `selectedCharacter` becomes `khadija`.
- The existing visible `activeRoom` is retained.
- Khadija is restored in that room, using the room spawn when her saved position
  belongs to a different room.
- Sister/brother positions, outfits, expressions, held items, and room states are
  retained as companion state.

No new save field is required for the production visual.

## Asset loading

`src/game/assets/productionCharacterVisual.ts` loads the GLB with Babylon's glTF
loader, attaches it to the existing logical character root, maps semantic walk
and run names, adds pick metadata, and controls production/fallback visibility.
The gameplay root remains authoritative for movement, rotation, bounds, save
state, held-item anchors, seating, and location transitions.

The asset URL is resolved relative to `document.baseURI`, so both Vite and the
WAMP `/khadijas-world/` subfolder use the same source path.

## Validation

Run:

```powershell
npm install
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

The asset validator checks the manifest, file size, SHA-256, GLB version,
triangle count, material count, joint count, and required animation names.

## Known limitations / ART.1B work

- The current asset exceeds the planned 15k–25k production triangle budget.
- It has no idle, sitting, sleeping, item-use, or facial-expression clips.
- It has one fixed pink outfit and fixed facial appearance.
- The procedural held-item anchor is reused and may need character-specific
  calibration after visual review in Babylon.js.
- Physical FPS and load-time validation on the Intel HD target device remains a
  manual approval gate.
