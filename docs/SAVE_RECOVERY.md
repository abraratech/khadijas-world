# Save Recovery

Save schema 11 uses four local slots:

- primary world
- last-known-good backup
- temporary in-progress write
- pre-migration snapshot

Before replacing the primary slot, the game verifies and preserves the last valid
primary. It writes the new value to a temporary slot, promotes it, parses the
result, and then removes the temporary copy.

On startup, the game tries the primary, backup, and interrupted temporary copy in
that order. If the primary is malformed but a later copy is valid, that copy is
restored and the player receives gentle wording. If no copy is valid, a fresh
in-memory world is offered without immediately deleting the unreadable data.

Schema 11 also normalizes missing fields and invalid enums, bounds NPC dialogue
memory, removes duplicate item ownership across hands/storage/containers, and
releases duplicate exclusive seats. Saves from schema 10 and earlier are retained
in the pre-migration slot before the next successful write.

Debug mode records the number of invalid save slots. Normal play never shows JSON,
storage keys, schema wording, or exception details.
