import {
  describe,
  expect,
  it,
} from "vitest";
import { NPC_IDS } from "../livingCharacters";
import {
  companionSceneScale,
  npcSceneScale,
} from "./castScaleNormalization";

describe("CHAR.2D cast scale normalization", () => {
  it("reduces Khadija and both siblings consistently", () => {
    expect(companionSceneScale("khadija")).toBe(.94);
    expect(companionSceneScale("sister")).toBe(.94);
    expect(companionSceneScale("brother")).toBe(.94);
  });

  it("reduces every NPC consistently without making them tiny", () => {
    for (const npcId of NPC_IDS) {
      const scale = npcSceneScale(npcId);

      expect(scale, npcId).toBe(.92);
      expect(scale, npcId).toBeGreaterThanOrEqual(.9);
      expect(scale, npcId).toBeLessThan(1);
    }
  });
});
