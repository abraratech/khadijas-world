# Khadija's World — ART.1K-A Selective Interior Furniture

Public version: 0.1.18

Repository package version: 0.24.0

Update date: 26 July 2026

Twenty converted furniture GLBs from the Ultimate House Interior Pack are now
validated and bundled. Fourteen unique models are selectively active in High
graphics across 22 placements in the home, bedroom, Sunny Café, and grocery.
They load on first visit, remain cached, and automatically restore the existing
procedural furniture on Low or when an import fails.

The first Blender exports retained material names but omitted most base-color
factors. ART.1K-A therefore restores an intentional toy-world palette at runtime
from those names. The export helper is also corrected for future conversions.
Six models that did not clearly improve the authored procedural scenes remain
review-only and are never loaded.

---

# Khadija's World — ART.1K Label Orientation Hotfix

Public version: 0.1.17

Repository package version: 0.23.1

Update date: 26 July 2026

The High-quality physical labels now face the fixed dollhouse camera correctly.
The labels previously rendered through the back of double-sided planes, causing
words such as Kitchen, Fridge, Oven, and Checkout to appear mirrored. Plaques
now use a front-facing orientation and back-face culling. Gameplay and the HTML
hover/touch labels are unchanged.

---

# Khadija's World — ART.1K Readability Foundation

Public version: 0.1.16

Repository package version: 0.23.0

Update date: 26 July 2026

Khadija is the only playable character, so the old selection ring has been
removed. Interactive items, appliances, furniture, travel points, companions,
and NPCs now show a polished context label on mouse hover or touch. High
graphics adds restrained in-world labels for the kitchen, bedroom, café, and
grocery, plus appliance controls and handles that improve object recognition.

This update is a readability foundation, not the final prop-art pass. ART.1K
continues with procedural character refinement. ART.1L remains responsible for
deep prop remodelling and pickup, handover, eating, cooking, reading, shopping,
and tidying animation. Stable IDs, saves, dialogue, collisions, and action
managers are unchanged.

---

# Khadija's World — ART.1J Neighborhood and Park Quality Pass

Public version: 0.1.15

Repository package version: 0.22.0

Update date: 26 July 2026

ART.1J turns the Neighborhood and Park into the outdoor High-quality benchmark.
The Neighborhood receives finished façades, doors, windows, awning, paving,
curbs, garden edges, street furniture, wayfinding, contact depth, and restrained
movement. The Park receives richer planting, paths, seating, picnic storytelling,
playground forms, pond and fountain depth, birds, signs, and subtle outdoor life.

All new meshes are non-interactive decorative layers. Existing travel, mailbox,
scooter, seats, park activities, containers, NPCs, dialogue, movement, and saves
remain unchanged. Low and Adaptive can disable the richer exterior layers. No
third-party object from the uploaded interior Blend pack is active in this pass.

---

# Khadija's World — ART.1I Café and Grocery Quality Pass

Public version: 0.1.14

Repository package version: 0.21.0

Update date: 26 July 2026

ART.1I turns Sunny Café and Sunny Basket Grocery into the next High-quality
benchmark locations. The café receives a finished service counter, coffee
station, pastry display, seating, community details, and gentle steam. Grocery
receives richer aisles, product grouping, produce, bakery, refrigerated stock,
household goods, checkout details, wayfinding, and subtle store ambience.

All new meshes are non-interactive decorative layers. Existing café and grocery
interactions, NPCs, products, travel, dialogue, and saves remain unchanged. Low
and Adaptive can disable the richer layers. The uploaded interior Blend pack
remains source-only; no third-party furniture is active in the browser build.

---

# Khadija's World — ART.1H Bedroom Quality Pass

Public version: 0.1.13

Repository package version: 0.20.0

Update date: 26 July 2026

ART.1H turns the bedroom into the second High-quality benchmark location. The
new visual-only layer adds a finished bed suite, study area, wardrobe, storage,
reading corner, personal decoration, architectural depth, contact shadows, and
subtle environmental movement. Existing interactions and save identifiers are
unchanged, while Low and Adaptive can disable the entire pass.

The uploaded Ultimate House Interior Pack is now represented by a curated
source-only catalog and optional local Blender export helper. No third-party
furniture is active in the browser build yet.

---

# Khadija's World — ART.1G Procedural Mama and Interior-Pack Intake

Public version: 0.1.12

Repository package version: 0.19.3

Update date: 26 July 2026

Mama now uses the cohesive hero-procedural rig on every graphics preset. The
archived Meshy GLB contains only a walking clip, so even after pose correction it
looked static during conversation and everyday idles. The procedural version
keeps the stable `parent` NPC state while restoring blinking, breathing,
look-around movement, expressions, gestures, carrying, and sitting.

The uploaded Ultimate House Interior Pack contains 123 separate Blend files.
The archive has been inventoried for selective use in ART.1G, ART.1H, and
ART.1I. No furniture is activated by this corrective patch. Imported furniture
will be used only as High-quality visual shells over the existing procedural
interaction and save proxies.

---

# Khadija's World — ART.1G Dollhouse Viewport Mask Hotfix

Public version: 0.1.11

Repository package version: 0.19.2

Update date: 26 July 2026

The closer camera made the dollhouse easier to read but revealed decorative
meshes outside the architectural shell. This patch adds a responsive CSS inset
mask to the full-screen Babylon canvas. The page background now matches the
scene clear color, so the result is a clean dollhouse window without changing
world geometry, pointer math, interactions, quality settings, or saves.

The supplied Quaternius image has been recorded as an interior-source preview.
The actual Blend/FBX/OBJ archive was not included, so no third-party furniture
was imported in this patch.

---

# Khadija's World — ART.1G Camera Framing Hotfix

Public version: 0.1.10

Repository package version: 0.19.1

Update date: 26 July 2026

The family home screenshot showed that the world was not being viewed from the
wrong perspective; it was being framed too loosely. The original orthographic
camera always used a vertical half-span of `5.2`, causing widescreen displays to
show large unused margins around the room. The camera now uses a closer `4.65`
desktop framing and expands responsively only when a narrower viewport needs
more room to avoid clipping the dollhouse.

The camera is intentionally fixed, so all ArcRotate inputs are now cleared.
Middle-click browser auto-scroll is blocked on the game canvas, and gameplay
picks accept only the primary pointer button. This removes the reported camera
flip without altering room navigation, character movement, dialogue, quality
settings, or save data.

---

# Khadija's World — ART.1D Lightweight Family and World NPCs

Public version: 0.1.6

Repository package version: 0.16.0

Update date: 26 July 2026

ART.1D uses selected CC0 characters from the Quaternius Ultimate Animated
Character Pack for Brother and four location NPCs. The new files are compact
single-file GLBs with embedded geometry, material colors, skeletons, and a
shared animation library.

Brother now uses a green-shirt production visual while remaining a non-playable
family companion. Auntie Noor loads with the Neighborhood, Ms. Sana with Sunny
Café, Mr. Sami with the Park, and Mr. Kareem with Grocery. These location assets
load once when first needed and remain in the scene cache for faster return
visits.

The existing procedural visuals remain as immediate loading and failure
fallbacks. Little Sister, Auntie Layla, and Mrs. Huda remain procedural in this
pass. Stable IDs, local dialogue, memories, relationships, gifts, saves, and
movement bounds are unchanged.

The Quaternius pack is CC0. Attribution is not required, but the source is
recorded in `ASSET_CREDITS.md` and `THIRD_PARTY_NOTICES.md`.

---

# Khadija's World — Mama Fit and Idle-Pose Hotfix

Public version: 0.1.5

Repository package version: 0.15.2

Update date: 26 July 2026

This hotfix replaces blind Mama scale tuning with a world-space target height,
automatically aligns the imported model's feet to the logical NPC floor, and
adds small upper-arm pose corrections while she is idle. Mama's walking clip
continues to control the full skeleton while she moves.

ART.1C adds the project-owner supplied Meshy Mama model to the stable `parent`
NPC. Mama remains the same local NPC for saves, offline dialogue, memory,
relationship progress, autonomous movement, item exchange, and interaction
prompts; only her visible production layer changes on Adaptive and High quality.

The included 9.8 MB GLB contains one embedded 2048×2048 texture, one material, a
24-joint humanoid skin, and one walking clip. The clip follows Mama's existing
autonomous movement. Her procedural visual remains the Low-quality and
load-failure fallback.

The world is constructed before the title screen is dismissed, so Khadija and
Mama begin loading while the player is on the title screen. This is an eager
startup load for the initial home cast, not a load-everything policy. Later
location characters and visual-shell GLBs should load on demand or during idle
time to protect startup and memory use.

Actual scale, facing direction, hand-off alignment, clicking, and target-laptop
performance remain manual approval checks.

---

# Khadija's World — ART.1B Preview

Public version: 0.1.2

Repository package version: 0.14.0

Update date: 25 July 2026

ART.1B establishes the first production environment and playable-item style.
The family home now uses softer rounded furniture silhouettes, warmer shared
materials, layered curtains and rugs, improved kitchen forms, and optional
low-cost decorative shadows. The room layout, interaction points, seating,
recipes, storage, lighting, save schema, and navigation remain unchanged.

The teddy, book, apple, cup, preparation plate, mixing bowl, and serving tray
have upgraded lightweight geometry. A new presentation registry stores item
hold scale, offsets, rotations, footprint, and hold type without changing stable
item IDs or save data.

The ART.1A outfit correction is included: pink, teal, and yellow now swap Meshy
textures without revealing the procedural model. Mood choices remain saved but
the current Meshy face is visually fixed. Procedural fallback still covers Low
quality, sitting, sleeping, specialist poses, and load failure.

This is a focused home-and-items pass. Bedroom, street, café architecture, park,
and grocery environment upgrades remain later ART passes. Actual performance on
the target Intel HD laptop remains a manual approval gate.

---

# Khadija's World — ART.1A Preview

Public version: 0.1.1

Repository package version: 0.13.0

Update date: 25 July 2026

ART.1A introduces the first production character asset while preserving the
procedural visual as a compatibility fallback. Khadija is now the sole playable
character. Her sister and brother remain persistent living companions who can
move, sit, hold items, receive hand-offs, and retain their saved state.

On Adaptive and High quality, the project-owner supplied Meshy GLB is loaded for
Khadija when she is standing in the pink outfit with a supported expression. It
contains an embedded texture, a 24-joint skeleton, and Walking and Running clips.
Low quality and unsupported poses, outfits, expressions, or loading failures use
the existing procedural visual without interrupting play.

Older saves remain schema 12. Saves that previously selected a sibling continue
in the same visible location with Khadija activated; sibling state is retained.
Run `npm run validate:assets` after installing dependencies and before the normal
test/build/deploy sequence.

This is a contained production-asset preview, not full ART.1 completion. The
current model exceeds the target triangle budget and still needs physical
older-laptop validation, additional semantic animations, calibrated hold anchors,
and modular outfit/expression support.

---

# Khadija's World — Release 1

Public version: 0.1.0

Repository package version: 0.12.0

Release date: 24 July 2026

Explore the family home, Khadija's bedroom, neighborhood street, Sunny Café,
park, and Sunny Basket Grocery with Khadija, her sister, and her brother. Move,
drag, dress, sit, sleep, share items, cook, clean, organize storage, shop, play,
and create everyday stories with seven local neighborhood characters.

NPC conversations are fully offline and bounded. Suggested topics, optional
typed messages, friendship, and structured memories remain inside the browser
save. No account, advertising, analytics, tracking, external AI, or remote chat
service is used.

Release 1 adds a title screen, first-launch choices, Continue, confirmed New
World, a Grown-Ups area, validated save export/import, privacy guidance, credits,
loading and recovery presentation, pause/title return, and save feedback.

Progress uses primary, backup, and interrupted-write safety copies. Existing
saves migrate to schema 12 without intentionally resetting world state. An
exported save can be kept outside the browser and restored after validation and
confirmation.

Comfort options include gentle motion, larger words, stronger colors, instant
replies, music and sound controls, idle-animation control, autonomous-movement
control, and Low/Medium/High picture detail.

The intended minimum target remains a fourth-generation Intel Core system with
Intel HD 4400/4600 and 8 GB RAM using Low or Medium detail. Actual stable
performance on the designated older laptop still requires physical validation.
Automated browser validation is Chromium-based; current Chrome, Edge, Firefox,
and representative touch hardware remain final approval items.

See `docs/KNOWN_LIMITATIONS.md`, `docs/PRIVACY_NOTICE.md`, and
`docs/SAVE_IMPORT_EXPORT.md` for details.

## ART.1E — Hero Procedural Cast and Scene Polish

The family companions and world NPCs now use a cohesive custom procedural style
instead of the mismatched lightweight GLB pack. All six locations receive a
non-interactive decorative pass, and the latest offline dialogue improvements
are included. Existing saves, dialogue memories, gifts, rooms, and stable IDs
remain compatible.

## ART.1F — Toy Sheen and Scene Depth

The world now uses soft finish-aware highlights rather than an almost completely
matte response. Colorful furniture and characters read more like painted toys,
while walls remain subdued and glass, ceramic, wood, fabric, hair, skin, and
metal respond differently. Slightly cool fill light, warm key light, and
lightweight furniture contact shadows add depth without introducing expensive
post-processing or PBR materials.
