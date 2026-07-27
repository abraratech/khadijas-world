# ART.1D — Lightweight Family and World NPCs

## Scope

ART.1D integrates five selected CC0 characters from the Quaternius Ultimate
Animated Character Pack:

- Brother — `Casual2_Male`
- Auntie Noor — `Casual2_Female`
- Ms. Sana — `Chef_Female`
- Mr. Sami — `Worker_Male`
- Mr. Kareem — `Worker_Female`

Little Sister, Auntie Layla, and Mrs. Huda retain their procedural visuals.

## Stable gameplay ownership

The GLBs replace only visible character artwork. Existing logical roots still
own:

- movement and location bounds
- click/touch interaction metadata
- held-item anchors
- save-compatible positions and rotations
- NPC IDs, dialogue, memory, and relationships
- seats, workstations, and autonomous decisions

A failed or unavailable GLB reveals the existing procedural model without
changing gameplay state.

## Animation mapping

The selected models share these semantic clips:

| Semantic action | Exported clip |
| --- | --- |
| Idle | `Idle` |
| Walk | `Walk` |
| Run | `Run` |
| Walk while carrying | `Walk_Carry` |
| Pick up | `PickUp` |
| Sit transition | `SitDown` |
| Stand transition | `StandUp` |

ART.1D actively uses `Idle`, `Walk`, and `Walk_Carry`. The remaining mappings
are registered for later interaction/seating transition work. Unsupported
specialist poses continue to use procedural fallback.

## Loading policy

- Khadija and Mama: eager startup load on Adaptive/Balanced.
- Brother: load when Brother's saved room is active.
- Auntie Noor: first Neighborhood visit.
- Ms. Sana: first Sunny Café visit.
- Mr. Sami: first Park visit.
- Mr. Kareem: first Grocery visit.

Once a visual is loaded, disabling it does not dispose its GLB. Returning to the
location reuses the existing parsed scene objects. This is a simple one-instance
location cache, not yet a general multi-instance `AssetContainer` service.

The Quaternius characters are enabled on Low because they are only about
2,500–8,800 triangles each and contain no image textures. High-detail Meshy
Khadija and Mama retain the previous Low-quality fallback policy.

## Known limitations

- Brother still has adult-derived proportions despite being scaled to a shorter
  height.
- Character material palettes are fixed except Brother's green shirt edit.
- Production seating and specialist gestures are not yet fully connected.
- Procedural held-item anchors remain the authoritative gameplay anchors.
- Facing direction and target height require visual approval in each location.
