# Applying ART.1F

Extract the update ZIP over the source repository:

```text
C:\Projects\khadijas-world
```

Do not extract into the WAMP deployment folder.

Run:

```powershell
cd C:\Projects\khadijas-world
npm install
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

For Vite development:

```powershell
npm run dev
```

Open `http://localhost:5173` and hard-refresh.

## Visual approval checklist

- Colored furniture has a soft broad highlight instead of a chalky finish.
- Walls remain relatively matte.
- Hair, eyes, shoes, ceramic objects, glass, and metal read differently.
- Khadija and Mama are not blown out by the stronger specular response.
- Cool fill and warm key lighting are visible without making skin unnatural.
- Major furniture and counters feel grounded rather than floating.
- Contact-shadow discs do not appear above rugs or through furniture.
- Low quality hides decorative contact shadows with the rest of the art pass.
- Frame rate remains acceptable on the intended older laptop.

## Tuning

Finish values live in:

```text
src/game/shared/createMaterials.ts
```

Global light colors live in:

```text
src/game/world/createWorldRuntime.ts
```

Evaluate the default values before increasing specular further. A broad,
moderate highlight is the target; bright white plastic glare is not.
