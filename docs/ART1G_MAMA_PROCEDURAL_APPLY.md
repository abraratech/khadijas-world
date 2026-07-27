# Apply ART.1G Procedural Mama Hotfix

Extract the update over the source repository:

```text
C:\Projects\khadijas-world
```

Then run:

```powershell
cd C:\Projects\khadijas-world
npm install
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

For local Vite testing:

```powershell
npm run dev
```

Open `http://localhost:5173` and hard-refresh.

## Approval checks

- Mama is procedural on High, Medium, Adaptive, and Low.
- Mama blinks and uses living idle movement.
- Mama walks without switching to the old GLB.
- Clicking Mama opens the existing dialogue.
- Gifts, held items, seating, and saves still work.
- Khadija's production GLB remains active on Medium/High.
