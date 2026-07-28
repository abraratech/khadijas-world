import {
  Color3,
  NullEngine,
  Scene,
} from "@babylonjs/core";
import { describe, expect, it } from "vitest";
import { createToyPBRMaterial } from "./createMaterials";

describe("createToyPBRMaterial", () => {
  it("creates a polished opaque toy material by default", () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);

    const material = createToyPBRMaterial(
      scene,
      "test-toy",
      new Color3(.9, .3, .5),
    );

    expect(material.metallic).toBe(0);
    expect(material.roughness).toBeCloseTo(.32);
    expect(material.clearCoat.isEnabled).toBe(true);
    expect(material.clearCoat.intensity).toBeCloseTo(.28);
    expect(material.subSurface.isTranslucencyEnabled).toBe(false);

    scene.dispose();
    engine.dispose();
  });

  it("enables translucency only when explicitly requested", () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const tint = new Color3(1, .78, .68);

    const material = createToyPBRMaterial(
      scene,
      "test-translucent-toy",
      new Color3(.92, .55, .45),
      {
        roughness: .4,
        clearCoatIntensity: .18,
        translucent: true,
        tintColor: tint,
      },
    );

    expect(material.roughness).toBeCloseTo(.4);
    expect(material.clearCoat.intensity).toBeCloseTo(.18);
    expect(material.subSurface.isTranslucencyEnabled).toBe(true);
    expect(material.subSurface.tintColor.equals(tint)).toBe(true);

    scene.dispose();
    engine.dispose();
  });
});
