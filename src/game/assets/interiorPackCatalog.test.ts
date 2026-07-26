import { describe, expect, it } from "vitest";
import {
  BEDROOM_INTERIOR_PACK_CANDIDATES,
  COMMERCIAL_INTERIOR_PACK_CANDIDATES,
  INTERIOR_PACK_CANDIDATES,
} from "./interiorPackCatalog";

describe("interior pack catalog", () => {
  it("records active, review-only, and source-only decisions", () => {
    expect(INTERIOR_PACK_CANDIDATES.some((candidate) => candidate.runtimeStatus === "active")).toBe(true);
    expect(INTERIOR_PACK_CANDIDATES.some((candidate) => candidate.runtimeStatus === "reviewed-not-selected")).toBe(true);
    expect(INTERIOR_PACK_CANDIDATES.some((candidate) => candidate.runtimeStatus === "source-only")).toBe(true);
  });

  it("records the curated bedroom source set", () => {
    expect(BEDROOM_INTERIOR_PACK_CANDIDATES).toHaveLength(8);
    expect(BEDROOM_INTERIOR_PACK_CANDIDATES.map((candidate) => candidate.sourceBlend)).toContain("Bed_Single.blend");
    expect(BEDROOM_INTERIOR_PACK_CANDIDATES.map((candidate) => candidate.sourceBlend)).toContain("Light_Desk.blend");
    expect(BEDROOM_INTERIOR_PACK_CANDIDATES.find(({ sourceBlend }) => sourceBlend === "Light_Desk.blend")?.runtimeStatus).toBe("active");
  });

  it("records the curated cafe and grocery source set", () => {
    expect(COMMERCIAL_INTERIOR_PACK_CANDIDATES).toHaveLength(12);
    expect(COMMERCIAL_INTERIOR_PACK_CANDIDATES.map((candidate) => candidate.sourceBlend)).toContain("Chair_2.blend");
    expect(COMMERCIAL_INTERIOR_PACK_CANDIDATES.map((candidate) => candidate.sourceBlend)).toContain("Shelf_Large.blend");
    expect(COMMERCIAL_INTERIOR_PACK_CANDIDATES.map((candidate) => candidate.sourceBlend)).toContain("Kitchen_Fridge.blend");
    expect(COMMERCIAL_INTERIOR_PACK_CANDIDATES.find(({ sourceBlend }) => sourceBlend === "Shelf_Large.blend")?.runtimeStatus).toBe("reviewed-not-selected");
  });
});
