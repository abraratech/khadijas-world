# Changelog

## 0.24.0 / Public 0.1.18 — ART.1K-A Selective Interior Furniture

- Added 20 validated CC0 GLBs exported from the uploaded Ultimate House Interior Pack.
- Activated 14 unique models across 22 High-only, room-aware placements.
- Added lazy first-visit loading, in-scene caching, automatic bounds fitting, and procedural fallback.
- Restored legacy Blender material colors at runtime from stable material names because the first exports omitted glTF base-color factors.
- Kept six weak or redundant candidates review-only: bed, carpet, drawer, large shelf, plate, and spoon.
- Preserved all existing hotspots, seats, collisions, storage, item placement, dialogue, and save identifiers.
- Improved the Blender export helper to preserve legacy diffuse colors and fail when an output GLB is missing.

## 0.23.1 / Public 0.1.17 — ART.1K Label Orientation Hotfix

- Corrected every physical world plaque that appeared mirrored from the fixed
  dollhouse camera.
- Rotated plaque front faces toward the camera and changed them from double-sided
  planes to front-side geometry with back-face culling.
- Added regression coverage for the default and custom plaque orientations.
- Preserved hover/touch labels, interactions, saves, camera framing, and all room
  geometry.

## 0.23.0 / Public 0.1.16 — ART.1K Readability Foundation

- Removed the obsolete selection ring around Khadija because she is now the
  sole playable character.
- Added a lightweight context label that names interactive characters, items,
  appliances, furniture, doors, shops, and activities on mouse hover or touch.
- Added High-quality play-set plaques for ambiguous areas such as kitchen
  appliances, bedroom storage, café service zones, and grocery departments.
- Added small appliance controls and handles so key objects read as designed
  toys rather than undifferentiated boxes.
- Preserved every existing action manager, stable item/NPC ID, save field,
  dialogue path, collision proxy, and quality profile.
- Expanded ART.1K into a visual-readability and hero-cast milestone; the deeper
  prop remodelling and interaction-animation work remains scheduled for ART.1L.

## 0.22.0 / Public 0.1.15 — ART.1J Neighborhood and Park Quality Pass

- Replaced the generic shared street and park decoration with dedicated
  High-quality ART.1J exterior modules.
- Rebuilt the Neighborhood presentation with layered home and café façades,
  framed doors and windows, awning, signs, paving, curbs, road detail, garden
  edges, tree planting, bench, mailbox, street lamps, and wayfinding.
- Rebuilt the Park presentation with background hedges and trees, flower beds,
  paver paths, refined benches, picnic storytelling, playground overlays, pond,
  fountain, bird feeder, planters, and contact depth.
- Added restrained High-only leaf, flower, awning, sign, bunting, swing, water,
  and lily-pad movement.
- Preserved street travel, mailbox, scooter, bench, park activities, draggable
  containers, hotspots, NPCs, dialogue, movement, and save identifiers.
- Kept the uploaded interior Blend pack source-only; no third-party exterior
  object is active in the browser build.
- Advanced the fixed production roadmap to ART.1J.


## 0.21.0 / Public 0.1.14 — ART.1I Café and Grocery Quality Pass

- Added dedicated High-quality procedural visual layers for Sunny Café and
  Sunny Basket Grocery.
- Rebuilt the café presentation with architectural trim, a layered counter,
  backsplash, refined coffee station, pastry case, seating, community board,
  toy corner, contact depth, and restrained steam and light motion.
- Rebuilt the grocery presentation with rounded aisles, stocked shelves, produce
  crates, bakery, refrigerated display, household section, checkout, signage,
  wayfinding, contact depth, and restrained mist and light motion.
- Preserved all café and grocery items, seats, exits, hotspots, NPCs, dialogue,
  movement, content state, and save identifiers.
- Expanded the source-only interior-pack catalog to twelve commercial candidates
  and added an optional local Blender export helper.
- Advanced the fixed production roadmap to ART.1I.


## 0.20.0 / Public 0.1.13 — ART.1H Bedroom Quality Pass

- Replaced the generic shared bedroom decoration with a dedicated High-quality
  ART.1H bedroom module.
- Added architectural trim, deeper window staging, layered curtains, and an
  outside sky vignette.
- Rebuilt the visible bed suite with rounded frame, mattress, upholstered
  headboard, duvet, pillows, bedside storage, book, and night light.
- Added a reading chair, patterned rug, hanging mobile, upgraded desk, chair,
  wardrobe, cubbies, books, plant, artwork, fairy lights, laundry basket, and
  slippers.
- Added inexpensive High-only curtain, plant, mobile, and glow motion.
- Preserved bed, lamp, music-box, toy-ball, seat, movement, and save behavior.
- Added a curated source-only catalog for eight bedroom Blend candidates and an
  optional local Blender batch-export helper.
- Corrected archived Mama and Quaternius asset policies in the manifest.


## 0.19.3 / Public 0.1.12 — ART.1G Procedural Mama and Interior-Pack Intake

- Deactivated Mama's Meshy production visual on every quality tier.
- Restored the animated hero-procedural Mama for idle, walking, conversation,
  carrying, seating, expressions, and everyday gestures.
- Kept the archived Mama GLB definition and file for audit and rollback.
- Increased procedural Mama's visual scale from `1.02` to `1.08`.
- Preserved the stable `parent` ID, saves, dialogue memory, relationships,
  gifts, movement bounds, seat assignment, and click metadata.
- Inventoried 123 separate Blend assets from the uploaded Ultimate House
  Interior Pack and assigned them to the existing ART.1G–ART.1I roadmap.
- Did not activate imported furniture in this corrective patch.


## 0.19.2 / Public 0.1.11 — ART.1G Dollhouse Viewport Mask Hotfix

- Added a responsive CSS canvas clip derived from the shared dollhouse shell bounds.
- Hides decorative geometry that extends beyond the visible room frame.
- Keeps the Babylon canvas full-screen internally so pointer coordinates and rendering resolution remain unchanged.
- Matches the page background to the scene clear color outside the clipped room.
- Added viewport-mask tests for widescreen, square, and portrait layouts.
- Recorded the Quaternius interior preview for later selective evaluation; no interior model archive was included in this patch.

## 0.19.1 / Public 0.1.10 — ART.1G Camera Framing Hotfix

- Replaced the fixed `5.2` orthographic half-span with responsive room framing.
- Desktop and widescreen views now use a closer `4.65` vertical half-span.
- Narrow views expand only as much as needed to keep the whole dollhouse visible.
- Cleared all ArcRotate camera inputs because the dollhouse camera is not player-controlled.
- Prevented middle-button browser auto-scroll on the rendering canvas.
- Restricted item, character, NPC, and walk picks to the primary pointer button.
- Preserved room centers, navigation, collisions, interactions, quality settings, and saves.

## 0.16.0 / Public 0.1.6 — ART.1D Lightweight Family and World NPCs

### Production character roster

- Added a lightweight production Brother using Quaternius `Casual2_Male`.
- Added production visuals for Auntie Noor, Ms. Sana, Mr. Sami, and Mr. Kareem.
- Kept Little Sister, Auntie Layla, and Mrs. Huda on the existing procedural
  visual system for now.
- Preserved all stable character/NPC IDs, dialogue, memories, relationships,
  held items, movement bounds, room ownership, and save data.

### Animation and loading

- Mapped `Idle`, `Walk`, `Run`, `Walk_Carry`, `PickUp`, `SitDown`, and
  `StandUp` semantic actions from the Quaternius animation library.
- Uses the real `Idle` loop while stationary and `Walk_Carry` when a lightweight
  production character moves while holding an item.
- Brother loads while his current room is active.
- Neighborhood, café, park, and grocery production NPCs load on first visit to
  their location and remain cached for immediate return visits.
- Lightweight Quaternius assets are allowed on Low; high-detail Meshy Khadija
  and Mama still use procedural fallback on Low.

### Assets and licensing

- Converted five self-contained glTF files to single-file GLBs.
- Recolored Brother's shirt green without changing the shared skeleton or
  animations.
- Added manifest hashes, geometry/material/joint counts, asset validation, tests,
  CC0 credits, and ART.1D documentation.

## 0.15.2 / Public 0.1.5 — Mama Fit and Idle-Pose Hotfix

- Mama now normalizes to a `2.80` world-unit adult visual height using the
  imported GLB bounds instead of relying on an uncertain Meshy armature scale.
- Mama's feet are automatically aligned to the logical NPC floor after scaling.
- Added configurable idle-node pose corrections that lower both upper arms from
  the walking clip's wide source pose.
- Mama's walking animation still takes full control while she moves.
- Existing NPC IDs, saves, dialogue, relationships, gifts, and procedural
  fallback remain unchanged.

## 0.15.1 / Public 0.1.4 — Mama Interaction and Idle-Pose Hotfix

- Mama now holds a natural frame from her walking clip while stationary instead of reverting to the GLB A-pose bind pose.
- Clicking Mama opens NPC chat even when an older save has an item in her hands.
- Gifting an item to Mama still works when Khadija is actively holding one.
- Mama's production scale remains `1.24`; use `verticalOffset` for floor alignment rather than continually increasing scale.

## 0.15.0 / Public 0.1.3 — ART.1C Mama Production NPC

### Mama NPC

- Added the project-owner supplied textured, rigged, and animated Meshy GLB for
  the stable `parent` NPC
- Mapped the embedded `Armature|walking_man|baselayer` clip to Mama's existing
  autonomous movement without changing NPC IDs, save state, dialogue, memory,
  relationships, item exchange, or movement bounds
- Added production-mesh NPC metadata so clicking Mama continues to open her
  existing offline dialogue
- Preserved the procedural Mama as the Low-quality and load-failure fallback

### Startup loading and validation

- Starts Khadija and Mama production loads during world construction while the
  title screen is visible
- Keeps Low quality free of the two high-detail character downloads
- Expanded the asset registry, manifest, integrity validator coverage, tests,
  credits, and production documentation for the second GLB character

## 0.14.0 / Public 0.1.2 — ART.1B Home and Playable Item Polish

### Family home

- Rebuilt the main sofa, rug, coffee table, TV unit, refrigerator, counters,
  island, cupboard, curtains, stools, trim, and plant silhouettes with a softer
  rounded toy-like production language
- Added a single-mesh rounded-cuboid generator so large furniture gains rounded
  edges without external assets or stacked-primitive draw-call growth
- Added lightweight material variation, rug patterning, curtain hardware,
  cabinet details, plant leaves, and quality-controlled decorative shadows

### Playable items

- Upgraded the teddy, book, apple, cup, preparation plate, mixing bowl, and café
  serving tray using lightweight Babylon geometry
- Added a data-driven holdable presentation registry for floor height, held
  scale, offset, rotation, placement footprint, and semantic hold type
- Preserved all stable item IDs, save keys, recipes, storage behavior, dragging,
  snapping, hand-offs, and consumable behavior

### ART.1A completion fixes

- Kept the Meshy Khadija visual active for pink, teal, and yellow outfit choices
- Kept the production visual active for mood changes while facial animation
  remains deferred
- Retained procedural fallback for Low quality, unsupported poses, and loading
  failures

## 0.13.0 / Public 0.1.1 — ART.1A Single Playable Khadija

### Production character

- Added the project-owner supplied textured and rigged Meshy GLB for Khadija
- Added Babylon glTF loading, semantic Walking/Running mapping, page-relative
  WAMP/Vite asset URLs, pick metadata, disposal, and procedural load fallback
- Added a quality and capability fallback policy for the high-detail 168,908
  triangle model
- Added an asset manifest and `npm run validate:assets` GLB integrity validator

### Player and family roles

- Made Khadija the single playable character
- Kept sister and brother IDs, saved state, autonomy, item hand-offs, dragging,
  seating, and reactions as living family companions
- Migrated older selected-sibling saves to Khadija while retaining the visible
  room and sibling state
- Simplified the character tray to one clear Khadija card

### Compatibility

- Preserved schema 12 and all stable gameplay IDs
- Retained procedural visuals for Low mode, unsupported outfits/expressions,
  sitting, sleeping, specialist gestures, and asset-load failures
- Added regression tests for the single-player roster, asset registry, semantic
  animation matching, WAMP paths, and save migration

## Unreleased — ARCHITECTURE.1 Scene Modularization

### Architecture

- Replaced the former 4,804-line world-construction entry point with a small
  compatibility entry point, a focused coordinator, and cross-location runtime
  wiring
- Extracted family home, bedroom, street, Sunny Café, park, and grocery geometry
  into dedicated typed location builders
- Extracted character rig and semantic visual references into a dedicated
  character builder
- Centralized shared world materials, mesh helpers, interaction registration,
  disposal ownership, and placement helpers
- Added an exclusive location registry with activation, deactivation, and
  idempotent disposal

### Compatibility and tests

- Preserved schema 12, all stable location/character/gameplay IDs, and existing
  save migration behavior
- Added pure regression coverage for location activation, exclusive slots,
  character/material semantic contracts, disposal, and save-compatible IDs
- No gameplay, UI, content, visual values, dependencies, or save fields changed

## Public 0.1.0 / package 0.12.0 — RELEASE.1 Accelerated

### Player entry and presentation

- Polished title, first-launch, Continue, confirmed New World, credits, privacy,
  loading, pause, save-status, and recovery experiences
- Central release identity with public version, build, channel, support
  placeholder, privacy version, copyright, and production path
- Original favicon, app icon, browser metadata, and lightweight web manifest

### Grown-ups, privacy, and saves

- Lightweight arithmetic parent gate with access to all existing settings
- Validated local save export and confirmation-before-replacement import
- Import size, schema, character, NPC, object, item-type, and duplicate-ownership checks
- Schema 12 migration with release settings and one-time typed-chat privacy reminder
- Plain-language privacy notice, credits, asset audit, and open-source notices

### Production

- Friendly public failure screen and retained graphics-context recovery
- Pause/menu flow that returns to title without reloading the world
- Release regression tests and public-release documentation
- Install manifest included; service worker and automatic update prompts deferred
  to avoid fragile caching in the first WAMP release

## 0.11.0 — QUALITY.1 Accelerated

### Reliability

- Atomic temporary-to-primary save writes with a last-known-good backup
- Automatic fallback to a valid backup and gentle player-facing recovery notice
- Pre-migration snapshot, malformed-data normalization, duplicate-item cleanup,
  and exclusive-seat reconciliation
- Friendly display-pause recovery for graphics-context interruption
- Background-tab rendering and audio suspension

### Accessibility and input

- Persistent gentle-motion, larger-words, stronger-colors, and instant-reply controls
- Functional fullscreen control and visible keyboard focus indicators
- Keyboard movement ignored while typing or operating HTML controls
- Loading screen remains visible until the first playable scene frame

### Testing and production

- Vitest regression suite for saves, dialogue, memory, recipes, containers, and graphics
- Production source maps disabled by default
- Reusable regression, save-recovery, browser-support, and quality-baseline documents

## 0.10.0 — WORLD.3 Accelerated

### Added

- Neighborhood park with seating, picnic, playground, gardening, birds, fountain,
  sign, photography, and tidy-up interactions
- Sunny Basket Grocery with fictional products, portable basket, checkout, and bag
- Mr. Sami, Auntie Layla, Mr. Kareem, and Mrs. Huda as persistent local NPCs
- Fully offline bounded NPC dialogue with intents, entities, profiles, authored
  templates, suggested topics, safe redirects, and capped conversation history
- Structured NPC memories for gifts, shared activities, important events, visits,
  and nonnegative friendship progression
- Player controls for NPC chat, typed messages, memory storage, and memory deletion
- Version 10 save migration for both new locations and dialogue state

### Performance and privacy

- Inactive locations and their NPCs remain excluded from full animation updates
- Dialogue parsing runs only when a player submits a topic or message
- Conversation history and structured memory lists are bounded and normalized
- NPC dialogue makes no network requests and uses no remote model or API key

### Retained

- All PLAY.3 movement, hand-off, storage, cooking, cleaning, autonomy, audio,
  graphics, saving, low-spec support, hidden debug mode, and WAMP deployment

## 0.8.0 — LIFE.1 Accelerated

### Added

- Staggered lightweight autonomy for unselected playable characters
- Idle blinking, sway, head turns, nearby looks, reactions and held-item motion
- Gentle seated pose changes and sleep breathing
- Optional short room-safe walks that return toward the player-arranged position
- Child-friendly settings for character wiggles and little walks
- Reusable non-playable character definitions, state, prompts and dialogue
- Mama in the family home, Auntie Noor on the street and Ms. Sana in Sunny Café
- NPC greetings, item giving and receiving, sibling reactions and café service
- Version 8 save migration for living settings and meaningful NPC state
- Debug-only active living-update and decision counters

### Performance

- Decision logic runs on staggered intervals rather than every frame
- Only characters and NPCs in the active location receive animation updates
- Each location is capped to its single resident NPC
- Existing low-spec rendering and adaptive resolution behavior remains unchanged

### Retained

- All CONTENT.1 and PLAY.2 character, room, item, seating, save and touch systems
- Normal gameplay without development-facing diagnostics
- Relative production paths and WAMP deployment

## 0.7.0 — CONTENT.1 Accelerated

### Added

- Distinct hairstyles, silhouettes, facial details, outfit emblems and shoes for the playable family
- Layered eyes, pupils, eyebrows, cheeks and expression-specific face poses
- Interactive home television with persisted on/off state
- Interactive bedroom music box and bouncing toy ball
- Interactive neighborhood mailbox with a persisted flag state
- Interactive café bell and rotating daily-special messages
- Room-specific lightweight music chords and interaction sound cues
- Animated location-transition cards, sparkle feedback and touch haptics
- Touch-accessible mood controls at narrow screen sizes
- Version 7 content-state save migration

### Changed

- Improved room transitions with a softer curtain, location icon and title
- Expanded player feedback for travel, pickup, furniture, hand-off and sleep actions
- Raised the release version to 0.7.0

### Retained

- All PLAY.2 multi-character movement, placement, expressions, hand-offs and saves
- All four locations, furniture, objects, lighting and settings
- Low-spec presets, relative production paths and WAMP deployment

## 0.6.0 — PLAY.2 Accelerated

### Added

- Three independently controllable family characters
- Friendly portrait-based character switching
- Character dragging and room-safe placement
- Independent outfits, expressions, held items and activity state
- Nearby item hand-offs with playful reactions
- Happy, excited, sleepy, surprised and neutral expressions
- Lightweight unsynchronized blinking, sway and head movement
- Multiple non-overlapping furniture slots across all four locations
- Per-character sitting, sleeping and location persistence
- Version 6 save migration with selected-character and player-setting persistence

### Retained

- All four locations and their transitions
- Item pickup, use, carrying, dropping and prop dragging
- Outfit switching, lighting and room-state saves
- Low-spec graphics support and WAMP deployment
- Player-facing normal mode and `?debug=1` diagnostics

## 0.5.0 — WORLD.2 Accelerated

### Added

- Neighborhood street hub
- Sunny Café interior
- Four-location navigation controls
- Home-to-street, street-to-home, street-to-café and café-to-street doors
- Street bench interaction
- Lightweight scooter ride sequence
- Café chair interaction
- Café pastry display and drink-machine interactions
- Holdable cupcake and sandwich props
- Consumable item respawn configuration
- Street and café placement targets
- Street and café placeholder characters
- Location-aware outdoor and café lighting
- WORLD.1 save migration

### Changed

- Expanded `RoomId` to include `street` and `cafe`
- Raised the world save format to version 5
- Generalized consumable respawning beyond the home apple
- Expanded room labels and item-action labels in the HUD
- Expanded draggable-object world bounds for all four locations

### Retained

- Home and bedroom interactions
- Corrected room-aware bedroom lighting
- Character movement and item gestures
- Outfit switching
- Adaptive, Older laptop and Balanced graphics presets
- WAMP deployment workflow

## 0.4.1 — WORLD.1 Lighting Hotfix

- Made bedroom lamp state affect visible bedroom brightness.
- Kept home and bedroom lighting independent and room-aware.

## 0.17.0 — ART.1E Hero Procedural Cast and Scene Polish

- Replaced active Quaternius Brother and world-NPC visuals with a cohesive
  hero-style procedural cast.
- Added distinct faces, hair silhouettes, clothing layers, accessories, eye
  highlights, collars, cuffs, rounded shoes, and age-specific proportions.
- Kept Khadija and Mama as the approved Medium/High Meshy hero assets.
- Added a decorative art pass to the home, bedroom, neighborhood, café, park,
  and grocery without changing gameplay geometry or save IDs.
- Integrated the project-owner supplied DialogueController, IntentRecognizer,
  and NPC dialogue profiles.
- Expanded intent phrases and restored NPC-specific unknown fallbacks.
- Updated package version to 0.17.0 and public version to 0.1.7.

## 0.18.0 — ART.1F Toy Sheen, Lighting Contrast, and Contact Depth

- Replaced near-zero blanket specular values with finish-aware StandardMaterial
  profiles for matte, fabric, skin, hair, wood, soft-toy, ceramic, metal, glass,
  and shadow surfaces.
- Covered every direct StandardMaterial construction path in the project.
- Added a cool hemispheric fill and warm directional key-light color split.
- Reduced ambient wash while preserving room-aware lighting intensity behavior.
- Added inexpensive contact-shadow discs under major bedroom, street, café,
  park, and grocery props.
- Kept the pass free of PBR conversion, bloom, SSAO, outlines, and shadow maps.
- Added material-finish unit tests.
- Updated package version to 0.18.0 and public version to 0.1.8.
