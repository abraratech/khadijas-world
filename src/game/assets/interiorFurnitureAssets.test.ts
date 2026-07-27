import { describe, expect, it } from "vitest";
import {
  createInteriorFurniturePlacements,
  INTERIOR_REVIEW_ONLY_ASSETS,
} from "./interiorFurnitureAssets";
import { furnitureFinishForMaterial } from "./productionFurnitureVisual";

describe("ART.1K-A selective interior furniture", () => {
  it("keeps runtime placements selective and room-aware", () => {
    const placements = createInteriorFurniturePlacements({
      bedroom: 22,
      cafe: 66,
      grocery: 110,
    });
    expect(new Set(placements.map(({ id }) => id)).size).toBe(placements.length);
    expect(placements.filter(({ room }) => room === "home").length).toBe(4);
    expect(placements.filter(({ room }) => room === "bedroom").length).toBe(5);
    expect(placements.filter(({ room }) => room === "cafe").length).toBe(10);
    expect(placements.filter(({ room }) => room === "grocery").length).toBe(3);
    expect(INTERIOR_REVIEW_ONLY_ASSETS).toHaveLength(6);
  });

  it("faces imported kitchen modules toward the dollhouse camera", () => {
    const placements = createInteriorFurniturePlacements({
      bedroom: 22,
      cafe: 66,
      grocery: 110,
    });
    const kitchenShells = placements.filter(({ id }) => (
      id.startsWith("home-")
      || id.startsWith("cafe-back-")
      || id.startsWith("grocery-fridge-")
    ));
    expect(kitchenShells).toHaveLength(9);
    expect(kitchenShells.every(({ rotationY }) => rotationY === Math.PI)).toBe(true);
  });

  it("restores meaningful colors to legacy Blender material names", () => {
    expect(furnitureFinishForMaterial("Plant_Green").color.g).toBeGreaterThan(.4);
    expect(furnitureFinishForMaterial("LightMetal").metallic).toBeGreaterThan(.5);
    expect(furnitureFinishForMaterial("Glass").alpha).toBeLessThan(1);
    expect(furnitureFinishForMaterial("UnknownMaterial").roughness).toBeGreaterThan(.5);
  });
});
