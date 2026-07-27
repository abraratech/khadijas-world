# ART.1G Apply Guide

ART.1G establishes the family home as the visual benchmark for High graphics.
The update is intentionally visual-only: gameplay geometry, collisions, seats,
items, hotspots, dialogue IDs, and save IDs are unchanged.

## Apply

Extract the ART.1G update over the source repository:

```text
C:\Projects\khadijas-world
```

Do not extract into the WAMP deployment directory.

Run:

```powershell
cd C:\Projects\khadijas-world
npm install
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

For development:

```powershell
npm run dev
```

Open `http://localhost:5173` and perform a hard refresh.

## Quality behavior

- **High** uses the internal `balanced` preset and enables the full ART.1G pass.
- **Medium/Adaptive** may disable the pass as the adaptive controller protects
  frame rate.
- **Low** disables the ART.1G meshes and their motion completely.

## Approval checks

1. The family home should feel layered and intentionally decorated rather than
   assembled from flat colored boxes.
2. Crown moulding, wall panels, window depth, sofa details, table styling, media
   details, and kitchen staging should appear only when decorative details are
   enabled.
3. Curtain, plant, clock, steam, and light-pulse motion should be subtle.
4. Decorative geometry must not block Khadija, Mama, NPCs, props, seats, or
   hotspots.
5. Low graphics should retain the original lightweight room.
6. Existing saves must preserve room state, TV state, cupboard state, held
   items, dialogue memory, and character positions.
