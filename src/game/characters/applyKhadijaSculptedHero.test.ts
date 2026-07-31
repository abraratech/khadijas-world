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
import { createCharacterVisual } from "./createCharacterVisual";
import { applyKhadijaSculptedHero } from "./applyKhadijaSculptedHero";

let engine: NullEngine | null = null;
let scene: Scene | null = null;

function createRig(name: string) {
  if (!scene) {
    throw new Error("Test scene is not initialized.");
  }

  return createCharacterVisual(
    scene,
    name,
    Vector3.Zero(),
    new Color3(.91, .28, .47),
    1,
    true,
    "khadija",
  );
}

afterEach(() => {
  scene?.dispose();
  engine?.dispose();
  scene = null;
  engine = null;
});

describe("CHAR.4 Khadija corrected hair shell", () => {
  it("replaces legacy face and hair with one coherent head system", () => {
    engine = new NullEngine();
    scene = new Scene(engine);

    const rig = createRig("test-khadija");
    applyKhadijaSculptedHero(scene, rig);

    const legacyEyes = scene.meshes.filter((mesh) =>
      mesh.name.startsWith("test-khadija-eye-white-")
    );
    const legacyPupils = scene.meshes.filter((mesh) =>
      mesh.name.startsWith("test-khadija-pupil-")
    );
    const legacyHairCap = scene.getMeshByName("test-khadija-hair-cap");
    const legacyCurls = scene.meshes.filter((mesh) =>
      mesh.name.includes("test-khadija-curl-")
    );

    expect(legacyEyes).toHaveLength(2);
    expect(legacyPupils).toHaveLength(2);
    expect(legacyEyes.every((mesh) => !mesh.isEnabled())).toBe(true);
    expect(legacyPupils.every((mesh) => !mesh.isEnabled())).toBe(true);
    expect(legacyHairCap).not.toBeNull();
    expect(legacyHairCap!.isEnabled()).toBe(false);
    expect(legacyCurls.length).toBeGreaterThan(0);
    expect(legacyCurls.every((mesh) => !mesh.isEnabled())).toBe(true);

    expect(
      scene.getMeshByName("test-khadija-unified-hair-shell"),
    ).not.toBeNull();
    expect(
      scene.getMeshByName("test-khadija-unified-headband-tube"),
    ).not.toBeNull();
    expect(
      scene.getMeshByName("test-khadija-unified-curl-0"),
    ).not.toBeNull();
    expect(
      scene.getMeshByName("test-khadija-unified-curl-5"),
    ).not.toBeNull();
    expect(
      scene.getMeshByName("test-khadija-unified-bow-loop-left"),
    ).not.toBeNull();
    expect(
      scene.getMeshByName("test-khadija-unified-bow-center"),
    ).not.toBeNull();
    expect(
      scene.getMeshByName("test-khadija-unified-eye-white-left"),
    ).not.toBeNull();
    expect(
      scene.getMeshByName("test-khadija-unified-eye-iris-left"),
    ).not.toBeNull();
    expect(
      scene.getMeshByName("test-khadija-unified-eye-pupil-left"),
    ).not.toBeNull();
    expect(
      scene.getMeshByName("test-khadija-unified-nose"),
    ).not.toBeNull();
    expect(
      scene.getMeshByName("test-khadija-unified-mouth"),
    ).not.toBeNull();
    expect(
      scene.getMeshByName("test-khadija-unified-teeth"),
    ).not.toBeNull();

    expect(rig.semantic.body.isEnabled()).toBe(false);
    expect(rig.root.metadata).toMatchObject({
      khadijaHeroBuild: "CHAR4-corrected-hair-shell",
      khadijaUnifiedHero: true,
    });
  });

  it("uses one exterior-facing shell without visor meshes", () => {
    engine = new NullEngine();
    scene = new Scene(engine);

    const rig = createRig("test-khadija-no-visor");
    applyKhadijaSculptedHero(scene, rig);

    const shell = scene.getMeshByName(
      "test-khadija-no-visor-unified-hair-shell",
    );

    expect(shell).not.toBeNull();
    expect(shell!.getTotalVertices()).toBeGreaterThan(350);

    expect(
      scene.getMeshByName("test-khadija-no-visor-unified-hair-cap"),
    ).toBeNull();

    expect(
      scene.getMeshByName("test-khadija-no-visor-unified-front-sweep"),
    ).toBeNull();

    expect(
      scene.getMeshByName("test-khadija-no-visor-unified-side-sweep"),
    ).toBeNull();

    const indices = shell!.getIndices();

    expect(indices).not.toBeNull();
    expect(indices!.slice(0, 6)).toEqual([
      0,
      1,
      25,
      1,
      26,
      25,
    ]);
  });

  it("keeps the single shell and curls within the silhouette budget", () => {
    engine = new NullEngine();
    scene = new Scene(engine);

    const rig = createRig("test-khadija-silhouette");
    applyKhadijaSculptedHero(scene, rig);
    void rig;

    const shell = scene.getMeshByName(
      "test-khadija-silhouette-unified-hair-shell",
    );
    const curls = scene.meshes.filter((mesh) =>
      mesh.name.startsWith("test-khadija-silhouette-unified-curl-")
    );
    const bowParts = scene.meshes.filter((mesh) =>
      mesh.name.includes("test-khadija-silhouette-unified-bow-")
    );

    expect(shell).not.toBeNull();
    expect(curls).toHaveLength(6);
    expect(bowParts).toHaveLength(3);

    const hairAreaMeshCount =
      1
      + curls.length
      + 1
      + bowParts.length;

    expect(hairAreaMeshCount).toBeLessThanOrEqual(11);
  });

  it("keeps the shell centered over the skull", () => {
    engine = new NullEngine();
    scene = new Scene(engine);

    const rig = createRig("test-khadija-shell");
    applyKhadijaSculptedHero(scene, rig);
    void rig;

    const shell = scene.getMeshByName(
      "test-khadija-shell-unified-hair-shell",
    );

    expect(shell).not.toBeNull();

    const bounds = shell!.getBoundingInfo().boundingBox;

    expect(bounds.extendSize.x).toBeGreaterThan(.4);
    expect(bounds.extendSize.y).toBeGreaterThan(.38);
    expect(bounds.extendSize.z).toBeGreaterThan(.35);
    expect(bounds.centerWorld.y).toBeGreaterThan(0);
  });

  it("places the complete face stack on the visible skin surface", () => {
    engine = new NullEngine();
    scene = new Scene(engine);

    const rig = createRig("test-khadija-depth");
    applyKhadijaSculptedHero(scene, rig);
    void rig;

    const sclera = scene.getMeshByName(
      "test-khadija-depth-unified-eye-white-left",
    );
    const iris = scene.getMeshByName(
      "test-khadija-depth-unified-eye-iris-left",
    );
    const pupil = scene.getMeshByName(
      "test-khadija-depth-unified-eye-pupil-left",
    );
    const nose = scene.getMeshByName(
      "test-khadija-depth-unified-nose",
    );

    expect(sclera).not.toBeNull();
    expect(iris).not.toBeNull();
    expect(pupil).not.toBeNull();
    expect(nose).not.toBeNull();

    expect(sclera!.position.z).toBeLessThan(-.40);
    expect(iris!.position.z).toBeLessThan(sclera!.position.z);
    expect(pupil!.position.z).toBeLessThan(iris!.position.z);

    // The nose is the most-forward point on the face, ahead of the pupils,
    // instead of sitting behind them where it reads as hidden.
    expect(nose!.position.z).toBeLessThan(pupil!.position.z);
    expect(nose!.scaling.x).toBeGreaterThan(.45);
  });

  it("keeps expressions and sleeping connected to only the unified face", () => {
    engine = new NullEngine();
    scene = new Scene(engine);

    const rig = createRig("test-khadija-expression");
    applyKhadijaSculptedHero(scene, rig);

    const mouth = scene.getMeshByName(
      "test-khadija-expression-unified-mouth",
    );
    const teeth = scene.getMeshByName(
      "test-khadija-expression-unified-teeth",
    );
    const iris = scene.getMeshByName(
      "test-khadija-expression-unified-eye-iris-left",
    );
    const pupil = scene.getMeshByName(
      "test-khadija-expression-unified-eye-pupil-left",
    );
    const sclera = scene.getMeshByName(
      "test-khadija-expression-unified-eye-white-left",
    );

    expect(mouth).not.toBeNull();
    expect(teeth).not.toBeNull();
    expect(iris).not.toBeNull();
    expect(pupil).not.toBeNull();
    expect(sclera).not.toBeNull();

    rig.setExpression("happy");
    rig.update(1 / 60);

    expect(mouth!.scaling.x).toBeGreaterThan(1.5);
    expect(teeth!.isEnabled()).toBe(true);

    rig.sleepAt(Vector3.Zero(), 0);
    rig.update(1 / 60);

    expect(iris!.isEnabled()).toBe(false);
    expect(pupil!.isEnabled()).toBe(false);
    expect(sclera!.scaling.y).toBeLessThan(.1);
  });

  it("keeps the approved rounded body and soles", () => {
    engine = new NullEngine();
    scene = new Scene(engine);

    const rig = createRig("test-khadija-body");
    applyKhadijaSculptedHero(scene, rig);
    void rig;

    const lowerTorso = scene.getMeshByName(
      "test-khadija-body-unified-outfit-lower",
    );
    const sole = scene.getMeshByName(
      "test-khadija-body-unified-sole-left",
    );

    expect(lowerTorso).not.toBeNull();
    expect(sole).not.toBeNull();
    expect(sole!.scaling.y).toBeLessThan(.2);
    expect(sole!.scaling.z).toBeGreaterThan(1.3);
  });

  it("softens highlights and blush, and keeps the brow and neutral mouth expressive", () => {
    engine = new NullEngine();
    scene = new Scene(engine);

    const rig = createRig("test-khadija-appeal");
    applyKhadijaSculptedHero(scene, rig);
    void rig;

    const highlight = scene.getMeshByName(
      "test-khadija-appeal-unified-eye-highlight-left",
    );
    const blush = scene.getMeshByName(
      "test-khadija-appeal-unified-blush-left",
    );
    const brow = scene.getMeshByName(
      "test-khadija-appeal-unified-brow-left",
    );
    const mouth = scene.getMeshByName(
      "test-khadija-appeal-unified-mouth",
    );

    expect(highlight).not.toBeNull();
    expect(blush).not.toBeNull();
    expect(brow).not.toBeNull();
    expect(mouth).not.toBeNull();

    expect(highlight!.visibility).toBeLessThan(.6);
    expect(blush!.visibility).toBeLessThan(.15);
    expect(brow!.getTotalVertices()).toBeGreaterThan(20);
    expect(mouth!.scaling.x).toBeGreaterThan(1.4);
  });

  it("is safe to apply more than once", () => {
    engine = new NullEngine();
    scene = new Scene(engine);

    const rig = createRig("test-khadija-repeat");
    applyKhadijaSculptedHero(scene, rig);

    const firstCount = scene.meshes.length;

    applyKhadijaSculptedHero(scene, rig);

    expect(scene.meshes.length).toBe(firstCount);
  });
});
