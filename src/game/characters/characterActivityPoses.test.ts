import {
  Color3,
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
  CHARACTER_DEFINITIONS,
} from "../characterState";
import {
  createCharacterVisual,
} from "./createCharacterVisual";

let engine: NullEngine | null = null;
let scene: Scene | null = null;

afterEach(() => {
  scene?.dispose();
  engine?.dispose();
  scene = null;
  engine = null;
});

function createRig() {
  engine = new NullEngine();
  scene = new Scene(engine);

  return createCharacterVisual(
    scene,
    "activity-pose-test",
    Vector3.Zero(),
    new Color3(.8, .3, .5),
    1,
    true,
    "khadija",
  );
}

describe(
  "ANIM.FAST.3 character activity poses",
  () => {
    it(
      "keeps seated legs visible below sofas, benches, and cafe tables",
      () => {
        const rig = createRig();

        rig.sitAt(
          Vector3.Zero(),
          0,
        );

        const leftLeg =
          scene!.getTransformNodeByName(
            "activity-pose-test-left-leg-pivot",
          );

        const rightLeg =
          scene!.getTransformNodeByName(
            "activity-pose-test-right-leg-pivot",
          );

        expect(leftLeg).not.toBeNull();
        expect(rightLeg).not.toBeNull();
        expect(leftLeg!.rotation.x).toBeCloseTo(-.72);
        expect(rightLeg!.rotation.x).toBeCloseTo(-.72);
        expect(rig.root.position.y).toBeCloseTo(.30);
      },
    );

    it(
      "keeps the body lying sideways while sleeping",
      () => {
        const rig = createRig();

        rig.sleepAt(
          Vector3.Zero(),
          0,
        );

        rig.update(.25);

        expect(
          rig.semantic.root.rotation.z,
        ).toBeCloseTo(
          -Math.PI / 2,
          1,
        );

        expect(rig.isSleeping()).toBe(true);
      },
    );

    it(
      "poses both hands and legs for the moving swing",
      () => {
        const rig = createRig();

        rig.setActivityPose("swing");
        rig.update(.25);

        const leftLeg =
          scene!.getTransformNodeByName(
            "activity-pose-test-left-leg-pivot",
          );

        expect(leftLeg!.rotation.x).toBeCloseTo(-.58);
        expect(rig.semantic.arms[0].rotation.x).toBeCloseTo(.52);
        expect(rig.semantic.arms[1].rotation.z).toBeCloseTo(-.30);
      },
    );

    it(
      "uses a forward riding pose on the scooter",
      () => {
        const rig = createRig();

        rig.setActivityPose("scooter");
        rig.update(.25);

        const rightLeg =
          scene!.getTransformNodeByName(
            "activity-pose-test-right-leg-pivot",
          );

        expect(rightLeg!.rotation.x).toBeCloseTo(.52);
        expect(rig.semantic.arms[0].rotation.x).toBeCloseTo(.78);
      },
    );

    it(
      "lowers the body into the bath while keeping arms visible",
      () => {
        const rig = createRig();

        rig.setActivityPose("bath");
        rig.update(.25);

        expect(rig.semantic.root.position.y).toBeCloseTo(-.16);
        expect(rig.semantic.arms[0].rotation.z).toBeCloseTo(.34);
      },
    );

    it(
      "uses the reduced playable-character scale",
      () => {
        expect(
          CHARACTER_DEFINITIONS.khadija.scale,
        ).toBe(.92);
      },
    );
  },
);
