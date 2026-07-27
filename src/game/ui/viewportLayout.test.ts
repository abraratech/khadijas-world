import { describe, expect, it } from "vitest";
import { measureViewportLayout } from "./viewportLayout";

describe("mobile viewport layout", () => {
  it("uses the layout viewport when the visual viewport API is unavailable", () => {
    expect(measureViewportLayout(1280, 720)).toEqual({
      width: 1280,
      height: 720,
      offsetLeft: 0,
      offsetTop: 0,
      keyboardInset: 0,
      compactLandscape: false,
    });
  });

  it("tracks the visible area when a software keyboard reduces viewport height", () => {
    expect(measureViewportLayout(390, 844, {
      width: 390,
      height: 522,
      offsetLeft: 0,
      offsetTop: 0,
    })).toMatchObject({
      width: 390,
      height: 522,
      keyboardInset: 322,
      compactLandscape: false,
    });
  });

  it("preserves visual viewport offsets used while the visible area is shifted", () => {
    expect(measureViewportLayout(430, 932, {
      width: 410,
      height: 620,
      offsetLeft: 10,
      offsetTop: 42,
    })).toMatchObject({
      width: 410,
      height: 620,
      offsetLeft: 10,
      offsetTop: 42,
      keyboardInset: 270,
    });
  });

  it("recognizes short landscape layouts without classifying normal desktop windows", () => {
    expect(measureViewportLayout(844, 390).compactLandscape).toBe(true);
    expect(measureViewportLayout(1280, 720).compactLandscape).toBe(false);
  });

  it("sanitizes unusable viewport measurements", () => {
    expect(measureViewportLayout(0, Number.NaN, {
      width: -1,
      height: 0,
      offsetLeft: -20,
      offsetTop: Number.NaN,
    })).toEqual({
      width: 1,
      height: 1,
      offsetLeft: 0,
      offsetTop: 0,
      keyboardInset: 0,
      compactLandscape: false,
    });
  });
});
