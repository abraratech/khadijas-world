# ART.1K-A Apply Guide

Apply this package over the latest ART.1K label-orientation source tree.

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

Open `http://localhost:5173`, select **High**, and visit Home, Bedroom, Sunny
Café, and Grocery. Each location loads its selected furniture the first time it
is visited. Low restores the procedural furniture without reloading the page.

## Approval checks

- Home fridge, sink, cabinet, and oven are clearly recognizable.
- Bedroom curtains, nightstand, desk lamp, plant, and display shelf fit the room.
- The first café table set, counter stools, work line, and pendant lights align.
- Grocery shows two refrigerator shells and a waste bin without blocking stock.
- Imported models are non-pickable; existing hotspots still work.
- Switching High → Low restores procedural furniture immediately.
- Returning to a location does not create duplicate furniture.
- A failed asset request leaves its procedural fallback visible.
