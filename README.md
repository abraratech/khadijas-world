# Khadija's World

A family-friendly open-ended play world where characters can explore, cook,
shop, play, and create everyday stories.

## Current release

**Public Version 0.1.0 — Release 1**

Repository package version: 0.12.0

The project now contains six playable locations, three controllable family
characters, seven neighborhood NPCs, everyday cooking and storage play, park
activities, grocery shopping, and a fully local conversation system. NPC replies
use bounded intents, entity aliases, authored templates, structured memories, and
friendship progression. No network service, account, API key, or remote model is
used for conversation.

Release 1 adds a polished title and first-launch flow, Continue and confirmed New
World actions, a lightweight Grown-Ups gate, parent controls, validated save
export/import, privacy guidance, credits, release metadata, icons, pause behavior,
save status, and friendly recovery screens. All conversation logic remains local
and offline; the game has no accounts, advertising, analytics, external AI, or
third-party tracking.

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

- Click a location button or doorway to travel among the home, bedroom, street,
  Sunny Café, neighborhood park, and Sunny Basket Grocery.
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
- Tap a neighborhood friend to exchange an item or open a local conversation.
- In the park, try the benches, picnic blanket, slide, swings, sandbox, flowers,
  birds, fountain, sign, and tidy-up activity.
- In the grocery shop, carry the shopping basket, choose fictional products, and
  bring the basket to the checkout to pack a reusable bag.
- Use Settings to turn character wiggles or little walks on and off separately.
- Use Settings to enable suggested-only conversations, disable saved memories,
  or clear conversation memories without resetting the world.

## Minimum test target

- Intel Core 4th generation
- Intel HD 4400 or HD 4600
- 8 GB RAM
- Current Chrome or Edge
- Adaptive or Older laptop preset
- 1280×720 internal target
- Stable 30 FPS goal

Concept images in `docs/visual-targets` are art-direction references, not engine screenshots.

Quality measurements and honest physical-test limitations are documented in
`docs/QUALITY_BASELINE.md`. Save recovery behavior is documented in
`docs/SAVE_RECOVERY.md`. See `RELEASE_NOTES.md` and
`docs/RELEASE_CHECKLIST.md` for public-release scope and validation status.

## World architecture

World creation is coordinated through `src/game/world/createWorld.ts`. Family
home, bedroom, street, Sunny Café, park, and grocery geometry each live in a
dedicated builder under `src/game/locations`. Character construction is isolated
under `src/game/characters`, while shared materials, mesh helpers, interaction
ownership, and placement helpers live under `src/game/shared`.

See `docs/ARCHITECTURE.md` for module contracts, disposal ownership, and the
steps for adding a location or character visual.
