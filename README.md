# Khadija's World

A family-friendly Babylon.js dollhouse and neighborhood play prototype.

## Current release

**WORLD.2 Accelerated — Neighborhood and Sunny Café**

The project currently contains four playable locations, character movement, seating, outfit changes, draggable and holdable objects, item actions, persistent saves, low-spec graphics presets and WAMP deployment support.

## Run locally

```powershell
cd C:\Projects\khadijas-world
npm install
npm run dev
```

Open the Vite address shown in PowerShell, normally `http://localhost:5173`.

## Deploy through WAMP

```powershell
npm run deploy:wamp
```

Then open `http://localhost/khadijas-world/`.

## Controls

- Click a location button or teal doorway to travel.
- Click the floor or use WASD / arrow keys to move Khadija.
- Click the sofa, bed, street bench or café chair to sit or stand.
- Click a holdable item to place it in Khadija's hand.
- Drag a holdable item to arrange it on glowing placement targets.
- Use the action button to hug, read, eat or drink.
- Click the street scooter for a short ride.
- Click the café pastry display for food.
- Click the café coffee machine for a drink.

## Minimum test target

- Intel Core 4th generation
- Intel HD 4400 or HD 4600
- 8 GB RAM
- Current Chrome or Edge
- Adaptive or Older laptop preset
- 1280×720 internal target
- Stable 30 FPS goal

Concept images in `docs/visual-targets` are art-direction references, not engine screenshots.
