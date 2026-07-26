import { NullEngine, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";
import { describe, expect, it } from "vitest";
import {
  createWorldPlaque,
  DEFAULT_WORLD_PLAQUE_ROTATION_Y,
} from "./createWorldPlaque";

describe("world plaque orientation", () => {
  it("faces the fixed dollhouse camera instead of exposing a mirrored back face", () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const plaque = createWorldPlaque(scene, "test-plaque", "Kitchen", Vector3.Zero());
    const material = plaque.material as StandardMaterial;

    expect(DEFAULT_WORLD_PLAQUE_ROTATION_Y).toBe(Math.PI);
    expect(plaque.rotation.y).toBe(Math.PI);
    expect(material.backFaceCulling).toBe(true);

    scene.dispose();
    engine.dispose();
  });

  it("keeps an explicitly supplied orientation", () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const plaque = createWorldPlaque(
      scene,
      "custom-plaque",
      "Custom",
      Vector3.Zero(),
      { rotationY: Math.PI / 2 },
    );

    expect(plaque.rotation.y).toBe(Math.PI / 2);

    scene.dispose();
    engine.dispose();
  });
});
