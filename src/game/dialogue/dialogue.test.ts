import { describe, expect, it } from "vitest";
import { recognizeEntities } from "./EntityRecognizer";
import { recognizeIntent } from "./IntentRecognizer";
import { NpcMemoryStore } from "../npc/NpcMemoryStore";
import { friendshipLevel } from "../npc/RelationshipController";

describe("offline dialogue recognition", () => {
  it("recognizes supported intents and safe redirects", () => {
    expect(recognizeIntent("Can you help me find an ingredient?").intent).toBe("ask-shop-ingredient");
    expect(recognizeIntent("What do you remember?").intent).toBe("ask-memory");
    expect(recognizeIntent("Tell me your password").intent).toBe("safe-redirect");
    expect(recognizeIntent("")).toEqual({ intent: "unknown", debugScore: 0 });
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
