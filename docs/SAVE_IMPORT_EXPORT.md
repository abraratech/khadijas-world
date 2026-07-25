# Save Import and Export

## Export

Grown-Ups can download the current normalized world as JSON. The file contains
gameplay state and player settings only: characters, NPCs, activities, local
conversation memories, relationships, locations, and preferences. It contains
no device identifier, account data, secret, telemetry, or debug record.

## Import

Imports are limited to 1 MB and parsed strictly as JSON. Before replacement the
game checks the supported schema range, required character records, known
character and NPC IDs, room-object identifier shape, held-item types, stored-item
types, and duplicate ownership. Invalid files leave the current world unchanged.

A valid import shows its save-format summary and requires explicit confirmation.
The reliable writer preserves the previous primary world as a backup before the
import becomes primary. On reload, normal migrations and state normalization run.
Imported content is treated only as data and is never executed.

Release 1 supports save schemas 1 through 12. Schema 12 adds release preferences
for first-launch completion and the one-time chat privacy reminder. Existing
world, NPC, memory, storage, recipe, shopping, park, accessibility, audio, and
graphics state is retained during migration.

Do not edit an exported save unless you understand the format. Import only files
from a trusted source.
