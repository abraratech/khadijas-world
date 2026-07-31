import {
  describe,
  expect,
  it,
} from "vitest";
import { Vector3 } from "@babylonjs/core";
import {
  FAST_TRACK_NPC_STATIONS,
  FAST_TRACK_ROOM_STAGES,
  isWorldPointWalkable,
  resolveWorldWalkablePoint,
  resolveWorldWalkableStep,
} from "./worldWalkability";

describe(
  "fast-track world walkability",
  () => {
    it(
      "pushes a grocery shopper out of the middle shelf",
      () => {
        const blocked =
          new Vector3(107.1, 0, .15);

        expect(
          isWorldPointWalkable(
            "grocery",
            blocked,
          ),
        ).toBe(false);

        const resolved =
          resolveWorldWalkablePoint(
            "grocery",
            blocked,
          );

        expect(
          isWorldPointWalkable(
            "grocery",
            resolved,
          ),
        ).toBe(true);
      },
    );

    it(
      "does not let a movement step cross the cafe counter",
      () => {
        const start =
          new Vector3(66, 0, .2);

        const target =
          new Vector3(69.4, 0, 2.3);

        const resolved =
          resolveWorldWalkableStep(
            "cafe",
            start,
            target,
          );

        expect(
          isWorldPointWalkable(
            "cafe",
            resolved,
          ),
        ).toBe(true);

        expect(
          resolved.equalsWithEpsilon(
            target,
          ),
        ).toBe(false);
      },
    );

    it(
      "keeps every NPC station and room stage walkable",
      () => {
        const npcRooms = {
          parent: "home",
          neighbor: "street",
          "cafe-worker": "cafe",
          "park-keeper": "park",
          "park-parent": "park",
          shopkeeper: "grocery",
          "grocery-shopper": "grocery",
        } as const;

        for (const [npcId, room] of
          Object.entries(npcRooms)) {
          expect(
            isWorldPointWalkable(
              room,
              FAST_TRACK_NPC_STATIONS[
                npcId as keyof typeof npcRooms
              ],
            ),
            npcId,
          ).toBe(true);
        }

        for (const [room, stages] of
          Object.entries(
            FAST_TRACK_ROOM_STAGES,
          )) {
          for (const [index, stage] of
            stages.entries()) {
            expect(
              isWorldPointWalkable(
                room as keyof
                  typeof FAST_TRACK_ROOM_STAGES,
                stage,
              ),
              `${room} stage ${index}`,
            ).toBe(true);
          }
        }
      },
    );

    it(
      "keeps Mama stationed on the open kitchen floor",
      () => {
        const stage =
          FAST_TRACK_NPC_STATIONS.parent;

        expect(stage.x).toBeGreaterThan(1.35);
        expect(stage.x).toBeLessThan(2.10);
        expect(stage.z).toBeGreaterThan(1.35);
        expect(stage.z).toBeLessThan(2.10);

        expect(
          isWorldPointWalkable(
            "home",
            stage,
          ),
        ).toBe(true);
      },
    );

    it(
      "keeps the grocery shopper in the clear center aisle",
      () => {
        const stage =
          FAST_TRACK_NPC_STATIONS[
            "grocery-shopper"
          ];

        expect(
          isWorldPointWalkable(
            "grocery",
            stage,
          ),
        ).toBe(true);
      },
    );
  },
);
