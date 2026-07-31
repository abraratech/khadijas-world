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
  buildBedroom,
} from "./buildBedroom";

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
    floor: material("floor"),
    floorLight: material("floor-light"),
    lavender: material("lavender"),
    creamWall: material("cream-wall"),
    white: material("white"),
    teal: material("teal"),
    mint: material("mint"),
    wood: material("wood"),
    pink: material("pink"),
    yellow: material("yellow"),
    sky: material("sky"),
  };
}

afterEach(() => {
  scene?.dispose();
  engine?.dispose();

  scene = null;
  engine = null;
});

describe(
  "ANIM.FAST.3 bedroom layout",
  () => {
    it(
      "separates the ensuite and aligns sleepers along the mattress",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const build =
          buildBedroom({
            scene,
            materials: createMaterials() as never,
            detailMeshes: [],
            contentState: {
              bedroomMusicBoxOn: false,
            } as never,
            position: (
              x: number,
              y: number,
              z: number,
            ) => new Vector3(x, y, z),
            initialLampOn: false,
            onLampChanged: () => undefined,
            onAction: () => undefined,
          });

        expect(
          scene.getMeshByName(
            "bedroom-ensuite-wall-back",
          ),
        ).not.toBeNull();

        expect(
          scene.getMeshByName(
            "bedroom-ensuite-door-header",
          ),
        ).not.toBeNull();

        expect(
          build.seats.every(
            (seat) => seat.rotationY === 0,
          ),
        ).toBe(true);

        expect(
          build.seats[0].position.x,
        ).toBeCloseTo(
          build.seats[1].position.x,
        );

        expect(
          build.seats[0].position.z,
        ).not.toBeCloseTo(
          build.seats[1].position.z,
        );
      },
    );
  },
);
