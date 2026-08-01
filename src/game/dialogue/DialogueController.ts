import type { CharacterId } from "../characterState";
import { NPC_DIALOGUE_PROFILES } from "../content/dialogue/npcProfiles";
import { topicSuggestions, type DialogueTopic } from "../content/dialogue/topicSuggestions";
import { DIALOGUE_TEMPLATES } from "../content/dialogue/dialogueTemplates";
import type { NpcId } from "../livingCharacters";
import { NpcMemoryStore, type NpcWorldMemoryEvent } from "../npc/NpcMemoryStore";
import { friendshipLevel } from "../npc/RelationshipController";
import type { DialogueSaveState } from "../npc/NpcMemory";
import { recognizeEntities, type RecognizedEntity } from "./EntityRecognizer";
import { recognizeIntent } from "./IntentRecognizer";
import type { DialogueIntent } from "./DialogueIntent";
import type { AiChatRequestBody } from "./aiChatContract";
import { isUnsafeDialogueInput } from "./unsafeTerms";

export interface DialogueContext {
  npcId: NpcId;
  activeCharacterId: CharacterId;
  activeCharacterName: string;
  locationId: string;
  locationName: string;
  nearbyCharacterIds: string[];
  heldItemId?: string;
  recentWorldEvents: string[];
  relationshipLevel: number;
  recentTopics: string[];
}

export interface DialogueReply {
  text: string;
  intent: DialogueIntent;
  entities: RecognizedEntity[];
  templateId: string;
  friendshipLabel: string;
  suggestions: DialogueTopic[];
  /**
   * True only when the message didn't match a known intent and passed the
   * unsafe-term/PII check on its own (independent of `intent`, since the
   * PII shape check isn't part of intent recognition). The caller may use
   * this as the signal to attempt an AI-upgraded reply; `text` above is
   * always already a safe, complete reply either way.
   */
  aiEligible: boolean;
}

export interface DialogueOpenState {
  npcId: NpcId;
  npcName: string;
  portrait: string;
  friendshipLabel: string;
  conversation: ReadonlyArray<{ speaker: "player" | "npc"; text: string }>;
  suggestions: DialogueTopic[];
}

const locationActivities: Record<string, string> = {
  home: "reading or cooking",
  bedroom: "tidying or resting",
  street: "riding the scooter",
  cafe: "sharing a café treat",
  park: "a picnic or playground game",
  grocery: "shopping for a recipe",
};

function safeInput(raw: string): string {
  return raw
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function friendlyItem(id: string | undefined): string {
  return (id ?? "something nearby").replace(/^shop-/, "").replaceAll("-", " ");
}

export class DialogueController {
  readonly memory: NpcMemoryStore;

  constructor(
    initial: unknown,
    persist: (state: DialogueSaveState) => void,
  ) {
    this.memory = new NpcMemoryStore(initial, Object.keys(NPC_DIALOGUE_PROFILES) as NpcId[], persist);
  }

  open(context: DialogueContext): DialogueOpenState {
    const profile = NPC_DIALOGUE_PROFILES[context.npcId];
    const memory = this.memory.get(context.npcId);
    this.memory.record({
      kind: "visit",
      npcId: context.npcId,
      characterId: context.activeCharacterId,
    });
    return {
      npcId: context.npcId,
      npcName: profile.displayName,
      portrait: profile.portrait,
      friendshipLabel: friendshipLevel(memory.friendship),
      conversation: [...memory.recentConversation],
      suggestions: topicSuggestions(context.npcId, context),
    };
  }

  reply(raw: string, context: DialogueContext, forcedIntent?: DialogueIntent): DialogueReply {
    const text = safeInput(raw);
    const profile = NPC_DIALOGUE_PROFILES[context.npcId];
    const match = forcedIntent ? { intent: forcedIntent, debugScore: 1 } : recognizeIntent(text);
    const entities = recognizeEntities(text);
    const intent = profile.allowedIntents.includes(match.intent) ? match.intent : "unknown";
    const memory = this.memory.get(context.npcId);
    // "unknown" intentionally bypasses DIALOGUE_TEMPLATES: every NPC profile already
    // defines its own personality-flavored fallbackResponses (park-keeper mentions
    // flowers/birds, cafe-worker mentions treats, etc). DIALOGUE_TEMPLATES.unknown
    // used to win this lookup unconditionally, so every NPC said the exact same
    // generic line instead of their own. This keeps the per-NPC flavor.
    const templates = intent === "unknown"
      ? profile.fallbackResponses
      : (DIALOGUE_TEMPLATES[intent] ?? profile.fallbackResponses);
    const templateIndex = (
      memory.recentConversation.length + memory.friendship + entities.length
    ) % templates.length;
    const template = templates[templateIndex] ?? profile.fallbackResponses[0];
    const mentionedItem = entities.find((entity) => entity.kind === "item");
    const mentionedPlace = entities.find((entity) => entity.kind === "location");
    const memoryText = this.memoryAnswer(context.npcId, mentionedItem?.id);
    const response = template
      .replaceAll("{playerName}", context.activeCharacterName)
      .replaceAll("{npcName}", profile.displayName)
      .replaceAll("{npcRole}", profile.role)
      .replaceAll("{locationName}", context.locationName)
      .replaceAll("{activityName}", locationActivities[context.locationId] ?? "playing together")
      .replaceAll("{itemName}", mentionedPlace?.label ?? mentionedItem?.label ?? friendlyItem(context.heldItemId))
      .replaceAll("{memoryItem}", memoryText)
      .replaceAll("{friendshipPhrase}", friendshipLevel(memory.friendship).toLowerCase());

    if (text) this.memory.addTurn(context.npcId, "player", text);
    this.memory.addTurn(context.npcId, "npc", response);
    this.memory.rememberTopic(context.npcId, intent);
    if (intent === "compliment" || intent === "greeting") this.memory.rewardKindWords(context.npcId);

    return {
      text: response,
      intent,
      entities,
      templateId: `${intent}-${templateIndex + 1}`,
      friendshipLabel: friendshipLevel(this.memory.get(context.npcId).friendship),
      suggestions: topicSuggestions(context.npcId, {
        ...context,
        relationshipLevel: this.memory.get(context.npcId).friendship,
      }),
      aiEligible: intent === "unknown" && !isUnsafeDialogueInput(text),
    };
  }

  /**
   * Assembles the payload for `/api/npc-chat`. Only call this when the
   * preceding `reply()` result had `aiEligible: true` — this method does
   * not re-run the safety check itself, it trusts the caller already did.
   */
  buildAiChatRequest(
    context: DialogueContext,
    message: string,
  ): Omit<AiChatRequestBody, "sessionId"> {
    const memory = this.memory.get(context.npcId);
    return {
      npcId: context.npcId,
      message: safeInput(message),
      context: {
        locationId: context.locationId,
        activeCharacterId: context.activeCharacterId,
        friendship: memory.friendship,
      },
      recentTurns: memory.recentConversation.slice(-4),
    };
  }

  /**
   * Call after a successful AI reply so the conversation memory reflects
   * what's actually shown on screen (the rule-based fallback that `reply()`
   * already recorded gets overwritten, not duplicated).
   */
  applyAiReply(npcId: NpcId, text: string): void {
    this.memory.updateLastNpcTurn(npcId, text);
  }

  recordWorldEvent(event: NpcWorldMemoryEvent): void {
    this.memory.record(event);
  }

  clearNpc(npcId: NpcId): void {
    this.memory.clear(npcId);
  }

  clearAll(): void {
    this.memory.clearAll();
  }

  private memoryAnswer(npcId: NpcId, mentionedItemId?: string): string {
    const memory = this.memory.get(npcId);
    if (mentionedItemId) {
      const gift = memory.giftsReceived.find((entry) => (
        entry.itemId === mentionedItemId || entry.itemId.endsWith(`-${mentionedItemId}`)
      ));
      return gift
        ? `Yes! I remember the ${friendlyItem(gift.itemId)} you gave me. That was very kind!`
        : `I don't remember getting a ${friendlyItem(mentionedItemId)} yet. Maybe we can choose one together!`;
    }
    const gift = memory.giftsReceived[0];
    if (gift) return `I remember your kind ${friendlyItem(gift.itemId)} gift!`;
    const activity = memory.sharedActivities[0];
    if (activity) return `I remember when we enjoyed ${friendlyItem(activity.activityId)} together!`;
    const event = memory.importantEvents[0];
    if (event) return `I remember you helped with ${friendlyItem(event.eventId)}. Thank you!`;
    return "I don't have a special memory yet. We can make one by helping or playing together!";
  }
}