# Applying ART.1E

Extract the update archive over:

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

## Manual checks

1. Brother and sister use polished procedural visuals rather than Quaternius GLBs.
2. Each world NPC has a distinct face, hair, clothing silhouette, and accessory.
3. Khadija and Mama continue using their approved GLBs on Medium/High.
4. Clicking every NPC still opens the existing offline chat.
5. Test new phrases such as `what's good here`, `where can I find bread`,
   `you're awesome`, and `I have to go`.
6. Unknown messages should produce NPC-specific fallback lines.
7. Visit all locations and verify decorative polish does not block movement,
   item pickup, doors, seats, or hotspots.
8. Low quality should disable the additional scene-detail layer.
9. Continue an existing save and verify positions, outfits, gifts, memories, and
   relationships remain intact.
