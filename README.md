# Khadija's World

A family-friendly Babylon.js dollhouse and neighborhood play prototype.

## Current release

**CONTENT.1 Accelerated — Visual and content expansion**

The project contains four playable locations and three controllable family
characters. Each character keeps their own location, outfit, expression, held
item and furniture state. Existing movement, seating, object play, item actions,
persistent saves, low-spec graphics presets and WAMP deployment remain supported.
CONTENT.1 adds distinct family silhouettes and hairstyles, richer faces, more
room interactions, location music, playful sound cues, improved feedback and
touch-friendly controls.

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
- Pick Khadija, her little sister or her brother from the portrait tray.
- Click the floor or use WASD / arrow keys to move the selected character.
- Drag a character to a valid floor or nearby furniture position.
- Click the sofa, bed, street bench or café chair to sit or stand.
- Click a holdable item to place it in the selected character's hand.
- Click a nearby character to hand them the held item.
- Drag a holdable item to arrange it on glowing placement targets.
- Use the action button to hug, read, eat or drink.
- Use the mood picker to change the selected character's expression.
- Tap the television, bedroom music box, toy ball, street mailbox, café bell,
  menu, lamps and cupboards for extra story moments.
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
