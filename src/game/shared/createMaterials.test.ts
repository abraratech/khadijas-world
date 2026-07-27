import { Color3, NullEngine, Scene } from "@babylonjs/core";
import { describe, expect, it } from "vitest";
import { createMaterial } from "./createMaterials";

describe("material finishes", () => {
  it("uses a soft toy sheen for generic colorful materials", () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const material = createMaterial(scene, "test-pink", new Color3(.9, .3, .5));

    expect(material.specularColor.r).toBeCloseTo(.18);
    expect(material.specularPower).toBe(30);

    scene.dispose();
    engine.dispose();
  });

  it("keeps contact-shadow materials unlit and double-sided", () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const material = createMaterial(scene, "test-contact-shadow", new Color3(.9, .3, .5));

    expect(material.specularColor.r).toBe(0);
    expect(material.disableLighting).toBe(true);
    expect(material.backFaceCulling).toBe(false);

    scene.dispose();
    engine.dispose();
  });
});
