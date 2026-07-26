# ART.1G Family Home Art Direction

## Goal

Use the existing procedural Babylon.js system to make the family home feel like
a polished, warm, toy-like dollhouse on High graphics while retaining a low-cost
fallback for older laptops.

The family home is the benchmark location. Later scene passes must reuse its
rules rather than inventing a separate visual style.

## Visual rules

### 1. Layer broad shapes

Large flat surfaces receive depth through trim, frames, rails, inset panels,
soft edges, or grouped objects. Decoration should strengthen the silhouette and
not merely add random clutter.

### 2. Build clear focal areas

The home has three focal areas:

- the window and sofa living area;
- the coffee table and media wall;
- the mint kitchen and island.

Each area has a dominant color, supporting neutrals, small warm accents, and a
clear visual story.

### 3. Preserve gameplay readability

Interaction meshes remain visually obvious. Decorative meshes are non-pickable,
do not define collision, and do not replace saved gameplay objects.

### 4. Use finish-aware materials

Fabric, painted toy surfaces, wood, ceramic, glass, metal, plaster, and shadows
retain the ART.1F finish profiles. Walls remain quiet while curved furniture,
ceramics, and accessories catch soft highlights.

### 5. Add life sparingly

High graphics adds very small motion:

- curtain breathing;
- kettle steam;
- plant sway;
- clock movement;
- a soft emissive pulse.

No animation should distract from character play or cause visual jitter.

## ART.1G additions

- crown moulding and chair rails;
- shallow wainscot wall panels;
- finished kitchen-divider trim;
- miniature outdoor window scene;
- layered curtain folds and sill plants;
- sofa piping, tuft buttons, and throw blanket;
- coffee-table lower shelf, books, tray, vase, and flowers;
- media-console hardware, speakers, and layered TV story shapes;
- shaker-style cabinet rails and toe kicks;
- integrated oven, hob, under-cabinet glow, kettle, fruit bowl, plates, and
  chopping board;
- wall clock, picture ledge, photo frames, basket, and larger plant;
- decorative environmental motion restricted to the High detail layer.

## Constraints

- No new GLB environment assets.
- No PBR conversion required.
- No bloom, SSAO, outline post-process, or dynamic shadow-map requirement.
- No changes to save schema or stable interaction identifiers.
- Low and adaptive protection remain mandatory.
