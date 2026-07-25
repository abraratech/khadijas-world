import { describe, expect, it } from "vitest";
import { readReliableJson, writeReliableJson, type StorageLike } from "./saveReliability";

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const keys = { primary: "world", backup: "backup", temporary: "temporary" };

describe("reliable saves", () => {
  it("keeps the previous valid primary as a backup", () => {
    const storage = new MemoryStorage();
    expect(writeReliableJson(storage, keys, { version: 1, value: "first" })).toBe(true);
    expect(writeReliableJson(storage, keys, { version: 2, value: "second" })).toBe(true);
    expect(JSON.parse(storage.getItem("backup")!)).toEqual({ version: 1, value: "first" });
    expect(storage.getItem("temporary")).toBeNull();
  });

  it("falls back to the backup after malformed primary data", () => {
    const storage = new MemoryStorage();
    storage.setItem("world", "{broken");
    storage.setItem("backup", JSON.stringify({ version: 1, safe: true }));
    const result = readReliableJson<{ version: number; safe: boolean }>(storage, keys);
    expect(result.source).toBe("backup");
    expect(result.value?.safe).toBe(true);
    expect(result.invalidKeys).toContain("world");
  });
});
