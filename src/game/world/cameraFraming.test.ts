import { describe, expect, it } from "vitest";
import {
  calculateDollhouseOrthoFrame,
  calculateDollhouseViewportMask,
} from "./cameraFraming";

describe("calculateDollhouseOrthoFrame", () => {
  it("uses the enlarged desktop framing at sixteen by nine", () => {
    const frame = calculateDollhouseOrthoFrame(16 / 9);

    expect(frame.verticalHalfSpan).toBe(4.35);
    expect(frame.horizontalHalfSpan).toBeCloseTo(7.7333, 3);
  });

  it("preserves the enlarged room width in an extra-wide playfield", () => {
    const frame = calculateDollhouseOrthoFrame(2.1);

    expect(frame.verticalHalfSpan).toBeCloseTo(3.6825, 3);
    expect(frame.horizontalHalfSpan).toBeCloseTo(7.7333, 3);
  });

  it("limits zoom on extremely wide playfields", () => {
    const frame = calculateDollhouseOrthoFrame(2.2);

    expect(frame.verticalHalfSpan).toBe(3.55);
    expect(frame.horizontalHalfSpan).toBeCloseTo(7.81, 3);
  });

  it("widens vertically when needed to keep the room visible", () => {
    const frame = calculateDollhouseOrthoFrame(1);

    expect(frame.verticalHalfSpan).toBe(6.15);
    expect(frame.horizontalHalfSpan).toBe(6.15);
  });

  it("uses a safe aspect when the renderer reports an invalid value", () => {
    const frame = calculateDollhouseOrthoFrame(0);

    expect(frame.verticalHalfSpan).toBe(4.35);
    expect(frame.horizontalHalfSpan).toBeCloseTo(7.7333, 3);
  });
});

describe("calculateDollhouseViewportMask", () => {
  it("masks enlarged widescreen overflow while retaining the room frame", () => {
    const mask = calculateDollhouseViewportMask(16 / 9);

    expect(mask.topPercent).toBe(0);
    expect(mask.leftPercent).toBeCloseTo(10.690, 3);
    expect(mask.rightPercent).toBeCloseTo(10.690, 3);
    expect(mask.bottomPercent).toBeCloseTo(17.203, 3);
  });

  it("adapts the matte to a square viewport", () => {
    const mask = calculateDollhouseViewportMask(1);

    expect(mask.leftPercent).toBeCloseTo(0.569, 3);
    expect(mask.rightPercent).toBeCloseTo(0.569, 3);
    expect(mask.topPercent).toBeCloseTo(11.276, 3);
    expect(mask.bottomPercent).toBeCloseTo(26.802, 3);
  });

  it("keeps every inset inside CSS percentage bounds", () => {
    const mask = calculateDollhouseViewportMask(9 / 16);

    for (const value of Object.values(mask)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });
});
