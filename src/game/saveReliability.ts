export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ReliableReadResult<T> {
  value: T | null;
  source: "primary" | "backup" | "temporary" | "none";
  invalidKeys: string[];
}

export interface ReliableSaveKeys {
  primary: string;
  backup: string;
  temporary: string;
}

function parsedObject<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as T
      : null;
  } catch {
    return null;
  }
}

export function readReliableJson<T>(
  storage: StorageLike,
  keys: ReliableSaveKeys,
): ReliableReadResult<T> {
  const invalidKeys: string[] = [];
  for (const [source, key] of [
    ["primary", keys.primary],
    ["backup", keys.backup],
    ["temporary", keys.temporary],
  ] as const) {
    let raw: string | null = null;
    try {
      raw = storage.getItem(key);
    } catch {
      invalidKeys.push(key);
      continue;
    }
    if (!raw) continue;
    const parsed = parsedObject<T>(raw);
    if (parsed) return { value: parsed, source, invalidKeys };
    invalidKeys.push(key);
  }
  return { value: null, source: "none", invalidKeys };
}

export function writeReliableJson<T extends object>(
  storage: StorageLike,
  keys: ReliableSaveKeys,
  value: T,
): boolean {
  try {
    const next = JSON.stringify(value);
    if (!parsedObject<T>(next)) return false;
    const current = storage.getItem(keys.primary);
    if (parsedObject<T>(current)) storage.setItem(keys.backup, current!);
    storage.setItem(keys.temporary, next);
    storage.setItem(keys.primary, next);
    if (!parsedObject<T>(storage.getItem(keys.primary))) return false;
    storage.removeItem(keys.temporary);
    return true;
  } catch {
    return false;
  }
}
