# ART.1E Dialogue Update

The project-owner supplied full replacements for:

- `src/game/dialogue/DialogueController.ts`
- `src/game/dialogue/IntentRecognizer.ts`
- `src/game/content/dialogue/npcProfiles.ts`

The update expands natural-language phrases for existing intents, adds more
personality-specific NPC fallback responses, and ensures unknown messages use
the active NPC's own fallback pool rather than the shared generic unknown
template.

The bounded offline architecture, local memory store, safe redirects, stable NPC
IDs, and authored response templates remain unchanged.
