# ART.1H — Bedroom Quality Pass: Apply Guide

Apply the update over the source repository, not the WAMP deployment folder.

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

Open `http://localhost:5173`, select **High**, enter the Bedroom, and hard-refresh
once after the first restart.

## Approval checks

- the bed reads as soft layered furniture rather than stacked boxes;
- the desk, wardrobe, storage, rug, window, and lighting form one composition;
- the existing bed, lamp, music box, ball, seating, and movement interactions work;
- High-only motion is subtle and stops when decorative details are disabled;
- Low remains the original lightweight bedroom;
- no decorative mesh blocks clicking, walking, storage, or item placement.
