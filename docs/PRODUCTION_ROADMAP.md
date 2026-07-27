# Khadija's World Production Roadmap

This roadmap fixes the order of work so ideas are recorded in the correct
milestone rather than implemented twice or out of sequence. Only crashes, save
loss, broken interactions, unsafe dialogue, severe readability problems, or
major performance regressions interrupt the plan.

## Completed

| Milestone | Status | Scope |
|---|---|---|
| Architecture.1 | Approved | Modular world and location architecture |
| ART.1A | Complete | Khadija production character and fallback pipeline |
| ART.1B | Complete | Initial home and everyday-item polish |
| ART.1C | Complete | Mama GLB experiment, chat, fit, and pose fixes |
| ART.1D | Superseded visually | Lightweight GLB NPC experiment; archived |
| ART.1E | Complete | Hero procedural cast, dialogue updates, first scene layer |
| ART.1F | Complete | Finish-aware materials, lighting contrast, contact depth |
| ART.1G | Complete | Family-home benchmark, framing, viewport mask, procedural Mama |
| ART.1H | Complete | Bedroom quality pass and source-only interior-pack workflow |
| ART.1I | Complete | Café and grocery commercial interior quality pass |
| ART.1J | Complete | Neighborhood and park exterior quality pass |
| ART.1K-A | Complete | Selective High-only interior furniture activation |

## Current milestone

### ART.1K-B — Hero Procedural Cast Refinement

The readability foundation and selective furniture activation are complete.
The current work returns to the remaining character-refinement portion.

#### Completed — Readability foundation

- remove the obsolete selection ring around Khadija;
- add mouse-hover and touch context labels for interactive objects;
- add High-quality play-set plaques for ambiguous appliances, storage, service
  areas, and shop departments;
- add small appliance controls, handles, badges, and other silhouette cues;
- preserve every stable ID, action manager, collision proxy, and save field.

Approval gate:

- Khadija has no floor ring;
- labels identify interactive objects without blocking input;
- High gains readable physical signage while Low remains lightweight;
- labels feel like part of a polished toy world rather than developer debug UI;
- all item, travel, furniture, NPC, and dialogue interactions remain unchanged.

#### Current — Hero procedural cast refinement

- refine faces, eyelids, brows, mouths, hands, shoes, hair, and clothing layers;
- recalibrate adult, child, toddler, and elder proportions beside Khadija;
- improve blinking, talking, waving, carrying, sitting, work idles, and child
  idles;
- keep Mama, siblings, and world NPCs visually distinct rather than recolored
  copies;
- retain the current lightweight procedural fallback architecture.

## Planned milestones

### ART.1L — Prop Remodelling and Interaction Animation Pass

- rebuild weak prop silhouettes instead of relying only on labels;
- add packaging, decals, seams, rims, handles, lids, buttons, and category color
  systems;
- improve pickup, placement, handover, eating, drinking, cooking, reading,
  shopping, carrying, and tidying feedback;
- preserve stable item IDs, recipes, storage, containers, and save data.

### ART.1M — Interface, Dialogue Presentation, and Audio

Polish dialogue presentation, portraits, suggestions, friendship feedback, HUD,
touch targets, accessibility, transitions, music, and sound. The context-label
visual style established in ART.1K becomes part of the final UI language.

### ART.1N — Quality Profiles and Performance Certification

Tune Low, Adaptive, and High separately; measure draw calls, meshes, memory,
startup, and frame rate; validate the Intel HD 4400/4600-class laptop; remove
unused archived runtime assets after rollback approval.

### ART.1O — Final QA and Release

Complete save migration, import/export, input, accessibility, location, NPC,
dialogue, item, documentation, credit, and deployment regression testing.

## Placement guide

| New idea | Milestone |
|---|---|
| NPC face, hair, outfit, proportions, or idle | ART.1K |
| Object identification, hover/touch label, or physical sign | ART.1K |
| Item silhouette, packaging, or hand interaction | ART.1L |
| Dialogue UI, HUD, sound, or accessibility presentation | ART.1M |
| Frame rate, quality switching, asset cleanup | ART.1N |
| Save migration and final release readiness | ART.1O |
