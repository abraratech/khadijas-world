import { describe, expect, it } from "vitest";
import { createDefaultContentState, normalizeContentState } from "../contentState";
import {
  ADVENTURES,
  activeAdventure,
  adventureProgress,
  recordAdventureAction,
  recordAdventureMemoryEvent,
  recordAdventureRoom,
  rotateActiveAdventure,
} from "./adventureBook";

describe("CONTENT.1 adventure book", () => {
  it("awards each adventure once and records repeatable encore moments", () => {
    const state = createDefaultContentState();
    const action = {
      room: "park" as const,
      message: "Sprinkle, sparkle - the flowers look refreshed!",
      sound: "water",
    };

    const first = recordAdventureAction(state, action);
    const second = recordAdventureAction(state, action);

    expect(first.completions.map((entry) => entry.id)).toEqual(["park-caretaker"]);
    expect(second.completions).toEqual([]);
    expect(state.adventureCompleted).toContain("park-caretaker");
    expect(state.adventureEncoreCounts["park-caretaker"]).toBe(1);
  });

  it("unlocks the world explorer sticker after all six locations", () => {
    const state = createDefaultContentState();
    for (const room of ["home", "bedroom", "street", "cafe", "park"] as const) {
      expect(recordAdventureRoom(state, room).completions).toEqual([]);
    }

    const result = recordAdventureRoom(state, "grocery");
    expect(result.completions.map((entry) => entry.id)).toEqual(["world-explorer"]);
    expect(state.adventureVisitedRooms).toHaveLength(6);
  });

  it("uses typed NPC memory events for friendship progress", () => {
    const state = createDefaultContentState();
    const result = recordAdventureMemoryEvent(state, {
      kind: "activity",
      npcId: "park-parent",
      characterId: "khadija",
      activityId: "picnic",
    });

    expect(result.completions.map((entry) => entry.id)).toEqual([
      "neighborhood-friend",
    ]);
  });

  it("rotates only through incomplete adventures", () => {
    const state = createDefaultContentState();
    const first = activeAdventure(state);
    rotateActiveAdventure(state);
    const second = activeAdventure(state);

    expect(first?.id).not.toBe(second?.id);
    expect(ADVENTURES.map((entry) => entry.id)).toContain(second?.id);
  });

  it("repairs saved progress and derives stars and stickers", () => {
    const state = normalizeContentState({
      adventureCompleted: ["smart-shopper", "smart-shopper", "not-real"],
      adventureVisitedRooms: ["home", "not-real"],
      adventureStars: 999,
      adventureStickers: ["not trusted"],
      adventureEncoreCounts: { "smart-shopper": 4, bad: 9000 },
    });

    const progress = adventureProgress(state);
    expect(progress.completed).toBe(1);
    expect(progress.stars).toBe(3);
    expect(state.adventureStickers).toEqual(["Smart Shopper"]);
    expect(state.adventureVisitedRooms).toEqual(["home"]);
    expect(state.adventureEncoreCounts).toEqual({ "smart-shopper": 4 });
  });
});
