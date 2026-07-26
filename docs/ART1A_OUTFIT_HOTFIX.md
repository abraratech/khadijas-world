# ART.1A Outfit Persistence Hotfix

This update keeps the Meshy production model active when the player selects
pink, teal, or yellow.

## Why the fallback happened

The first ART.1A loader intentionally treated only the pink hoodie as supported.
Selecting teal or yellow set the production visual to unsupported and revealed
the procedural fallback.

## What changed

- Added 1024×1024 WebP variants for pink, teal, and yellow.
- Swaps the imported Meshy PBR material textures at runtime.
- Keeps the production model visible for every outfit selection.
- Keeps the production model visible for mood selections. The current model has
  a fixed friendly face, so mood buttons save correctly but do not yet alter its
  facial geometry.
- Retains procedural fallback for Low quality, asset-load failure, sitting,
  sleeping, and specialist interaction poses that lack production animations.

## Apply

Extract over:

```text
C:\Projects\khadijas-world
```

Then run:

```powershell
cd C:\Projects\khadijas-world
npm test
npm run build
npm run deploy:wamp
```

Hard-refresh:

```text
http://localhost/khadijas-world/
```

## Generated texture files

- `public/assets/characters/khadija/outfits/khadija-pink.webp` — 113,120 bytes
- `public/assets/characters/khadija/outfits/khadija-teal.webp` — 118,900 bytes
- `public/assets/characters/khadija/outfits/khadija-yellow.webp` — 130,298 bytes
