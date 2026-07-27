import {
  DynamicTexture,
  NullEngine,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { describe, expect, it } from "vitest";
import {
  createWorldPlaque,
  DEFAULT_WORLD_PLAQUE_ROTATION_Y,
} from "./createWorldPlaque";

function withNullScene(run: (scene: Scene) => void): void {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    run(scene);
  } finally {
    scene.dispose();
    engine.dispose();
  }
}

describe("world plaque orientation", () => {
  it("faces the fixed dollhouse camera instead of exposing a mirrored back face", () => {
    withNullScene((scene) => {
      const plaque = createWorldPlaque(
        scene,
        "test-plaque",
        "Kitchen",
        Vector3.Zero(),
      );
      const material = plaque.material as StandardMaterial;

      expect(DEFAULT_WORLD_PLAQUE_ROTATION_Y).toBe(Math.PI);
      expect(plaque.rotation.y).toBe(Math.PI);
      expect(material.backFaceCulling).toBe(true);
    });
  });

  it("keeps an explicitly supplied orientation", () => {
    withNullScene((scene) => {
      const plaque = createWorldPlaque(
        scene,
        "custom-plaque",
        "Custom",
        Vector3.Zero(),
        { rotationY: Math.PI / 2 },
      );

      expect(plaque.rotation.y).toBe(Math.PI / 2);
    });
  });

  it("creates the same alpha-backed DynamicTexture in headless tests", () => {
    withNullScene((scene) => {
      const plaque = createWorldPlaque(
        scene,
        "texture-plaque",
        "Texture",
        Vector3.Zero(),
      );
      const material = plaque.material as StandardMaterial;
      const texture = material.diffuseTexture as DynamicTexture;

      expect(texture).toBeInstanceOf(DynamicTexture);
      expect(texture.getSize()).toEqual({ width: 512, height: 144 });
      expect(texture.hasAlpha).toBe(true);
      expect(material.opacityTexture).toBe(texture);
      expect(material.useAlphaFromDiffuseTexture).toBe(true);
    });
  });
});
