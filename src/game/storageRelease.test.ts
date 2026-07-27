import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDefaultWorldSave,
  exportWorldSave,
  hasExistingWorld,
  importWorldSave,
  loadSave,
  previewWorldSaveImport,
  saveQualityPreset,
  startNewWorld,
} from "./storage";

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("release world saves", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new MemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates one complete schema-12 default world", () => {
    const save = createDefaultWorldSave();
    expect(save.version).toBe(12);
    expect(save.activeRoom).toBe("home");
    expect(Object.keys(save.characters)).toEqual(["khadija", "sister", "brother"]);
    expect(save.release.chatPrivacyAcknowledged).toBe(false);
  });

  it("does not mistake initialization writes for a completed first launch", () => {
    expect(hasExistingWorld()).toBe(false);
    saveQualityPreset("adaptive");
    expect(hasExistingWorld()).toBe(false);
    expect(startNewWorld()).toBe(true);
    expect(hasExistingWorld()).toBe(true);
  });

  it("preserves comfort settings when starting a new world", () => {
    expect(startNewWorld({
      sound: false,
      music: true,
      reducedMotion: true,
      qualityPreset: "low",
    })).toBe(true);
    const save = loadSave();
    expect(save.sound).toBe(false);
    expect(save.music).toBe(true);
    expect(save.accessibility.reducedMotion).toBe(true);
    expect(save.qualityPreset).toBe("low");
    expect(save.release.firstLaunchComplete).toBe(true);
  });

  it("migrates an existing schema-11 world without wiping its active state", () => {
    const legacy = createDefaultWorldSave();
    legacy.version = 11 as 12;
    legacy.activeRoom = "park";
    legacy.selectedCharacter = "sister";
    legacy.characters.sister.room = "park";
    localStorage.setItem("khadijas-world:world-2", JSON.stringify(legacy));
    expect(hasExistingWorld()).toBe(true);
    const migrated = loadSave();
    expect(migrated).toMatchObject({
      version: 12,
      activeRoom: "park",
      selectedCharacter: "khadija",
      release: { firstLaunchComplete: true },
    });
    expect(migrated.characters.khadija.room).toBe("park");
    expect(migrated.characters.sister.room).toBe("park");
    expect(localStorage.getItem("khadijas-world:world-2:pre-migration")).not.toBeNull();
  });

  it("rejects malformed, oversized, and duplicate-ownership imports", () => {
    expect(previewWorldSaveImport("{bad").accepted).toBe(false);
    expect(previewWorldSaveImport("x".repeat(1_000_001)).accepted).toBe(false);
    const duplicate = createDefaultWorldSave();
    duplicate.characters.khadija.heldItem = "apple";
    duplicate.characters.sister.heldItem = "apple";
    expect(previewWorldSaveImport(JSON.stringify(duplicate)).message).toContain("same item");
  });

  it("imports a validated save while preserving the prior primary as backup", () => {
    expect(startNewWorld({ qualityPreset: "low" })).toBe(true);
    const imported = createDefaultWorldSave();
    imported.activeRoom = "grocery";
    imported.selectedCharacter = "brother";
    imported.characters.brother.room = "grocery";
    const raw = JSON.stringify(imported);
    expect(previewWorldSaveImport(raw)).toMatchObject({ accepted: true, schemaVersion: 12 });
    expect(importWorldSave(raw).accepted).toBe(true);
    expect(loadSave()).toMatchObject({ activeRoom: "grocery", selectedCharacter: "khadija" });
    expect(loadSave().characters.brother.room).toBe("grocery");
    expect(localStorage.getItem("khadijas-world:world-2:backup")).not.toBeNull();
    const exported = exportWorldSave();
    expect(JSON.parse(exported)).toMatchObject({ version: 12, activeRoom: "grocery" });
    expect(exported).not.toContain("deviceId");
    expect(exported).not.toContain("debug");
  });
});
