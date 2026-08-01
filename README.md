# Khadija's World

## ART.1K-A selective interior furniture

Selected CC0 furniture from the uploaded Ultimate House Interior Pack now runs
as High-only visual shells in the home, bedroom, Sunny Café, and grocery. The
assets load only when their location is visited, are recolored from stable
material-name mappings, and fall back to the existing procedural furniture on
Low, load failure, or rejected review candidates. See
`docs/ART1KA_SELECTIVE_INTERIORS.md` and `docs/ART1KA_APPLY.md`.

## ART.1K label orientation hotfix

Physical play-set plaques now face the fixed dollhouse camera and no longer show
mirrored lettering. See `docs/ART1K_LABEL_ORIENTATION_HOTFIX.md`.

## ART.1K readability foundation

ART.1K starts by removing the no-longer-useful ring around Khadija and making
procedural objects easier to identify. Interactive objects now expose a clear
name and action hint on hover or touch. High graphics also adds small in-world
play-set plaques and appliance details without changing gameplay geometry.

The readability foundation is approved. ART.1K-A activates selected interior
furniture, and ART.1K-B continues with character refinement. Full prop
remodelling and interaction animation remain in ART.1L. See
`docs/ART1K_READABILITY_FOUNDATION.md` and `docs/PRODUCTION_ROADMAP.md`.

## ART.1J neighborhood and park quality pass

ART.1J applies the approved High-quality procedural language to the outdoor
locations. The Neighborhood gains finished façades, doors, windows, paving,
curbs, garden edges, street furniture, wayfinding, and restrained outdoor
motion. The Park gains layered planting, paths, benches, picnic details,
playground forms, pond and fountain depth, and subtle environmental movement.

All new geometry remains visual-only. Existing doors, mailbox, scooter, seats,
park activities, draggable containers, NPCs, dialogue, movement, and saves stay
authoritative.

See `docs/ART1J_EXTERIOR_ART_DIRECTION.md`, `docs/ART1J_APPLY.md`, and
`docs/PRODUCTION_ROADMAP.md`.

A family-friendly open-ended play world where characters can explore, cook,
shop, play, and create everyday stories.

## ART.1G viewport mask hotfix

The Babylon canvas now uses a responsive dollhouse-shell clip so visual-only
meshes cannot appear outside the playable room frame. See
`docs/ART1G_VIEWPORT_MASK_HOTFIX.md`.


## Current release

**Version 0.26.0 — CONTENT.1 neighborhood adventures**

Repository package version: 0.26.0

CONTENT.1 adds a persistent Adventure Book with 13 neighborhood stories, star rewards, collectible stickers, repeatable encore moments, all-location exploration progress, and richer location-aware dialogue. RELEASE.1 privacy, accessibility, PWA, AI chat, and encrypted cloud-save protections remain in place.

See `CONTENT_1.md`, `RELEASE_CHECKLIST.md`, `MOBILE_TEST_MATRIX.md`, `PRIVACY.md`, and `ACCESSIBILITY.md`.

## Run locally

```powershell
cd C:\Projects\khadijas-world
npm install
npm run dev
```

Open the Vite address shown in PowerShell, normally `http://localhost:5173`.

## Release validation

```powershell
npm run release:verified
npm run release:mobile
```

The browser mobile suite is intentionally separate from the deterministic production gate so a local WebGL or emulator problem cannot silently replace the required physical-device checks.

## Deploy through WAMP

```powershell
npm run deploy:wamp
```

Then open `http://localhost/khadijas-world/`.

## Controls

- Click a location button or doorway to travel among the home, bedroom, street,
  Sunny Café, neighborhood park, and Sunny Basket Grocery.
- Khadija is the single playable character. Her sister and brother remain living family NPCs.
- Click the floor or use WASD / arrow keys to move Khadija.
- Drag a character to a valid floor or nearby furniture position.
- Click the sofa, bed, street bench or café chair to sit or stand.
- Click a holdable item to place it in Khadija's hand.
- Click a nearby character to hand them the held item.
- Drag a holdable item to arrange it on glowing placement targets.
- Use the action button to hug, read, eat or drink.
- Use the mood picker to change Khadija's expression. Unsupported production expressions use the procedural fallback.
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

### Current character visual direction

Khadija uses the approved Meshy hero GLB on Medium/High. Mama and the remaining
cast use a custom hero-style procedural system with unique faces, hair,
clothing, accessories, and living animations. All six locations include an
optional decorative polish layer that remains separate from collisions, seats,
doors, items, and save state.

See:

- `docs/ART1E_HERO_PROCEDURAL_CAST.md`
- `docs/ART1E_SCENE_POLISH.md`
- `docs/ART1E_DIALOGUE_UPDATE.md`
- `docs/ART1E_APPLY.md`

### ART.1F visual shading direction

ART.1F replaces the project-wide near-zero specular response with inexpensive
finish-aware StandardMaterial shading. Generic colorful surfaces receive a soft
toy-like sheen, while fabric, skin, hair, wood, ceramic, metal, glass, matte
surfaces, and shadows retain distinct responses. A cool fill / warm key lighting
split and lightweight static contact shadows add depth without PBR, bloom, SSAO,
or shadow maps.

See:

- `docs/ART1F_VISUAL_LIGHTING.md`
- `docs/ART1F_APPLY.md`
