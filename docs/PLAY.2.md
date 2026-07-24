# PLAY.2 Accelerated

PLAY.2 turns the existing dollhouse world into a three-character play space while
keeping the four locations and all earlier interactions intact.

## Playable family

- Khadija, her little sister and her brother each keep an independent location,
  position, outfit, expression, held item and activity.
- The portrait tray switches the active character and follows them to their saved
  location.
- Clicking a character selects them. Dragging places them on valid room floors or
  snaps them into a nearby available furniture slot.
- Nearby characters can receive a held item by being clicked.

## Expressions and activity

The mood picker offers happy, excited, sleepy, surprised and neutral expressions.
Each lightweight placeholder rig has its own blink, head movement and sway timing.
Walking and furniture poses override the idle motion, and beds use a sleepy pose.

Sofas, the bedroom bed, the street bench and café chairs use distinct seat slots.
A slot occupied by one character cannot be assigned to another character.

## Save format

The world save format is version 6. Character state is stored as a record keyed by
stable character IDs. Version 5 and earlier saves migrate automatically:

- Khadija keeps her saved room, position, outfit, held item and seated state.
- Existing prop positions, cupboard state and lamp states are retained.
- Existing picture-detail, sound and music settings are retained.
- The two new family members receive safe default states.

The old fields are mirrored in version 6 saves to keep downgrade and migration
tools predictable. Reset remains an explicit player action.

## Performance

The milestone uses simple meshes, shared room materials, transform-based
expressions and animations, and no physics engine. Only characters in the visible
location receive animation updates. The movement loop reuses its direction vector
and keeps save writes throttled.

## Diagnostics

The normal player interface contains no performance or engine information.
Existing diagnostics remain available only when the game is opened with
`?debug=1`.
