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
  applyFastTrackSceneCleanup,
  fastTrackDetailEnabled,
} from "./applyFastTrackSceneCleanup";

let engine: NullEngine | null = null;
let scene: Scene | null = null;

afterEach(() => {
  scene?.dispose();
  engine?.dispose();

  scene = null;
  engine = null;
});

describe(
  "SCENE.FAST.1 cleanup",
  () => {
    it(
      "hides duplicated high-polish furniture but keeps architecture",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const duplicate =
          MeshBuilder.CreateBox(
            "art1i-grocery-checkout-body",
            {},
            scene,
          );

        const architecture =
          MeshBuilder.CreateBox(
            "art1i-grocery-crown-back",
            {},
            scene,
          );

        const hidden =
          applyFastTrackSceneCleanup(
            scene,
          );

        expect(hidden).toContain(duplicate);
        expect(duplicate.isEnabled()).toBe(
          false,
        );
        expect(
          architecture.isEnabled(),
        ).toBe(true);
      },
    );

    it(
      "prevents quality changes from re-enabling hidden duplicates",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const duplicate =
          MeshBuilder.CreateBox(
            "art1j-park-picnic-table-top",
            {},
            scene,
          );

        applyFastTrackSceneCleanup(scene);

        expect(
          fastTrackDetailEnabled(
            duplicate,
            true,
          ),
        ).toBe(false);
      },
    );

    it(
      "scales oversized outdoor tree crowns once",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const crown =
          MeshBuilder.CreateSphere(
            "park-tree-crown-0",
            {},
            scene,
          );

        applyFastTrackSceneCleanup(scene);

        expect(crown.scaling.x).toBeCloseTo(
          .82,
        );
        expect(
          crown.metadata?.fastTrackScaled,
        ).toBe(true);
      },
    );
  },
);
