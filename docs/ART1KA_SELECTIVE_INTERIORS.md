# ART.1K-A Selective Interior Furniture

## Decision

The uploaded archive contained 20 valid GLBs: eight bedroom exports and twelve
commercial exports. Geometry, bounds, material names, file sizes, vertices, and
triangles were inspected before integration.

The files are very small and geometrically clean, but the first Blender export
retained legacy material names without exporting most glTF base-color factors.
Without correction, nearly every model would render white. The runtime therefore
maps stable material names such as `Wood`, `Kitchen`, `Plant_Green`, `LightMetal`,
and `Glass` to the project's toy-world palette. The Blender helper now also
copies legacy diffuse colors into Principled BSDF nodes for future exports.

## Runtime policy

- High graphics only.
- Load only when the relevant location is first visited.
- Keep loaded assets cached for later visits.
- Imported meshes are visual-only and non-pickable.
- Existing procedural meshes retain interactions, collisions, seats, storage,
  placement anchors, recipes, dialogue, and save identifiers.
- Procedural visuals return on Low, load failure, or rejected candidates.

## Active unique models

| Model | Active use |
| --- | --- |
| `Kitchen_Fridge` | Home kitchen and paired grocery refrigerators |
| `Kitchen_Cabinet2` | Home and café work cabinetry |
| `Kitchen_Sink` | Home and café sink shell |
| `Kitchen_Oven` | Home and café oven shell |
| `Curtains_Double` | Bedroom window treatment |
| `NightStand_1` | Bedroom bedside table |
| `Light_Desk` | Bedroom desk lamp |
| `Houseplant_6` | Bedroom floor plant |
| `Shelf_Small1` | Bedroom display shelf |
| `Table_RoundSmall2` | First Sunny Café table |
| `Chair_2` | First Sunny Café chair pair |
| `Stool` | Sunny Café counter stools |
| `Light_CeilingSingle` | Sunny Café pendant pair |
| `Trashcan_Small1` | Grocery waste bin |

These 14 unique models create 22 room placements.

## Review-only models

The following files are bundled and validated but never requested by the game:

- `Bed_Single`: less expressive than the approved layered procedural bed.
- `Carpet_2`: less readable than the current patterned bedroom rug.
- `Drawer_3`: useful geometry, but not a convincing replacement for the current
  wardrobe and would weaken the interaction label.
- `Shelf_Large`: reads more like a domestic bookcase than a grocery aisle.
- `Plate_1`: current procedural plate is already clearer at dollhouse scale.
- `Spoon`: too small to add meaningful scene readability in this camera.

## Source and license

Source: Quaternius Ultimate House Interior Pack. License: CC0 1.0 Universal.
Exact file hashes and geometry counts are recorded in `art/ASSET_MANIFEST.json`.
