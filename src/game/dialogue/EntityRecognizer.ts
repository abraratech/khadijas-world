import { ENTITY_ALIASES, type EntityKind } from "./entityAliases";

export interface RecognizedEntity {
  id: string;
  label: string;
  kind: EntityKind;
}

function normalizedWords(text: string): string {
  return ` ${text.toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9'\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

export function recognizeEntities(text: string): RecognizedEntity[] {
  const normalized = normalizedWords(text);
  const found: RecognizedEntity[] = [];
  for (const definition of ENTITY_ALIASES) {
    if (!definition.aliases.some((alias) => normalized.includes(` ${alias} `))) continue;
    if (found.some((entry) => entry.id === definition.id && entry.kind === definition.kind)) continue;
    found.push({ id: definition.id, label: definition.label, kind: definition.kind });
  }
  return found;
}

