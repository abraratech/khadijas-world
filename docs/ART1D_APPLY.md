# Applying ART.1D

Extract the update over:

```text
C:\Projects\khadijas-world
```

Do not extract into `C:\wamp64\www`.

Run:

```powershell
cd C:\Projects\khadijas-world
npm install
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

Development server:

```powershell
npm run dev
```

Open:

```text
http://localhost:5173
```

Production deployment:

```text
http://localhost/khadijas-world/
```

Perform a hard refresh after deployment.

## Manual checks

### Home

- Brother loads with a green shirt.
- Brother idles and walks without returning to a bind pose.
- Brother remains a companion rather than appearing in the player selector.
- Brother can still move, receive items, sit, and restore from a save.
- Little Sister remains unchanged.

### Neighborhood

- Auntie Noor loads on the first visit.
- Clicking her opens the existing local dialogue.
- Leaving and returning does not redownload or duplicate her.

### Sunny Café

- Ms. Sana loads behind/near the counter.
- Her production mesh is clickable.
- Existing café work behavior and dialogue remain intact.
- No procedural apron remains floating over the GLB.

### Park

- Mr. Sami loads and walks inside his existing bounds.
- Dialogue and relationship state remain intact.
- Auntie Layla remains procedural.

### Grocery

- Mr. Kareem loads and remains clickable.
- Shopping and checkout interactions remain intact.
- Mrs. Huda remains procedural.

### Quality and fallback

- Low: lightweight Quaternius characters still load.
- Low: high-detail Khadija and Mama use procedural fallback.
- Broken/missing GLB: the corresponding procedural character remains usable.
- No duplicate bodies remain visible after load completion.

## Tuning

Target heights and facing rotation are in:

```text
src/game/assets/characterAssets.ts
```

Examples:

```ts
targetHeight: 1.95,
rotationY: 0,
verticalOffset: 0,
```

Change `targetHeight` in increments of about `0.05`. Use `verticalOffset` only
for small floor corrections. Change `rotationY` between `0` and `Math.PI` if a
model faces backward.
