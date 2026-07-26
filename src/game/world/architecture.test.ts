import { describe, expect, it, vi } from "vitest";
import { CHARACTER_IDS, COMPANION_CHARACTER_IDS, PLAYABLE_CHARACTER_IDS } from "../characterState";
import { CHARACTER_VISUAL_SEMANTIC_KEYS } from "../characters/createCharacterVisual";
import { WORLD_MATERIAL_KEYS } from "../shared/createMaterials";
import { DisposableBag } from "../shared/interactionHelpers";
import { ExclusiveInteractionSlotRegistry } from "../shared/interactionSlotRegistry";
import { WORLD_LOCATION_IDS, WorldRegistry } from "./WorldRegistry";

describe("modular world contracts", () => {
  it("activates one registered location at a time", () => {
    const home = {
      id: "home",
      activate: vi.fn(),
      deactivate: vi.fn(),
      dispose: vi.fn(),
    };
    const cafe = {
      id: "cafe",
      activate: vi.fn(),
      deactivate: vi.fn(),
      dispose: vi.fn(),
    };
    const registry = new WorldRegistry<typeof home | typeof cafe>();
    registry.register(home);
    registry.register(cafe);

    registry.activate("home");
    registry.activate("cafe");
    registry.activate("cafe");

    expect(home.activate).toHaveBeenCalledTimes(1);
    expect(home.deactivate).toHaveBeenCalledTimes(1);
    expect(cafe.activate).toHaveBeenCalledTimes(1);
    expect(registry.active()).toBe(cafe);
  });

  it("disposes every location exactly once", () => {
    const location = {
      id: "home",
      activate: vi.fn(),
      deactivate: vi.fn(),
      dispose: vi.fn(),
    };
    const registry = new WorldRegistry<typeof location>();
    registry.register(location);
    registry.activate("home");
    registry.dispose();
    registry.dispose();

    expect(location.deactivate).toHaveBeenCalledTimes(1);
    expect(location.dispose).toHaveBeenCalledTimes(1);
  });

  it("keeps interaction slots exclusive", () => {
    const slots = [
      { id: "left", occupiedBy: null as string | null },
      { id: "right", occupiedBy: null as string | null },
    ];
    const registry = new ExclusiveInteractionSlotRegistry(slots);

    expect(registry.claim("left", "khadija")).toBe(true);
    expect(registry.claim("left", "sister")).toBe(false);
    expect(registry.claim("right", "khadija")).toBe(true);
    expect(slots[0].occupiedBy).toBeNull();
    expect(slots[1].occupiedBy).toBe("khadija");
  });

  it("exposes stable character and material semantic keys", () => {
    expect(CHARACTER_VISUAL_SEMANTIC_KEYS).toContain("heldItemAnchor");
    expect(CHARACTER_VISUAL_SEMANTIC_KEYS).toContain("sleepAnchor");
    expect(WORLD_MATERIAL_KEYS).toEqual(expect.arrayContaining([
      "floor",
      "pink",
      "teal",
      "glass",
    ]));
  });

  it("preserves save-compatible world and character IDs", () => {
    expect(WORLD_LOCATION_IDS).toEqual([
      "home",
      "bedroom",
      "street",
      "cafe",
      "park",
      "grocery",
    ]);
    expect(CHARACTER_IDS).toEqual(["khadija", "sister", "brother"]);
    expect(PLAYABLE_CHARACTER_IDS).toEqual(["khadija"]);
    expect(COMPANION_CHARACTER_IDS).toEqual(["sister", "brother"]);
  });

  it("runs listener cleanup in reverse order only once", () => {
    const calls: string[] = [];
    const bag = new DisposableBag();
    bag.add(() => calls.push("first"));
    bag.add(() => calls.push("second"));
    bag.dispose();
    bag.dispose();
    expect(calls).toEqual(["second", "first"]);
  });
});
