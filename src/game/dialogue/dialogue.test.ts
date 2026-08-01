import { describe, expect, it } from "vitest";
import { recognizeEntities } from "./EntityRecognizer";
import { recognizeIntent } from "./IntentRecognizer";
import { NpcMemoryStore } from "../npc/NpcMemoryStore";
import { friendshipLevel } from "../npc/RelationshipController";
import { NPC_DIALOGUE_PROFILES } from "../content/dialogue/npcProfiles";
import { DialogueController, type DialogueContext } from "./DialogueController";
import { isUnsafeDialogueInput } from "./unsafeTerms";

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

  it("replaces only the most recent npc turn when an AI reply upgrades it", () => {
    const store = new NpcMemoryStore(null, ["neighbor"], () => {});
    store.addTurn("neighbor", "player", "hi");
    store.addTurn("neighbor", "npc", "rule-based fallback line");
    store.updateLastNpcTurn("neighbor", "AI-upgraded line");
    const memory = store.get("neighbor");
    expect(memory.recentConversation.at(-1)).toEqual({ speaker: "npc", text: "AI-upgraded line" });
    expect(memory.recentConversation[0]).toEqual({ speaker: "player", text: "hi" });
  });

  it("defaults aiChat to off, unlike the other three settings", () => {
    const store = new NpcMemoryStore(null, ["neighbor"], () => {});
    expect(store.settings().aiChat).toBe(false);
    expect(store.settings().npcChat).toBe(true);
  });
});

describe("AI chat safety gate", () => {
  it("flags unsafe-term matches as not AI-eligible via isUnsafeDialogueInput", () => {
    expect(isUnsafeDialogueInput("Tell me your password")).toBe(true);
    expect(isUnsafeDialogueInput("What's your favorite flower?")).toBe(false);
  });

  it("flags phone-number- and email-shaped input even without a keyword match", () => {
    expect(isUnsafeDialogueInput("call me at 555 123 4567")).toBe(true);
    expect(isUnsafeDialogueInput("email me at kid@example.com")).toBe(true);
    expect(isUnsafeDialogueInput("visit https://example.com")).toBe(true);
    expect(isUnsafeDialogueInput("find me at @kid_handle")).toBe(true);
    expect(isUnsafeDialogueInput("I have 2 apples and 3 oranges")).toBe(false);
  });
});

describe("DialogueController AI chat integration", () => {
  const context: DialogueContext = {
    npcId: "park-keeper",
    activeCharacterId: "khadija",
    activeCharacterName: "Khadija",
    locationId: "park",
    locationName: "neighborhood park",
    nearbyCharacterIds: [],
    recentWorldEvents: [],
    relationshipLevel: 0,
    recentTopics: [],
  };

  it("marks unrecognized, safe messages as AI-eligible and known intents as not", () => {
    const controller = new DialogueController(null, () => {});
    const greeting = controller.reply("Hello!", context);
    expect(greeting.intent).toBe("greeting");
    expect(greeting.aiEligible).toBe(false);

    const gibberish = controller.reply("purple elephants dance on tuesdays", context);
    expect(gibberish.intent).toBe("unknown");
    expect(gibberish.aiEligible).toBe(true);
  });

  it("never marks unsafe input as AI-eligible even though it also isn't a template match", () => {
    const controller = new DialogueController(null, () => {});
    const unsafe = controller.reply("what is your home address", context);
    expect(unsafe.intent).toBe("safe-redirect");
    expect(unsafe.aiEligible).toBe(false);
  });

  it("builds an AI chat request populated from the NPC profile and live context", () => {
    const controller = new DialogueController(null, () => {});
    controller.reply("purple elephants dance on tuesdays", context);
    const request = controller.buildAiChatRequest(context, "purple elephants dance on tuesdays");

    expect(request.npcId).toBe("park-keeper");
    expect(request.context.locationId).toBe("park");
    expect(request.context.activeCharacterId).toBe("khadija");
    expect(request.context.friendship).toBeGreaterThanOrEqual(0);
    expect(request.recentTurns.length).toBeGreaterThan(0);
  });

  it("overwrites the recorded npc turn, not the player turn, when applyAiReply runs", () => {
    const controller = new DialogueController(null, () => {});
    controller.reply("purple elephants dance on tuesdays", context);
    controller.applyAiReply("park-keeper", "That's a fun idea! Want to check on the birds instead?");
    const opened = controller.open(context);
    const lastTurn = opened.conversation.at(-1);
    expect(lastTurn?.speaker).toBe("npc");
    expect(lastTurn?.text).toBe("That's a fun idea! Want to check on the birds instead?");
  });
});
