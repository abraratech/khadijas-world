import {
  Color3,
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
import type {
  ItemMaterialPalette,
} from "../../items/productionItemVisuals";
import {
  createHomeIngredientVisual,
} from "./createHomeIngredientVisual";

let engine: NullEngine | null = null;
let scene: Scene | null = null;

function createPalette(): ItemMaterialPalette {
  if (!scene) {
    throw new Error(
      "Test scene is not initialized.",
    );
  }

  const make = (
    name: string,
    color: Color3,
  ) => {
    const result =
      new StandardMaterial(name, scene!);

    result.diffuseColor = color;
    return result;
  };

  return {
    wood: make("wood", new Color3(.5, .3, .1)),
    dark: make("dark", new Color3(.1, .1, .1)),
    pink: make("pink", new Color3(.9, .2, .5)),
    yellow: make("yellow", new Color3(.9, .7, .1)),
    teal: make("teal", new Color3(.1, .6, .5)),
    sky: make("sky", new Color3(.3, .7, .9)),
    white: make("white", new Color3(.95, .95, .9)),
    green: make("green", new Color3(.2, .6, .2)),
  };
}

afterEach(() => {
  scene?.dispose();
  engine?.dispose();

  scene = null;
  engine = null;
});

describe(
  "SCENE.1D readable Home ingredients",
  () => {
    it(
      "gives each fridge ingredient a distinct silhouette",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const palette = createPalette();

        const expectedMarkers = {
          bread: "bread-rounded-crown",
          cheese: "cheese-hole-0",
          berries: "berry-0",
          "cake-mix": "cake-mix-label",
          banana: "banana-tip-left",
        } as const;

        for (
          const [
            id,
            marker,
          ] of Object.entries(
            expectedMarkers,
          )
        ) {
          const visual =
            createHomeIngredientVisual(
              scene,
              id,
              Vector3.Zero(),
              palette,
              palette.white,
            );

          expect(visual.name).toBe(
            `draggable-${id}`,
          );

          expect(
            scene.getMeshByName(marker),
            id,
          ).not.toBeNull();

          expect(
            visual.getChildMeshes(false)
              .length,
            id,
          ).toBeGreaterThanOrEqual(1);
        }
      },
    );

    it(
      "keeps decorative pieces out of pointer picking",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const palette = createPalette();

        const berries =
          createHomeIngredientVisual(
            scene,
            "berries",
            Vector3.Zero(),
            palette,
            palette.pink,
          );

        expect(berries.isPickable).toBe(true);

        expect(
          berries.getChildMeshes(false)
            .every(
              (mesh) => !mesh.isPickable,
            ),
        ).toBe(true);
      },
    );

    it(
      "keeps each readable ingredient within budget",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const palette = createPalette();

        for (const id of [
          "bread",
          "cheese",
          "berries",
          "cake-mix",
          "banana",
          "tea-leaves",
          "sponge",
          "towel",
          "rubbish",
          "clothes",
          "toy-block",
        ]) {
          const visual =
            createHomeIngredientVisual(
              scene,
              id,
              Vector3.Zero(),
              palette,
              palette.white,
            );

          expect(
            visual.getChildMeshes(false)
              .length,
            id,
          ).toBeLessThanOrEqual(7);
        }
      },
    );
  },
);
