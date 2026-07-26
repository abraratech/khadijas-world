# ART.1C Mama Interaction and Idle-Pose Hotfix

## Fixed

- Mama no longer returns to the exported A-pose while idle. The loader freezes the first frame of her supplied walking clip as a standing pose.
- Clicking Mama now prioritizes offline NPC chat. A teddy, bowl, or other saved gift in her hands no longer intercepts the conversation flow.
- Khadija can still give Mama an item by clicking Mama while Khadija is holding it.

## Scale and placement

Mama's configured production scale is:

```ts
scale: 1.24,
verticalOffset: 0,
```

Do not keep increasing scale to correct an A-pose or floor problem. Scale changes height and width together. Use small adjustments:

```ts
scale: 1.15,       // smaller overall
verticalOffset: .04 // move upward
verticalOffset: -.04 // move downward
```

Change values in `src/game/assets/characterAssets.ts`, then rebuild.

## Validation

Run:

```powershell
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

Check Mama while stationary, while walking, while holding a saved item, and after Continue.
