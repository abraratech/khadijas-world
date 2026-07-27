# ART.1F — Toy Sheen, Lighting Contrast, and Contact Depth

ART.1F addresses the flat, chalky appearance identified during visual review.
The diagnosis was directionally correct: the project used extremely weak
specular values across its shared materials, decorative art pass, and hero
procedural cast.

The exact ART.1E values were:

- Shared `createMaterial`: specular `0.035`, power `56`
- Decorative scene materials: specular `0.025`, power `56`
- Hero procedural materials: mostly specular `0.035`, power `48`

Those values were even lower than the suggested `0.06` estimate. The game had
four direct `StandardMaterial` construction paths, and ART.1F now covers all of
them.

## Material finish system

`src/game/shared/createMaterials.ts` now defines inexpensive StandardMaterial
finish profiles:

- matte
- fabric
- skin
- hair
- wood
- soft-toy
- ceramic
- metal
- glass
- shadow

Material names are classified automatically for existing call sites, while new
code can request an explicit finish. Generic colorful surfaces use a soft toy
sheen of `0.18` with power `30`. Walls and roads remain more matte; glass,
ceramic, and metal receive stronger highlights; contact shadows receive none.

This remains the same StandardMaterial shader path. It does not add texture
memory, PBR materials, post-processing, outlines, or extra render passes.

## Lighting contrast

The global fill light is now slightly cool and the directional key light is
slightly warm. Scene ambient contribution is reduced so the key/fill separation
is visible instead of being washed out.

The room-aware intensity logic remains intact. Lamps, outdoor rooms, café,
grocery, home, bedroom, and quality presets still control brightness as before.

## Contact shadows

The family home already included several soft furniture shadows. ART.1F adds a
small number of inexpensive translucent discs under major static props in the
bedroom, street, café, park, and grocery.

These shadows:

- are non-interactive
- are double-sided
- ignore scene lighting
- are part of the decorative detail layer
- can be disabled with Low quality
- do not alter collisions, seats, hotspots, or saves

## Deliberate limits

ART.1F does not introduce bloom, SSAO, PBR conversion, shadow maps, cel shaders,
or outlines. Those features remain deferred until the cheaper material and
lighting changes are evaluated on the target older laptop.
