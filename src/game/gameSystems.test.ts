import { describe, expect, it } from "vitest";
import { createDefaultEverydayState } from "./everydayState";
import { ContainerController, RecipeSystem } from "./everydayControllers";
import { QUALITY_SETTINGS } from "./quality";

describe("everyday systems", () => {
  it("enforces portable-container capacity and prevents self-storage", () => {
    const state = createDefaultEverydayState();
    const containers = new ContainerController(state);
    expect(containers.put("backpack", "backpack").accepted).toBe(false);
    expect(containers.put("backpack", "book").accepted).toBe(true);
    expect(containers.put("backpack", "teddy").accepted).toBe(true);
    expect(containers.put("backpack", "apple").accepted).toBe(true);
    expect(containers.put("backpack", "cup").accepted).toBe(false);
  });

  it("completes recipes only with the correct station inputs", () => {
    const state = createDefaultEverydayState();
    const recipes = new RecipeSystem(state);
    expect(recipes.addInput("prep-plate", "bread").accepted).toBe(true);
    expect(recipes.addInput("prep-plate", "cheese").accepted).toBe(true);
    expect(recipes.completed("prep-plate")?.result).toBe("sandwich");
    expect(recipes.completed("mixing-bowl")).toBeNull();
  });
});

describe("graphics presets", () => {
  it("maps low, medium, and high behavior consistently", () => {
    expect(QUALITY_SETTINGS.low.hardwareScalingLevel).toBeGreaterThan(1);
    expect(QUALITY_SETTINGS.low.decorativeDetails).toBe(false);
    expect(QUALITY_SETTINGS.adaptive.adaptive).toBe(true);
    expect(QUALITY_SETTINGS.adaptive.decorativeDetails).toBe(false);
    expect(QUALITY_SETTINGS.balanced.enhancedLighting).toBe(true);
    expect(QUALITY_SETTINGS.balanced.decorativeDetails).toBe(true);
  });
});
