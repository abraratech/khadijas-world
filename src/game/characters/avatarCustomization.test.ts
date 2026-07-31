import {
  Color3,
  NullEngine,
  Scene,
  Vector3,
} from "@babylonjs/core";
import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";
import { applyKhadijaSculptedHero } from "./applyKhadijaSculptedHero";
import {
  createAvatarCustomizer,
  DEFAULT_AVATAR_CUSTOMIZATION,
  sanitizeAvatarCustomization,
} from "./avatarCustomization";
import { createCharacterVisual } from "./createCharacterVisual";

let engine: NullEngine | null = null;
let scene: Scene | null = null;

afterEach(() => {
  scene?.dispose();
  engine?.dispose();
  scene = null;
  engine = null;
});

describe("AVATAR.1 customization", () => {
  it("sanitizes unsupported saved values", () => {
    expect(sanitizeAvatarCustomization({
      outfitStyle: "cape",
      hairStyle: "curls",
      shoeColor: "navy",
    })).toEqual({
      ...DEFAULT_AVATAR_CUSTOMIZATION,
      hairStyle: "curls",
      shoeColor: "navy",
    });
  });

  it("switches between dress, hair, accessory, shoe, and lipstick options", () => {
    engine = new NullEngine();
    scene = new Scene(engine);

    const rig = createCharacterVisual(
      scene,
      "khadija",
      Vector3.Zero(),
      new Color3(.91, .27, .48),
      .92,
      false,
      "khadija",
    );

    applyKhadijaSculptedHero(scene, rig);

    const customizer = createAvatarCustomizer(scene, rig);
    const applied = customizer.apply({
      outfitStyle: "dress",
      outfitColor: "violet",
      shoeStyle: "boots",
      shoeColor: "navy",
      hairStyle: "double-buns",
      hairColor: "auburn",
      accessory: "flowers",
      lipColor: "coral",
    });

    expect(applied.outfitStyle).toBe("dress");
    expect(scene.getMeshByName("khadija-avatar-dress-skirt")?.isEnabled()).toBe(true);
    expect(scene.getMeshByName("khadija-avatar-boot-left")?.isEnabled()).toBe(true);
    expect(scene.getMeshByName("khadija-avatar-bun-left")?.isEnabled()).toBe(true);
    expect(scene.getTransformNodeByName("khadija-avatar-flowers-root")?.isEnabled()).toBe(true);
    expect(rig.root.metadata?.avatarCustomization).toMatchObject(applied);
  });

  it("keeps customization idempotent", () => {
    engine = new NullEngine();
    scene = new Scene(engine);

    const rig = createCharacterVisual(
      scene,
      "khadija",
      Vector3.Zero(),
      new Color3(.91, .27, .48),
      .92,
      false,
      "khadija",
    );

    applyKhadijaSculptedHero(scene, rig);
    const customizer = createAvatarCustomizer(scene, rig);

    customizer.apply(DEFAULT_AVATAR_CUSTOMIZATION);
    customizer.apply(DEFAULT_AVATAR_CUSTOMIZATION);

    expect(
      scene.meshes.filter((mesh) => mesh.name === "khadija-avatar-dress-skirt"),
    ).toHaveLength(1);
  });
});
