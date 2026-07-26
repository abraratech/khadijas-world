import { describe, expect, it } from "vitest";
import { recognizeEntities } from "./EntityRecognizer";
import { recognizeIntent } from "./IntentRecognizer";
import { NpcMemoryStore } from "../npc/NpcMemoryStore";
import { friendshipLevel } from "../npc/RelationshipController";
import { NPC_DIALOGUE_PROFILES } from "../content/dialogue/npcProfiles";

describe("offline dialogue recognition", () => {
  it("recognizes supported intents and safe redirects", () => {
    expect(recognizeIntent("Can you help me find an ingredient?").intent).toBe("ask-shop-ingredient");
    expect(recognizeIntent("What do you remember?").intent).toBe("ask-memory");
    expect(recognizeIntent("Where can I find some bread?").intent).toBe("ask-shop-ingredient");
    expect(recognizeIntent("You're awesome, can we be best friends?").intent).toBe("ask-friendship");
    expect(recognizeIntent("I have to go now").intent).toBe("goodbye");
    expect(recognizeIntent("Tell me your password").intent).toBe("safe-redirect");
    expect(recognizeIntent("")).toEqual({ intent: "unknown", debugScore: 0 });
  });


  it("keeps personality-specific fallback pools for every NPC", () => {
    for (const profile of Object.values(NPC_DIALOGUE_PROFILES)) {
      expect(profile.fallbackResponses.length).toBeGreaterThanOrEqual(4);
    }
    expect(NPC_DIALOGUE_PROFILES["park-keeper"].fallbackResponses.join(" ")).toContain("flowers");
    expect(NPC_DIALOGUE_PROFILES["cafe-worker"].fallbackResponses.join(" ")).toContain("cupcakes");
  });

  it("recognizes known local entities without duplicates", () => {
    const entities = recognizeEntities("Khadija has bread at the grocery shop with Khadija");
    expect(entities.some((entry) => entry.id === "khadija")).toBe(true);
    expect(entities.some((entry) => entry.id === "bread")).toBe(true);
    expect(entities.some((entry) => entry.id === "grocery")).toBe(true);
    expect(entities.filter((entry) => entry.id === "khadija")).toHaveLength(1);
  });
});

describe("NPC structured memory", () => {
  it("deduplicates facts and bounds conversation history", () => {
    let saved: unknown;
    const store = new NpcMemoryStore(null, ["neighbor"], (state) => { saved = state; });
    store.record({ kind: "gift", npcId: "neighbor", characterId: "khadija", itemId: "book" });
    store.record({ kind: "gift", npcId: "neighbor", characterId: "khadija", itemId: "book" });
    for (let index = 0; index < 20; index += 1) {
      store.addTurn("neighbor", index % 2 ? "npc" : "player", `turn ${index}`);
    }
    const memory = store.get("neighbor");
    expect(memory.giftsReceived).toHaveLength(1);
    expect(memory.summaryFacts.filter((fact) => fact === "gift:book")).toHaveLength(1);
    expect(memory.recentConversation).toHaveLength(10);
    expect(memory.friendship).toBeGreaterThanOrEqual(0);
    expect(friendshipLevel(memory.friendship)).toBe("Friendly");
    expect(saved).toBeTruthy();
  });
});
