# ART.1C Apply Guide

## Apply the update

Extract the update ZIP over the source repository:

```text
C:\Projects\khadijas-world
```

Do not extract it into:

```text
C:\wamp64\www
```

The update contains Mama's GLB at:

```text
public/assets/characters/mama/mama-v1.glb
```

## Validate

Run:

```powershell
cd C:\Projects\khadijas-world
npm install
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

Then hard-refresh:

```text
http://localhost/khadijas-world/
```

## Manual checks

On Medium or High quality:

1. Wait on the title screen briefly, then enter the home.
2. Confirm Mama appears as the Meshy model rather than the procedural figure.
3. Confirm her scale is adult-sized and her feet sit on the floor.
4. Confirm her face points in the expected direction.
5. Wait for autonomous movement and confirm the walking clip plays.
6. Click Mama's body and hello marker; both should open the same offline chat.
7. Give Mama a supported item and confirm ownership/save behavior remains valid.
8. Change location and return home; confirm there is only one Mama.
9. Refresh and Continue; confirm Mama's NPC state restores.

On Low quality:

1. Confirm the procedural Mama is used.
2. Confirm no Mama GLB error appears in normal UI.
3. Confirm chat, movement, gifts, and saves still work.

If Mama is too large or small, adjust only:

```text
src/game/assets/characterAssets.ts
MAMA_PRODUCTION_ASSET.scale
```

Suggested small adjustments are `1.15` through `1.30`.

If she faces backward, change:

```ts
rotationY: Math.PI
```

to:

```ts
rotationY: 0
```
