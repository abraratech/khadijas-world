import {
  MeshBuilder,
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
import {
  applyFamilyHomeSceneComposition,
} from "./applyFamilyHomeSceneComposition";

let engine: NullEngine | null = null;
let scene: Scene | null = null;

function namedBox(
  name: string,
  position: Vector3,
) {
  if (!scene) {
    throw new Error(
      "Test scene is not initialized.",
    );
  }

  const mesh = MeshBuilder.CreateBox(
    name,
    { size: 1 },
    scene,
  );

  mesh.position.copyFrom(position);
  return mesh;
}

afterEach(() => {
  scene?.dispose();
  engine?.dispose();

  scene = null;
  engine = null;
});

describe(
  "SCENE.1A family-home composition",
  () => {
    it(
      "removes redundant High-only ornaments",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const clutter = namedBox(
          "art1g-home-sofa-arm-piping-left",
          Vector3.Zero(),
        );

        const retained = namedBox(
          "art1g-home-window-sill",
          Vector3.Zero(),
        );

        const result =
          applyFamilyHomeSceneComposition(
            scene,
            [clutter, retained],
          );

        expect(clutter.isDisposed()).toBe(true);
        expect(result).toEqual([retained]);
      },
    );

    it(
      "shrinks the foreground furniture clusters",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const coffeeTable = namedBox(
          "coffee-table",
          new Vector3(-1.6, .7, -1.8),
        );

        const television = namedBox(
          "tv",
          new Vector3(-4.55, 1.18, -2.65),
        );

        const island = namedBox(
          "island",
          new Vector3(3.5, .52, .6),
        );

        applyFamilyHomeSceneComposition(
          scene,
          [],
        );

        expect(
          coffeeTable.scaling.x,
        ).toBeCloseTo(.86);

        expect(
          coffeeTable.position.x,
        ).toBeCloseTo(-1.64);

        expect(
          television.scaling.x,
        ).toBeCloseTo(.90);

        expect(
          island.scaling.x,
        ).toBeCloseTo(.90);

        expect(
          island.position.x,
        ).toBeCloseTo(3.72);

        expect(
          island.position.y,
        ).toBeCloseTo(.468);
      },
    );

    it(
      "quiets repeated background decoration",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const panel = namedBox(
          "art1g-home-wall-panel--5.2",
          Vector3.Zero(),
        );

        const retained =
          applyFamilyHomeSceneComposition(
            scene,
            [panel],
          );

        expect(retained).toEqual([panel]);
        expect(panel.visibility).toBe(.72);
      },
    );

    it(
      "is safe to apply more than once",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const island = namedBox(
          "island",
          new Vector3(3.5, .52, .6),
        );

        applyFamilyHomeSceneComposition(
          scene,
          [],
        );

        const firstPosition =
          island.position.clone();

        const firstScaling =
          island.scaling.clone();

        applyFamilyHomeSceneComposition(
          scene,
          [],
        );

        expect(
          island.position.equals(firstPosition),
        ).toBe(true);

        expect(
          island.scaling.equals(firstScaling),
        ).toBe(true);

        expect(scene.metadata).toMatchObject({
          familyHomeSceneComposition:
            "SCENE.1A",
        });
      },
    );
  },
);
