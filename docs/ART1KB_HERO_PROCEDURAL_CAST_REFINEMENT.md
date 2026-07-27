# ART.1K-B — Hero Procedural Cast Refinement

ART.1K-B strengthens the shared Babylon procedural character language without
changing character IDs, save data, movement, interaction, or dialogue systems.

## Refinement goals

- keep all facial and hair elements registered to the complete head rig
- create clearer age and role silhouettes through controlled proportions
- improve face readability at normal gameplay distance
- keep leg-length variation grounded at the shoe sole
- remove legacy hoodie details from non-hoodie outfits
- reduce avoidable material duplication

## Profile controls

Each `HeroCharacterProfile` now defines:

### Head and face

- overall head scale
- face width, head height, and head depth
- eye spacing and horizontal eye scale
- ear, nose, mouth, and cheek scale

### Body

- neck width
- torso width and height
- shoulder width
- arm length
- hand size
- leg length
- foot size

All values remain visual-only and operate inside the existing procedural rig.

## Geometry changes

`applyHeroCharacterPolish` now:

- scales the complete head pivot instead of only the head sphere
- adjusts existing eye, pupil, cheek, nose, mouth, hand, and shoe geometry
- adds a small neck and thumb forms
- adds lightweight nostrils and mouth corners
- grounds each leg pivot after leg scaling
- reuses one hero shoe material per character
- tags refined meshes with `heroRefinement: "ART.1K-B"`

## Outfit correction

The original procedural base names its emblem meshes after their shapes
(`flower`, `star`, or `heart`). The old polish layer searched only for the word
`emblem`, so those shapes could remain visible through non-hoodie outfits.

ART.1K-B hides the actual flower, star, and heart meshes whenever the profile is
not a hoodie.

## Tests

The profile test now verifies:

- companion coverage
- complete NPC coverage
- safe numeric proportion limits
- unique full silhouette signatures
- toddler-to-child proportion hierarchy
