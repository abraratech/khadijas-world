import { describe, expect, it } from "vitest";
import {
  HOLDABLE_PRESENTATIONS,
  containerCompatibilityIssue,
  presentationFor,
  resolvePresentationForHolder,
} from "./productionItemVisuals";

describe("ART.1K-C holdable presentation registry", () => {
  it("defines stable presentation data for hero play items and portable containers", () => {
    expect(Object.keys(HOLDABLE_PRESENTATIONS)).toEqual(expect.arrayContaining([
      "teddy",
      "book",
      "apple",
      "cup",
      "serving-tray",
      "backpack",
      "basket",
      "shopping-basket",
      "shopping-bag",
      "picnic-basket",
      "prep-plate",
      "mixing-bowl",
    ]));
  });

  it("uses plausible positive scales, finite transforms, and compact footprints", () => {
    for (const presentation of Object.values(HOLDABLE_PRESENTATIONS)) {
      expect(presentation.floorY).toBeGreaterThanOrEqual(0);
      expect(presentation.holdScale.every((value) => value > 0 && value <= 1.5)).toBe(true);
      expect(presentation.holdOffset.every(Number.isFinite)).toBe(true);
      expect(presentation.holdRotation.every(Number.isFinite)).toBe(true);
      expect(presentation.footprint[0]).toBeGreaterThan(0);
      expect(presentation.footprint[0]).toBeLessThanOrEqual(1.25);
      expect(presentation.footprint[1]).toBeGreaterThan(0);
      expect(presentation.footprint[1]).toBeLessThanOrEqual(1.25);
    }
  });

  it("uses the hand anchor only for one-handed items", () => {
    const oneHand = resolvePresentationForHolder("cup", "child");
    const centered = [
      resolvePresentationForHolder("teddy", "child"),
      resolvePresentationForHolder("book", "child"),
      resolvePresentationForHolder("serving-tray", "child"),
      resolvePresentationForHolder("shopping-basket", "child"),
    ];

    expect(oneHand?.anchor).toBe("hand");
    expect(centered.every((presentation) => presentation?.anchor === "center")).toBe(true);
  });

  it("scales the same prop for toddler, child, and adult holders", () => {
    const toddler = resolvePresentationForHolder("teddy", "toddler");
    const child = resolvePresentationForHolder("teddy", "child");
    const adult = resolvePresentationForHolder("teddy", "adult");

    expect(toddler).not.toBeNull();
    expect(child).not.toBeNull();
    expect(adult).not.toBeNull();
    expect(toddler!.holdScale[0]).toBeLessThan(child!.holdScale[0]);
    expect(child!.holdScale[0]).toBeLessThan(adult!.holdScale[0]);
  });

  it("prevents nested containers and protects tray and toy-box use", () => {
    expect(containerCompatibilityIssue("backpack", "basket")).toContain("Containers");
    expect(containerCompatibilityIssue("serving-tray", "cup")).toBeNull();
    expect(containerCompatibilityIssue("serving-tray", "teddy")).toContain("food");
    expect(containerCompatibilityIssue("toy-box", "teddy")).toBeNull();
    expect(containerCompatibilityIssue("toy-box", "cup")).toContain("toys");
  });

  it("returns null for prototype items without a special override", () => {
    expect(presentationFor("unknown-item")).toBeNull();
    expect(resolvePresentationForHolder("unknown-item", "child")).toBeNull();
  });
});
