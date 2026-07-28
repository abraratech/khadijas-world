import { describe, expect, it } from "vitest";
import { measureViewportLayout } from "./viewportLayout";

describe("responsive viewport layout", () => {
  it("reserves a compact desktop left rail and bottom dock", () => {
    expect(measureViewportLayout(1280, 720)).toEqual({
      width: 1280,
      height: 720,
      offsetLeft: 0,
      offsetTop: 0,
      keyboardInset: 0,
      compactLandscape: false,
      detachedHud: true,
      hudSafeArea: {
        top: 6,
        right: 8,
        bottom: 74,
        left: 120,
      },
    });
  });

  it("uses slightly roomier margins on large desktop displays", () => {
    expect(measureViewportLayout(1707, 960)).toMatchObject({
      detachedHud: true,
      hudSafeArea: {
        top: 8,
        right: 10,
        bottom: 82,
        left: 124,
      },
    });
  });

  it("supports scaled desktop displays with reduced CSS height", () => {
    expect(measureViewportLayout(1280, 614)).toMatchObject({
      detachedHud: true,
      hudSafeArea: {
        top: 6,
        right: 6,
        bottom: 72,
        left: 116,
      },
    });
  });

  it("ignores fractional visual viewport rounding", () => {
    expect(measureViewportLayout(1536, 730, {
      width: 1536,
      height: 729.5999755859375,
      offsetLeft: 0,
      offsetTop: 0,
    })).toMatchObject({
      keyboardInset: 0,
      detachedHud: true,
      hudSafeArea: {
        top: 6,
        right: 8,
        bottom: 74,
        left: 120,
      },
    });
  });

  it("keeps the overlay HUD on narrower screens", () => {
    expect(measureViewportLayout(1024, 768)).toMatchObject({
      detachedHud: false,
      hudSafeArea: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    });
  });

  it("tracks a software keyboard reduction", () => {
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
      detachedHud: false,
    });
  });

  it("preserves shifted visual viewport offsets", () => {
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
      detachedHud: false,
    });
  });

  it("recognizes short landscape layouts", () => {
    expect(measureViewportLayout(844, 390)).toMatchObject({
      compactLandscape: true,
      detachedHud: false,
    });

    expect(measureViewportLayout(1280, 720)).toMatchObject({
      compactLandscape: false,
      detachedHud: true,
    });
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
      detachedHud: false,
      hudSafeArea: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    });
  });
});
