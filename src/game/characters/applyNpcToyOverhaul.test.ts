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
import { applyHeroCharacterPolish } from "./applyHeroCharacterPolish";
import {
  applyNpcToyOverhaul,
  applyToyCharacterOverhaul,
} from "./applyNpcToyOverhaul";
import { createCharacterVisual } from "./createCharacterVisual";
import {
  COMPANION_HERO_PROFILES,
  NPC_HERO_PROFILES,
  type HeroCharacterProfile,
} from "./heroCharacterProfiles";

let engine: NullEngine | null = null;
let scene: Scene | null = null;

const companionProfiles = [
  COMPANION_HERO_PROFILES.sister!,
  COMPANION_HERO_PROFILES.brother!,
] as const;

const allProfiles: readonly HeroCharacterProfile[] = [
  ...companionProfiles,
  ...Object.values(NPC_HERO_PROFILES),
];

function isCompanionProfile(
  profile: HeroCharacterProfile,
): profile is HeroCharacterProfile & {
  id: "sister" | "brother";
} {
  return profile.id === "sister"
    || profile.id === "brother";
}

function rigNameFor(
  profile: HeroCharacterProfile,
): string {
  return isCompanionProfile(profile)
    ? profile.id
    : "npc-" + profile.id;
}

function createProfileRig(
  profile: HeroCharacterProfile,
) {
  if (!scene) {
    throw new Error(
      "Test scene is not initialized.",
    );
  }

  const companionId =
    profile.id === "sister"
      ? "sister"
      : profile.id === "brother"
        ? "brother"
        : undefined;

  const rig = createCharacterVisual(
    scene,
    rigNameFor(profile),
    Vector3.Zero(),
    new Color3(...profile.primary),
    1,
    true,
    companionId,
  );

  applyHeroCharacterPolish(
    scene,
    rig,
    profile,
  );

  applyToyCharacterOverhaul(
    scene,
    rig,
    profile,
  );

  return rig;
}

afterEach(() => {
  scene?.dispose();
  engine?.dispose();

  scene = null;
  engine = null;
});

describe(
  "CHAR.2C natural hairline and face balance",
  () => {
    it(
      "builds the unified face and shell for siblings and every NPC",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        for (const profile of allProfiles) {
          const rig = createProfileRig(profile);
          const rootName = rig.root.name;

          expect(
            scene.getMeshByName(
              rootName + "-toy-eye-white-left",
            ),
            profile.id,
          ).not.toBeNull();

          expect(
            scene.getMeshByName(
              rootName + "-toy-eye-iris-left",
            ),
            profile.id,
          ).not.toBeNull();

          expect(
            scene.getMeshByName(
              rootName + "-toy-brow-left",
            ),
            profile.id,
          ).not.toBeNull();

          expect(
            scene.getMeshByName(
              rootName + "-toy-mouth",
            ),
            profile.id,
          ).not.toBeNull();

          const shell =
            scene.getMeshByName(
              rootName + "-toy-hair-shell",
            );

          expect(shell, profile.id).not.toBeNull();
          expect(
            shell!.getTotalVertices(),
            profile.id,
          ).toBeGreaterThan(350);

          expect(rig.root.metadata).toMatchObject({
            npcToyOverhaul: "CHAR.2C",
            toyCharacterOverhaul: "CHAR.2C",
            toyCharacterProfileId: profile.id,
          });
        }
      },
    );

    it(
      "replaces the old sibling and NPC face and hair layers",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        createProfileRig(
          COMPANION_HERO_PROFILES.sister!,
        );

        createProfileRig(
          NPC_HERO_PROFILES.parent,
        );

        const disabledNames = [
          "sister-eye-white--0.18",
          "sister-mouth",
          "sister-hair-cap",
          "sister-hero-hair-cap",
          "sister-hero-bun--0.36",
          "npc-parent-eye-white--0.18",
          "npc-parent-mouth",
          "npc-parent-hair-cap",
          "npc-parent-hero-hair-cap",
          "npc-parent-hero-low-bun",
        ];

        for (const name of disabledNames) {
          const mesh =
            scene.getMeshByName(name);

          expect(mesh, name).not.toBeNull();
          expect(
            mesh!.isEnabled(),
            name,
          ).toBe(false);
        }
      },
    );

    it(
      "keeps expressions and sleep connected to the unified sibling face",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const rig = createProfileRig(
          COMPANION_HERO_PROFILES.sister!,
        );

        const mouth =
          scene.getMeshByName(
            "sister-toy-mouth",
          );

        const teeth =
          scene.getMeshByName(
            "sister-toy-teeth",
          );

        const iris =
          scene.getMeshByName(
            "sister-toy-eye-iris-left",
          );

        const sclera =
          scene.getMeshByName(
            "sister-toy-eye-white-left",
          );

        expect(mouth).not.toBeNull();
        expect(teeth).not.toBeNull();
        expect(iris).not.toBeNull();
        expect(sclera).not.toBeNull();

        rig.setExpression("happy");
        rig.update(1 / 60);

        expect(
          mouth!.scaling.x,
        ).toBeGreaterThan(1.25);

        expect(
          teeth!.isEnabled(),
        ).toBe(true);

        rig.sleepAt(Vector3.Zero(), 0);
        rig.update(1 / 60);

        expect(
          iris!.isEnabled(),
        ).toBe(false);

        expect(
          sclera!.scaling.y,
        ).toBeLessThan(.1);
      },
    );

    it(
      "uses the shell for a low continuous hairline and keeps locks shallow",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        for (const profile of allProfiles) {
          const rig = createProfileRig(profile);
          const rootName = rig.root.name;

          const shell =
            scene.getMeshByName(
              rootName + "-toy-hair-shell",
            );

          expect(shell, profile.id).not.toBeNull();

          const positions =
            shell!.getVerticesData("position");

          expect(positions, profile.id).not.toBeNull();

          const upperFrontVertices: Array<{
            x: number;
            y: number;
            z: number;
          }> = [];

          for (
            let index = 0;
            index < positions!.length;
            index += 3
          ) {
            const x = positions![index];
            const y = positions![index + 1];
            const z = positions![index + 2];

            if (
              y > .22
              && y < .32
              && z < -.30
            ) {
              upperFrontVertices.push({ x, y, z });
            }
          }

          expect(
            upperFrontVertices.length,
            profile.id,
          ).toBeGreaterThan(0);

          expect(
            Math.min(
              ...upperFrontVertices.map(
                (vertex) => Math.abs(vertex.x),
              ),
            ),
            profile.id,
          ).toBeLessThan(.11);

          const hairlinePieces =
            rig.root
              .getChildMeshes(false)
              .filter(
                (mesh) =>
                  mesh.name.startsWith(
                    rootName + "-toy-hairline-",
                  ),
              );

          expect(
            hairlinePieces.length,
            profile.id,
          ).toBeGreaterThanOrEqual(1);

          expect(
            hairlinePieces.every(
              (mesh) =>
                mesh.scaling.z <= .10
                && mesh.scaling.y <= .36,
            ),
            profile.id,
          ).toBe(true);
        }
      },
    );

    it(
      "keeps the replacement eyes compact and close to the face",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        for (const profile of allProfiles) {
          const rig = createProfileRig(profile);
          const rootName = rig.root.name;

          const eye =
            scene.getMeshByName(
              rootName + "-toy-eye-white-left",
            );

          const brow =
            scene.getMeshByName(
              rootName + "-toy-brow-left",
            );

          expect(eye, profile.id).not.toBeNull();
          expect(brow, profile.id).not.toBeNull();

          expect(
            eye!.scaling.z,
            profile.id,
          ).toBeLessThanOrEqual(.10);

          expect(
            eye!.getBoundingInfo()
              .boundingBox.extendSizeWorld.x,
            profile.id,
          ).toBeLessThan(.12);

          expect(
            brow!.position.y,
            profile.id,
          ).toBeLessThan(.19);
        }
      },
    );

    it(
      "creates distinct hairstyle anchors across siblings and NPCs",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const expectedMarkers = {
          sister:
            "sister-toy-hair-bun-left",
          brother:
            "brother-toy-hairline-fluff-center",
          parent:
            "npc-parent-toy-hair-low-bun",
          neighbor:
            "npc-neighbor-toy-hair-bob-left-lower",
          "cafe-worker":
            "npc-cafe-worker-toy-hair-low-bun",
          "park-keeper":
            "npc-park-keeper-toy-hairline-crop-center",
          "park-parent":
            "npc-park-parent-toy-hair-scarf-tail",
          shopkeeper:
            "npc-shopkeeper-toy-hairline-crop-center",
          "grocery-shopper":
            "npc-grocery-shopper-toy-hair-bob-left-lower",
        } as const;

        for (const profile of allProfiles) {
          createProfileRig(profile);

          const marker =
            expectedMarkers[
              profile.id as keyof typeof expectedMarkers
            ];

          expect(
            scene.getMeshByName(marker),
            profile.id,
          ).not.toBeNull();
        }
      },
    );

    it(
      "keeps the added replacement layer within budget",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        for (const profile of allProfiles) {
          const rig = createProfileRig(profile);

          const addedMeshes =
            rig.root
              .getChildMeshes(false)
              .filter(
                (mesh) =>
                  mesh.metadata?.visualRole
                  === "char2c-toy-character",
              );

          expect(
            addedMeshes.length,
            profile.id,
          ).toBeLessThanOrEqual(27);
        }
      },
    );

    it(
      "keeps the NPC wrapper and generic function idempotent",
      () => {
        engine = new NullEngine();
        scene = new Scene(engine);

        const profile =
          NPC_HERO_PROFILES.shopkeeper;

        const rig = createProfileRig(profile);
        const firstMeshCount =
          scene.meshes.length;

        applyNpcToyOverhaul(
          scene,
          rig,
          profile,
        );

        applyToyCharacterOverhaul(
          scene,
          rig,
          profile,
        );

        expect(
          scene.meshes.length,
        ).toBe(firstMeshCount);
      },
    );
  },
);
