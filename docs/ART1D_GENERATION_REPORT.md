# ART.1D Generation Report

## Integrated assets

| Role | Source model | GLB size | Triangles | Materials | Joints |
| --- | --- | ---: | ---: | ---: | ---: |
| Brother | Casual2_Male | 1,068,464 bytes | 3,216 | 6 | 23 |
| Auntie Noor | Casual2_Female | 1,252,444 bytes | 6,752 | 6 | 23 |
| Ms. Sana | Chef_Female | 1,359,156 bytes | 8,768 | 6 | 23 |
| Mr. Sami | Worker_Male | 1,030,480 bytes | 2,524 | 6 | 23 |
| Mr. Kareem | Worker_Female | 1,216,672 bytes | 5,856 | 7 | 23 |

All five assets include `Idle`, `Walk`, `Run`, `Walk_Carry`, `PickUp`,
`SitDown`, and `StandUp` among the original 17 animation clips.

## Implementation

- Converted self-contained embedded glTF files to single-file GLBs.
- Recolored Brother's shirt green in the GLB material definition.
- Preserved stable Brother and NPC IDs and the existing procedural gameplay roots.
- Added real idle and walk/carry animation selection.
- Added active-location load-on-first-use behavior for world NPCs.
- Retains loaded visuals for immediate return visits.
- Allows lightweight Quaternius visuals on Low while keeping Meshy hero fallback policy.

## Validation completed in the generation environment

- Asset manifest and GLB integrity validation: passed for 7 production assets.
- TypeScript syntax transpilation: 55 files, zero diagnostics.
- Pure asset-registry behavior checks: passed.
- JSON parsing and package metadata checks: passed.

## Validation still required on Windows

- `npm test`
- `npm run build`
- `npm run deploy:wamp`
- visual scale/facing checks in each location
- click, dialogue, held-item, save/continue, and fallback checks
