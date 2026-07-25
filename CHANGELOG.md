# Changelog

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
