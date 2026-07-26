# ART.1C Mama Fit and Idle-Pose Hotfix

## Problem confirmed from the game screenshot

Mama remained visibly shorter than Khadija and still held her arms away from her
body. The previous fix froze the first frame of the only available walking clip,
but that clip itself contains a wide upper-arm pose. Increasing a raw scale value
could not reliably compensate for imported armature/unit transforms.

## Fix

- `targetHeight: 2.80` normalizes Mama from her actual imported world bounds.
- The model is floor-aligned after normalization.
- Idle pose adjustments rotate `LeftArm` and `RightArm` downward by 0.58 radians.
- Walking starts the unmodified animation loop, so movement remains natural.
- Stopping movement reapplies the corrected idle pose.

## Tuning

Use this setting in `src/game/assets/characterAssets.ts`:

```ts
targetHeight: 2.80,
verticalOffset: 0,
```

Change `targetHeight` in small increments:

- `2.45` — slightly shorter
- `2.55` — current adult target
- `2.65` — slightly taller

Use `verticalOffset` only for a small final floor correction:

- `-0.03` — lower
- `0.03` — raise

Idle arm correction:

```ts
idlePoseAdjustments: [
  { nodeName: "LeftArm", axis: "x", radians: 0.58, multiply: "before" },
  { nodeName: "RightArm", axis: "x", radians: 0.58, multiply: "before" },
],
```

If the arms rotate in the wrong direction on the local Babylon configuration,
change both `0.58` values to `-0.58`.

## Validation

Run:

```powershell
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

Then test Mama standing, walking, stopping, chatting, gifting, Continue, and Low
quality fallback.
