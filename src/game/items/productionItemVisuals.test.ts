import { describe, expect, it } from "vitest";
import { HOLDABLE_PRESENTATIONS, presentationFor } from "./productionItemVisuals";

describe("ART.1B holdable presentation registry", () => {
  it("defines stable presentation data for hero play items", () => {
    expect(Object.keys(HOLDABLE_PRESENTATIONS)).toEqual(expect.arrayContaining([
      "teddy",
      "book",
      "apple",
      "cup",
      "serving-tray",
      "shopping-basket",
    ]));
  });

  it("uses plausible positive scales and footprints", () => {
    for (const presentation of Object.values(HOLDABLE_PRESENTATIONS)) {
      expect(presentation.floorY).toBeGreaterThanOrEqual(0);
      expect(presentation.holdScale.every((value) => value > 0 && value <= 1.5)).toBe(true);
      expect(presentation.footprint[0]).toBeGreaterThan(0);
      expect(presentation.footprint[1]).toBeGreaterThan(0);
    }
  });

  it("returns null for prototype items without a special override", () => {
    expect(presentationFor("unknown-item")).toBeNull();
  });
});
