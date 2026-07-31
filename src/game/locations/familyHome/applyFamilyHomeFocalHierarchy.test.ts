import {
  MeshBuilder,
  NullEngine,
  Scene,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  applyFamilyHomeFocalHierarchy,
} from "./applyFamilyHomeFocalHierarchy";

let engine: NullEngine | null = null;
let scene: Scene | null = null;

function homeMesh(
  root: TransformNode,
  name: string,
  position = Vector3.Zero(),
) {
  if (!scene) {
    throw new Error(
      "Test scene is not initialized.",
    );
  }

  const mesh =
    MeshBuilder.CreateBox(
      name,
      { size: 1 },
      scene,
    );

  mesh.parent = root;
  mesh.position.copyFrom(position);
  mesh.receiveShadows = true;
  return mesh;
}

afterEach(() => {
  scene?.dispose();
  engine?.dispose();

  scene = null;
  engine = null;
});

describe(
  "SCENE.1C Family Home focal hierarchy",
  () => {
    it(
      "removes dynamic shadows from large flat Home receivers",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const root =
          new TransformNode(
            "location-home-root",
            scene,
          );

        const floor =
          homeMesh(root, "floor");

        const wall =
          homeMesh(root, "wall-panel");

        wall.metadata = {
          homeSurfaceRole: "wall",
        };

        const sofa =
          homeMesh(root, "sofa-seat");

        applyFamilyHomeFocalHierarchy(
          scene,
          [],
        );

        expect(floor.receiveShadows).toBe(false);
        expect(wall.receiveShadows).toBe(false);
        expect(sofa.receiveShadows).toBe(true);

        expect(floor.metadata).toMatchObject({
          sceneShadowReceiver:
            "authored-contact-only",
        });
      },
    );

    it(
      "reduces the rug footprint and repeated line contrast",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const root =
          new TransformNode(
            "location-home-root",
            scene,
          );

        const rug =
          homeMesh(
            root,
            "rug",
            new Vector3(-2.6, .02, -.4),
          );

        const stripe =
          homeMesh(
            root,
            "rug-stripe--3.2",
            new Vector3(-3.2, .062, -.4),
          );

        applyFamilyHomeFocalHierarchy(
          scene,
          [],
        );

        expect(rug.scaling.x).toBeCloseTo(.88);
        expect(rug.scaling.z).toBeCloseTo(.88);
        expect(rug.position.x).toBeCloseTo(-2.65);
        expect(rug.position.z).toBeCloseTo(-.32);

        expect(stripe.visibility).toBe(.26);
        expect(
          stripe.position.x,
        ).toBeCloseTo(-3.178);
      },
    );

    it(
      "reduces the interactive cupboard as one intact hierarchy",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const root =
          new TransformNode(
            "location-home-root",
            scene,
          );

        const cupboard =
          new TransformNode(
            "cupboard",
            scene,
          );

        cupboard.parent = root;
        cupboard.position.set(
          4.85,
          1.9,
          3.65,
        );

        const door =
          homeMesh(
            cupboard,
            "cupboard-door",
          );

        applyFamilyHomeFocalHierarchy(
          scene,
          [],
        );

        expect(
          cupboard.scaling.x,
        ).toBeCloseTo(.84);

        expect(
          cupboard.position.x,
        ).toBeCloseTo(5.03);

        expect(
          cupboard.position.z,
        ).toBeCloseTo(3.68);

        expect(door.parent).toBe(cupboard);
      },
    );

    it(
      "is safe to apply more than once",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const root =
          new TransformNode(
            "location-home-root",
            scene,
          );

        const rug =
          homeMesh(
            root,
            "rug",
            new Vector3(-2.6, .02, -.4),
          );

        applyFamilyHomeFocalHierarchy(
          scene,
          [],
        );

        const position =
          rug.position.clone();

        const scaling =
          rug.scaling.clone();

        applyFamilyHomeFocalHierarchy(
          scene,
          [],
        );

        expect(
          rug.position.equals(position),
        ).toBe(true);

        expect(
          rug.scaling.equals(scaling),
        ).toBe(true);

        expect(scene.metadata).toMatchObject({
          familyHomeFocalHierarchy:
            "SCENE.1C",
        });
      },
    );
  },
);
