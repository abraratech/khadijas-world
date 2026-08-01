/** Shared browser/Pages-Function contract with no DOM or Babylon imports. */
export interface AiChatContext {
  locationId: string;
  activeCharacterId: string;
  friendship: number;
}

export interface AiChatTurn {
  speaker: "player" | "npc";
  text: string;
}

export type AiChatBudget = "light" | "balanced" | "more";

export interface AiChatBudgetLimits {
  daily: number;
  session: number;
}

export const AI_CHAT_BUDGET_LIMITS: Record<AiChatBudget, AiChatBudgetLimits> = {
  light: { daily: 10, session: 4 },
  balanced: { daily: 20, session: 8 },
  more: { daily: 40, session: 12 },
};

export interface AiChatUsageSnapshot {
  dayKey: string;
  dailyUsed: number;
  dailyLimit: number;
  sessionUsed: number;
  sessionLimit: number;
}

export interface AiChatRequestBody {
  npcId: string;
  message: string;
  context: AiChatContext;
  recentTurns: readonly AiChatTurn[];
  sessionId: string;
  playSessionId: string;
  budget: AiChatBudget;
}

export type AiChatLimitKind = "burst" | "session" | "daily";

export type AiChatFailureReason =
  | "unsafe"
  | "moderation"
  | "rate-limited"
  | "disabled"
  | "error";

export type AiChatResponseBody =
  | {
      ok: true;
      text: string;
      usage: AiChatUsageSnapshot;
    }
  | {
      ok: false;
      reason: AiChatFailureReason;
      retryAfterSeconds?: number;
      limit?: AiChatLimitKind;
      usage?: AiChatUsageSnapshot;
    };

export const AI_CHAT_MAX_MESSAGE_LENGTH = 160;
export const AI_CHAT_MAX_REPLY_LENGTH = 220;
export const AI_CHAT_ENDPOINT = "/api/npc-chat";
