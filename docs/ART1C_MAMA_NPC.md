# ART.1C Mama NPC Integration

## Scope

ART.1C adds one production NPC visual without changing the logical NPC system.
The stable NPC ID remains:

```text
parent
```

The existing procedural rig continues to own:

- World position and rotation
- Movement bounds and path targets
- Held-item anchor
- Offline dialogue activation
- Memory and relationship state
- Save restoration
- Autonomous decisions
- Fallback rendering

The Meshy GLB is parented beneath that stable rig and supplies:

- Visible body
- Embedded materials and texture
- Skeleton and skinning
- Walking animation
- Pick metadata for the existing Mama dialogue

## Startup loading

`createWorldRuntime` runs while the title screen is visible. On Adaptive and
High quality, Khadija and Mama therefore begin loading immediately and
concurrently. On Low quality, neither production GLB is requested and the
procedural visuals remain active.

This is intentionally limited to the initial home cast. Loading every NPC and
location at startup would increase download, parse, texture upload, and memory
costs. Future scene shells should use a location-aware cache and load only the
initial home eagerly.

## Asset data

- Production file: `public/assets/characters/mama/mama-v1.glb`
- File size: 10,240,272 bytes
- Triangles: 72,269
- Vertices: 39,971
- Materials: 1
- Embedded texture: 2048×2048 PNG
- Skeleton: 24 joints
- Animation: `Armature|walking_man|baselayer`
- Animation duration: approximately 1.07 seconds
- Procedural fallback: `parent`

## Limitations

- No dedicated idle, reading, giving, receiving, sitting, or facial clips
- Held-item alignment still uses the existing procedural Mama hand anchor
- The production model uses the neutral/reset animation pose while stationary
- Low quality intentionally uses the procedural model
- Actual Intel HD target performance requires physical validation
