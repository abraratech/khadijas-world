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

export interface AiChatRequestBody {
  npcId: string;
  message: string;
  context: AiChatContext;
  recentTurns: readonly AiChatTurn[];
  sessionId: string;
}

export type AiChatFailureReason =
  | "unsafe"
  | "moderation"
  | "rate-limited"
  | "disabled"
  | "error";

export type AiChatResponseBody =
  | { ok: true; text: string }
  | { ok: false; reason: AiChatFailureReason };

export const AI_CHAT_MAX_MESSAGE_LENGTH = 160;
export const AI_CHAT_MAX_REPLY_LENGTH = 220;
export const AI_CHAT_ENDPOINT = "/api/npc-chat";
