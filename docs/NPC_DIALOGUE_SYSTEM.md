# Offline NPC Dialogue System

Khadija's World uses a bounded, deterministic dialogue engine. It does not send
messages to a server, call a browser language model, use an API key, or generate
unrestricted text.

## Flow

1. The player taps an NPC and chooses a suggested topic or enters a short message.
2. `IntentRecognizer` matches a fixed family-friendly intent.
3. `EntityRecognizer` resolves known characters, locations, items, activities,
   and emotions through authored aliases.
4. `DialogueController` selects an authored response template permitted by that
   NPC's profile and fills it with current local world context.
5. `NpcMemoryStore` records only bounded, structured information.

Unknown input receives a general prompt about supported topics. Unsupported or
inappropriate terms receive a safe redirection. Player messages are stripped of
control characters, whitespace-normalized, escaped by DOM `textContent`, and
limited to 160 characters.

## Memory and friendship

Each NPC can store up to ten recent conversation turns plus capped, deduplicated
lists of gifts, shared activities, important events, recent topics, and summary
facts. Memories reference local item, activity, event, and character IDs. The
engine only recalls records that exist; missing memories produce an honest
"I don't remember" response. Friendship points never decrease below zero.

Players can disable all NPC chat, disable typed messages while retaining suggested
topics, stop new conversation memory from being persisted, clear one NPC's memory,
or clear all NPC conversation memories. Clearing memories does not reset the world.

## Adding content safely

- Add or update an NPC profile in `src/game/content/dialogue/npcProfiles.ts`.
- Add family-friendly templates in `dialogueTemplates.ts`.
- Extend aliases in `entityAliases.ts` only for known local content.
- Keep new lists bounded in `NpcMemory.ts` and `NpcMemoryStore.ts`.
- Do not add network calls, unrestricted evaluation, HTML insertion, or secrets.

Intent, entity, template, and memory diagnostics appear only when the game is
opened with `?debug=1`.
