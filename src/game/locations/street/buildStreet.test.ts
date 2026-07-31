import {
  NullEngine,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  buildStreet,
} from "./buildStreet";

let engine: NullEngine | null = null;
let scene: Scene | null = null;

function createMaterials() {
  if (!scene) {
    throw new Error(
      "Test scene is not initialized.",
    );
  }

  const material = (name: string) =>
    new StandardMaterial(name, scene!);

  return {
    road: material("road"),
    grass: material("grass"),
    sidewalk: material("sidewalk"),
    peach: material("peach"),
    pink: material("pink"),
    sky: material("sky"),
    creamWall: material("cream-wall"),
    cafeBlue: material("cafe-blue"),
    white: material("white"),
    glass: material("glass"),
    wood: material("wood"),
    green: material("green"),
    dark: material("dark"),
    teal: material("teal"),
    yellow: material("yellow"),
  };
}

afterEach(() => {
  scene?.dispose();
  engine?.dispose();

  scene = null;
  engine = null;
});

describe(
  "ANIM.FAST.3 neighborhood scooter",
  () => {
    it(
      "keeps both wheels attached to the moving scooter root",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const build =
          buildStreet({
            scene,
            materials: createMaterials() as never,
            detailMeshes: [],
            contentState: {
              streetMailboxOpen: false,
            } as never,
            position: (
              x: number,
              y: number,
              z: number,
            ) => new Vector3(x, y, z),
            onAction: () => undefined,
          });

        expect(
          build.scooterWheels,
        ).toHaveLength(2);

        expect(
          build.scooterWheels.every(
            (wheel) =>
              wheel.parent ===
              build.scooterRoot,
          ),
        ).toBe(true);
      },
    );
  },
);
