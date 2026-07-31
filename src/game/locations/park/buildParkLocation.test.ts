import {
  NullEngine,
  Scene,
  StandardMaterial,
} from "@babylonjs/core";
import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  buildParkLocation,
} from "./buildParkLocation";

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
    cream: material("cream"),
    white: material("white"),
    wood: material("wood"),
    dark: material("dark"),
    pink: material("pink"),
    yellow: material("yellow"),
    green: material("green"),
    teal: material("teal"),
    mint: material("mint"),
    blue: material("blue"),
    glass: material("glass"),
    grass: material("grass"),
    sidewalk: material("sidewalk"),
    hotspot: material("hotspot"),
  };
}

afterEach(() => {
  scene?.dispose();
  engine?.dispose();

  scene = null;
  engine = null;
});

describe(
  "ANIM.FAST.3 park swing",
  () => {
    it(
      "builds one pivoted seat with two ropes for the ride",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const build =
          buildParkLocation(
            scene,
            0,
            createMaterials() as never,
          );

        expect(
          build.swingRideSeat.parent,
        ).toBe(
          build.swingRideRoot,
        );

        const children =
          build.swingRideRoot
            .getChildMeshes(false)
            .map((mesh) => mesh.name);

        expect(
          children.filter(
            (name) => name.includes("rope"),
          ),
        ).toHaveLength(2);

        expect(
          children.filter(
            (name) => name.includes("seat"),
          ),
        ).toHaveLength(1);

        expect(
          build.swingRideRoot.position.y,
        ).toBeCloseTo(2.46);
      },
    );
  },
);
