import type { CharacterId } from "../characterState";
import type { NpcId } from "../livingCharacters";
import {
  CONVERSATION_LIMIT,
  createNpcMemory,
  normalizeDialogueState,
  type ConversationSettings,
  type DialogueSaveState,
  type NpcMemory,
} from "./NpcMemory";
import { addFriendship } from "./RelationshipController";

const RECENT_TOPIC_LIMIT = 8;
const FACT_LIMIT = 12;

export type NpcWorldMemoryEvent =
  | { kind: "gift"; npcId: NpcId; characterId: CharacterId; itemId: string }
  | { kind: "activity"; npcId: NpcId; characterId: CharacterId; activityId: string }
  | { kind: "event"; npcId: NpcId; characterId: CharacterId; eventId: string }
  | { kind: "visit"; npcId: NpcId; characterId: CharacterId };

export class NpcMemoryStore {
  private state: DialogueSaveState;

  constructor(
    initial: unknown,
    private readonly npcIds: readonly NpcId[],
    private readonly persist: (state: DialogueSaveState) => void,
  ) {
    this.state = normalizeDialogueState(initial, npcIds);
  }

  settings(): ConversationSettings {
    return { ...this.state.settings };
  }

  setSettings(settings: ConversationSettings): void {
    this.state.settings = { ...settings };
    // The preference itself must persist even when memory storage is disabled.
    this.save(true);
  }

  get(npcId: NpcId): NpcMemory {
    this.state.memories[npcId] ??= createNpcMemory(npcId);
    return this.state.memories[npcId]!;
  }

  addTurn(npcId: NpcId, speaker: "player" | "npc", text: string): void {
    const memory = this.get(npcId);
    memory.recentConversation.push({ speaker, text: text.slice(0, 180) });
    memory.recentConversation = memory.recentConversation.slice(-CONVERSATION_LIMIT);
    this.save();
  }

  rememberTopic(npcId: NpcId, topic: string): void {
    const memory = this.get(npcId);
    memory.recentTopics = [topic, ...memory.recentTopics.filter((entry) => entry !== topic)]
      .slice(0, RECENT_TOPIC_LIMIT);
    this.addFact(memory, `talked_about:${topic}`);
    this.save();
  }

  record(event: NpcWorldMemoryEvent): void {
    const memory = this.get(event.npcId);
    if (event.kind === "gift") {
      memory.giftsReceived = [
        { itemId: event.itemId, fromCharacterId: event.characterId },
        ...memory.giftsReceived.filter((gift) => gift.itemId !== event.itemId),
      ].slice(0, 8);
      this.addFact(memory, `gift:${event.itemId}`);
      addFriendship(memory, 4);
    } else if (event.kind === "activity") {
      memory.sharedActivities = [
        { activityId: event.activityId, withCharacterId: event.characterId },
        ...memory.sharedActivities.filter((activity) => activity.activityId !== event.activityId),
      ].slice(0, 8);
      this.addFact(memory, `shared:${event.activityId}`);
      addFriendship(memory, 3);
    } else if (event.kind === "event") {
      memory.importantEvents = [
        { eventId: event.eventId, characterId: event.characterId },
        ...memory.importantEvents.filter((entry) => entry.eventId !== event.eventId),
      ].slice(0, 8);
      this.addFact(memory, `helped_with:${event.eventId}`);
      addFriendship(memory, 2);
    } else {
      memory.visits = Math.min(999, memory.visits + 1);
      addFriendship(memory, memory.visits === 1 ? 1 : 0);
    }
    this.save();
  }

  rewardKindWords(npcId: NpcId): void {
    addFriendship(this.get(npcId), 1);
    this.save();
  }

  clear(npcId: NpcId): void {
    delete this.state.memories[npcId];
    this.save(true);
  }

  clearAll(): void {
    this.state.memories = {};
    this.save(true);
  }

  export(): DialogueSaveState {
    return normalizeDialogueState(this.state, this.npcIds);
  }

  private addFact(memory: NpcMemory, fact: string): void {
    memory.summaryFacts = [fact, ...memory.summaryFacts.filter((entry) => entry !== fact)]
      .slice(0, FACT_LIMIT);
  }

  private save(force = false): void {
    if (force || this.state.settings.rememberConversations) {
      this.persist(this.export());
    }
  }
}
