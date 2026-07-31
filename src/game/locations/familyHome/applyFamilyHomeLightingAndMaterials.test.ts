import {
  Color3,
  MeshBuilder,
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
  applyFamilyHomeLightingAndMaterials,
} from "./applyFamilyHomeLightingAndMaterials";

let engine: NullEngine | null = null;
let scene: Scene | null = null;

function material(
  name: string,
  color: Color3,
): StandardMaterial {
  if (!scene) {
    throw new Error(
      "Test scene is not initialized.",
    );
  }

  const result =
    new StandardMaterial(name, scene);

  result.diffuseColor = color;
  return result;
}

afterEach(() => {
  scene?.dispose();
  engine?.dispose();

  scene = null;
  engine = null;
});

describe(
  "SCENE.1B Family Home lighting and materials",
  () => {
    it(
      "clones shared materials before tuning the Home",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const homeRoot =
          new TransformNode(
            "location-home-root",
            scene,
          );

        const shared = material(
          "teal",
          new Color3(.05, .20, .20),
        );

        const sofa =
          MeshBuilder.CreateBox(
            "sofa-seat",
            { size: 1 },
            scene,
          );

        sofa.parent = homeRoot;
        sofa.material = shared;

        applyFamilyHomeLightingAndMaterials(
          scene,
          [],
        );

        expect(sofa.material).not.toBe(shared);

        const tuned =
          sofa.material as StandardMaterial;

        expect(
          tuned.diffuseColor.g,
        ).toBeGreaterThan(
          shared.diffuseColor.g,
        );

        expect(
          tuned.ambientColor.g,
        ).toBeGreaterThan(0);

        expect(
          shared.ambientColor.g,
        ).toBe(0);
      },
    );

    it(
      "keeps non-Home meshes and materials unchanged",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const otherRoot =
          new TransformNode(
            "location-cafe-root",
            scene,
          );

        const shared = material(
          "teal",
          new Color3(.12, .42, .40),
        );

        const counter =
          MeshBuilder.CreateBox(
            "counter",
            { size: 1 },
            scene,
          );

        counter.parent = otherRoot;
        counter.material = shared;

        applyFamilyHomeLightingAndMaterials(
          scene,
          [],
        );

        expect(counter.material).toBe(shared);
      },
    );

    it(
      "separates sofa, rug, wall, and dark media surfaces",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const homeRoot =
          new TransformNode(
            "location-home-root",
            scene,
          );

        const shared = material(
          "shared-dark",
          new Color3(.06, .08, .09),
        );

        const names = [
          "sofa-seat",
          "rug",
          "back-wall",
          "tv-screen",
        ] as const;

        const meshes = names.map((name) => {
          const mesh =
            MeshBuilder.CreateBox(
              name,
              { size: 1 },
              scene!,
            );

          mesh.parent = homeRoot;
          mesh.material = shared;
          return mesh;
        });

        applyFamilyHomeLightingAndMaterials(
          scene,
          meshes,
        );

        const materials =
          meshes.map(
            (mesh) => mesh.material,
          );

        expect(
          new Set(materials).size,
        ).toBe(4);

        expect(
          meshes[0].metadata,
        ).toMatchObject({
          sceneLightingPass: "SCENE.1B",
          homeSurfaceRole: "sofa",
        });

        expect(
          meshes[1].metadata,
        ).toMatchObject({
          homeSurfaceRole: "rug",
        });

        expect(
          meshes[2].metadata,
        ).toMatchObject({
          homeSurfaceRole: "wall",
        });

        expect(
          meshes[3].metadata,
        ).toMatchObject({
          homeSurfaceRole: "dark",
        });
      },
    );

    it(
      "reduces decorative glow dominance",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const polishRoot =
          new TransformNode(
            "art1g-family-home-high-polish",
            scene,
          );

        const glow =
          MeshBuilder.CreateBox(
            "art1g-home-under-cabinet-glow-3.58",
            { size: 1 },
            scene,
          );

        glow.parent = polishRoot;
        glow.material = material(
          "art1g-home-glow",
          new Color3(1, .8, .4),
        );

        const pool =
          MeshBuilder.CreateBox(
            "art1g-home-light-pool-3.25",
            { size: 1 },
            scene,
          );

        pool.parent = polishRoot;
        pool.material = glow.material;

        applyFamilyHomeLightingAndMaterials(
          scene,
          [glow, pool],
        );

        expect(glow.visibility).toBe(.58);
        expect(pool.visibility).toBe(.34);
      },
    );

    it(
      "is safe to apply more than once",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const homeRoot =
          new TransformNode(
            "location-home-root",
            scene,
          );

        const sofa =
          MeshBuilder.CreateBox(
            "sofa-seat",
            { size: 1 },
            scene,
          );

        sofa.parent = homeRoot;
        sofa.material = material(
          "teal",
          new Color3(.10, .35, .34),
        );

        applyFamilyHomeLightingAndMaterials(
          scene,
          [],
        );

        const firstMaterial = sofa.material;

        applyFamilyHomeLightingAndMaterials(
          scene,
          [],
        );

        expect(sofa.material).toBe(firstMaterial);
        expect(scene.metadata).toMatchObject({
          familyHomeLightingAndMaterials:
            "SCENE.1B",
        });
      },
    );
  },
);
