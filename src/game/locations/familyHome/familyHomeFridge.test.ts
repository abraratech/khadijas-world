import {
  type Mesh,
  NullEngine,
  Scene,
  StandardMaterial,
  TransformNode,
} from "@babylonjs/core";
import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  buildFamilyHomeFridge,
  setFamilyHomeFridgeOpen,
} from "./familyHomeFridge";

let engine: NullEngine | null = null;
let scene: Scene | null = null;

function createMaterials() {
  if (!scene) {
    throw new Error(
      "Test scene is not initialized.",
    );
  }

  const create = (name: string) =>
    new StandardMaterial(name, scene!);

  return {
    body: create("body"),
    door: create("door"),
    liner: create("liner"),
    interior: create("interior"),
    metal: create("metal"),
    accent: create("accent"),
    secondary: create("secondary"),
    shadow: create("shadow"),
  };
}

afterEach(() => {
  scene?.dispose();
  engine?.dispose();

  scene = null;
  engine = null;
});

describe(
  "SCENE.1H Family Home fridge",
  () => {
    it(
      "builds an open shell with a separate visible door",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const parent =
          new TransformNode(
            "location-home-root",
            scene,
          );

        const details: Mesh[] = [];
        const fridge =
          buildFamilyHomeFridge(
            scene,
            parent,
            details,
            createMaterials(),
          );

        expect(fridge.root.parent).toBe(parent);
        expect(fridge.door.parent).toBe(
          fridge.doorPivot,
        );

        expect(
          scene.getMeshByName(
            "fridge-back-shell",
          ),
        ).not.toBeNull();

        expect(
          scene.getMeshByName(
            "fridge-interior-back",
          ),
        ).not.toBeNull();

        expect(
          scene.getMeshByName(
            "fridge-door-frame-top",
          ),
        ).not.toBeNull();

        expect(
          scene.getMeshByName(
            "fridge-door-handle",
          ),
        ).not.toBeNull();

        expect(
          scene.getMeshByName(
            "fridge-body",
          ),
        ).toBeNull();

        expect(fridge.door.metadata).toMatchObject({
          everydayTarget: "fridge-shelves",
          room: "home",
        });
      },
    );

    it(
      "swings the right-hinged door outward and toggles the interior",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const fridge =
          buildFamilyHomeFridge(
            scene,
            new TransformNode(
              "location-home-root",
              scene,
            ),
            [],
            createMaterials(),
          );

        setFamilyHomeFridgeOpen(
          scene,
          fridge,
          true,
          false,
        );

        expect(
          fridge.doorPivot.position.x,
        ).toBeGreaterThan(0);

        expect(
          fridge.doorPivot.rotation.y,
        ).toBeCloseTo(-.82);

        expect(
          fridge.doorPivot.position.x,
        ).toBeCloseTo(.94);

        expect(
          fridge.doorPivot.position.z,
        ).toBeCloseTo(-.74);

        expect(
          fridge.interior.isEnabled(),
        ).toBe(true);

        setFamilyHomeFridgeOpen(
          scene,
          fridge,
          false,
          false,
        );

        expect(
          fridge.doorPivot.rotation.y,
        ).toBe(0);

        expect(
          fridge.interior.isEnabled(),
        ).toBe(false);
      },
    );

    it(
      "keeps the appliance within a controlled mesh budget",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const fridge =
          buildFamilyHomeFridge(
            scene,
            new TransformNode(
              "location-home-root",
              scene,
            ),
            [],
            createMaterials(),
          );

        expect(
          fridge.root.getChildMeshes(false)
            .length,
        ).toBeLessThanOrEqual(28);
      },
    );
  },
);
