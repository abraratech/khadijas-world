import {
  MeshBuilder,
  NullEngine,
  Scene,
} from "@babylonjs/core";
import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  applyStreetGroceryRefresh,
  setStreetGroceryRefreshQuality,
} from "./applyStreetGroceryRefresh";

let engine: NullEngine | null = null;
let scene: Scene | null = null;

afterEach(() => {
  scene?.dispose();
  engine?.dispose();

  scene = null;
  engine = null;
});

describe(
  "SCENE.2A street and grocery refresh",
  () => {
    it(
      "removes the unreadable road symbol and replaces base grocery blocks",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const roadArtifact =
          MeshBuilder.CreateBox(
            "art1j-street-bike-frame",
            {},
            scene,
          );

        const baseShelf =
          MeshBuilder.CreateBox(
            "grocery-shelf-0",
            {},
            scene,
          );

        const polishedShelf =
          MeshBuilder.CreateBox(
            "art1i-grocery-aisle-endcap-0",
            {},
            scene,
          );

        const details =
          applyStreetGroceryRefresh(
            scene,
            110,
          );

        expect(
          roadArtifact.isEnabled(),
        ).toBe(false);

        expect(
          roadArtifact.metadata
            ?.scene2aRemovedStreetArtifact,
        ).toBe(true);

        expect(
          baseShelf.isEnabled(),
        ).toBe(false);

        expect(
          polishedShelf.isEnabled(),
        ).toBe(true);

        expect(
          polishedShelf.metadata
            ?.fastTrackHidden,
        ).toBe(false);

        expect(
          details.some(
            (mesh) =>
              mesh.name
              === "scene2a-grocery-belt-carton-0",
          ),
        ).toBe(true);
      },
    );

    it(
      "restores lightweight grocery geometry on low quality",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const baseCheckout =
          MeshBuilder.CreateBox(
            "grocery-checkout",
            {},
            scene,
          );

        const polishedCheckout =
          MeshBuilder.CreateBox(
            "art1i-grocery-checkout-body",
            {},
            scene,
          );

        const details =
          applyStreetGroceryRefresh(
            scene,
            110,
          );

        setStreetGroceryRefreshQuality(
          scene,
          false,
        );

        expect(
          baseCheckout.isEnabled(),
        ).toBe(true);

        expect(
          polishedCheckout.isEnabled(),
        ).toBe(false);

        expect(
          details.every(
            (mesh) => !mesh.isEnabled(),
          ),
        ).toBe(true);

        setStreetGroceryRefreshQuality(
          scene,
          true,
        );

        expect(
          baseCheckout.isEnabled(),
        ).toBe(false);

        expect(
          polishedCheckout.isEnabled(),
        ).toBe(true);
      },
    );
  },
);
