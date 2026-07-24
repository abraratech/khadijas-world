import type { NpcId } from "../livingCharacters";

export type ConversationSpeaker = "player" | "npc";

export interface ConversationTurn {
  speaker: ConversationSpeaker;
  text: string;
}

export interface MemoryGift {
  itemId: string;
  fromCharacterId: string;
}

export interface MemoryActivity {
  activityId: string;
  withCharacterId: string;
}

export interface MemoryPreference {
  itemId: string;
  kind: "liked-food" | "liked-item";
}

export interface MemoryEvent {
  eventId: string;
  characterId: string;
}

export interface NpcMemory {
  npcId: NpcId;
  friendship: number;
  visits: number;
  giftsReceived: MemoryGift[];
  sharedActivities: MemoryActivity[];
  discoveredPreferences: MemoryPreference[];
  importantEvents: MemoryEvent[];
  recentTopics: string[];
  recentConversation: ConversationTurn[];
  summaryFacts: string[];
}

export interface ConversationSettings {
  npcChat: boolean;
  typedMessages: boolean;
  rememberConversations: boolean;
}

export interface DialogueSaveState {
  settings: ConversationSettings;
  memories: Partial<Record<NpcId, NpcMemory>>;
}

export const CONVERSATION_LIMIT = 10;
const MEMORY_LIST_LIMIT = 8;
const SUMMARY_LIMIT = 12;

export const DEFAULT_CONVERSATION_SETTINGS: ConversationSettings = {
  npcChat: true,
  typedMessages: true,
  rememberConversations: true,
};

export function createNpcMemory(npcId: NpcId): NpcMemory {
  return {
    npcId,
    friendship: 0,
    visits: 0,
    giftsReceived: [],
    sharedActivities: [],
    discoveredPreferences: [],
    importantEvents: [],
    recentTopics: [],
    recentConversation: [],
    summaryFacts: [],
  };
}

export function createDefaultDialogueState(): DialogueSaveState {
  return {
    settings: { ...DEFAULT_CONVERSATION_SETTINGS },
    memories: {},
  };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function safeString(value: unknown, maximum = 80): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maximum);
  return cleaned || null;
}

function safeStrings(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const entry of value) {
    const cleaned = safeString(entry);
    if (!cleaned || result.includes(cleaned)) continue;
    result.push(cleaned);
    if (result.length >= limit) break;
  }
  return result;
}

function safeConversation(value: unknown): ConversationTurn[] {
  if (!Array.isArray(value)) return [];
  const result: ConversationTurn[] = [];
  for (const entry of value.slice(-CONVERSATION_LIMIT)) {
    const candidate = record(entry);
    if (candidate.speaker !== "player" && candidate.speaker !== "npc") continue;
    const text = safeString(candidate.text, 180);
    if (text) result.push({ speaker: candidate.speaker, text });
  }
  return result;
}

function safePairs<T extends object>(
  value: unknown,
  fields: readonly (keyof T)[],
): T[] {
  if (!Array.isArray(value)) return [];
  const result: T[] = [];
  for (const entry of value) {
    const candidate = record(entry);
    const output: Record<string, string> = {};
    let valid = true;
    for (const field of fields) {
      const cleaned = safeString(candidate[field as string], 48);
      if (!cleaned) {
        valid = false;
        break;
      }
      output[field as string] = cleaned;
    }
    if (valid) result.push(output as T);
    if (result.length >= MEMORY_LIST_LIMIT) break;
  }
  return result;
}

export function normalizeNpcMemory(npcId: NpcId, value: unknown): NpcMemory {
  const fallback = createNpcMemory(npcId);
  if (!value || typeof value !== "object") return fallback;
  const candidate = record(value);
  const friendship = typeof candidate.friendship === "number" && Number.isFinite(candidate.friendship)
    ? candidate.friendship
    : 0;
  const visits = typeof candidate.visits === "number" && Number.isFinite(candidate.visits)
    ? candidate.visits
    : 0;
  return {
    npcId,
    friendship: Math.max(0, Math.min(99, Math.floor(friendship))),
    visits: Math.max(0, Math.min(999, Math.floor(visits))),
    giftsReceived: safePairs<MemoryGift>(
      candidate.giftsReceived,
      ["itemId", "fromCharacterId"],
    ),
    sharedActivities: safePairs<MemoryActivity>(
      candidate.sharedActivities,
      ["activityId", "withCharacterId"],
    ),
    discoveredPreferences: safePairs<MemoryPreference>(
      candidate.discoveredPreferences,
      ["itemId", "kind"],
    ).filter((entry) => entry.kind === "liked-food" || entry.kind === "liked-item"),
    importantEvents: safePairs<MemoryEvent>(
      candidate.importantEvents,
      ["eventId", "characterId"],
    ),
    recentTopics: safeStrings(candidate.recentTopics, MEMORY_LIST_LIMIT),
    recentConversation: safeConversation(candidate.recentConversation),
    summaryFacts: safeStrings(candidate.summaryFacts, SUMMARY_LIMIT),
  };
}

export function normalizeDialogueState(
  value: unknown,
  npcIds: readonly NpcId[],
): DialogueSaveState {
  const fallback = createDefaultDialogueState();
  if (!value || typeof value !== "object") return fallback;
  const candidate = record(value);
  const settings = record(candidate.settings);
  const memories = record(candidate.memories);
  fallback.settings = {
    npcChat: settings.npcChat !== false,
    typedMessages: settings.typedMessages !== false,
    rememberConversations: settings.rememberConversations !== false,
  };
  for (const npcId of npcIds) {
    if (memories[npcId] !== undefined) {
      fallback.memories[npcId] = normalizeNpcMemory(npcId, memories[npcId]);
    }
  }
  return fallback;
}
