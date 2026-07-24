# LIFE.1 Accelerated — NPCs and living characters

LIFE.1 adds lightweight, location-aware life to unselected playable characters
and introduces a reusable NPC layer without changing the player's authoritative
movement and placement controls.

## Playable-character autonomy

- Only unselected characters in the active room receive living updates.
- Blinks, sway, head turns, nearby looks, expression reactions, seated poses,
  sleep breathing and held-item motion are handled by the existing character rig.
- Decisions are staggered at multi-second intervals with different seeds for
  Khadija, her sister and her brother.
- Short walks use the existing target-walking code, a radius under one world
  unit, room bounds and simple furniture exclusion areas.
- Selecting a character immediately cancels their autonomous destination,
  clears their look target and restores their saved expression.
- Small walks do not change locations or consume held items.

## NPC framework

The NPC data model stores an ID, name, home location, safe position, outfit,
role, behavior set, prompt, dialogue, current activity, held item and optional
workstation or seat. NPCs use the same lightweight visual and gesture rig but
are never added to the playable-character selector.

Initial residents:

- **Mama** — family-home guardian with gentle social and reading behavior.
- **Auntie Noor** — street neighbor who looks toward visitors, flowers and the
  mailbox and offers a friendly wave.
- **Ms. Sana** — Sunny Café worker who watches customers, makes small counter
  motions, serves an available drink or treat and returns to her workstation.

NPCs can greet the selected character, safely receive an item, return a held
item, react to nearby item use and provide café service.

## Saving

The save format is version 8. Existing version 7, version 6 and earlier saves
retain character, content, room, prop, lighting, outfit, inventory and settings
state. New living settings default on. NPC locations are locked to their home
location, invalid positions restore to a small safe area, invalid stations fall
back to their definition, and animation timers are never saved.

## Performance

- One resident NPC is active in each populated location.
- Inactive-room rigs receive no per-frame animation or decision updates.
- Decisions are checked four times per second and scheduled several seconds apart.
- No navigation mesh, physics, behavior-tree package or additional runtime
  dependency is used.
- Both living settings can be disabled independently; turning off little walks
  keeps the subtle idle animation.
