import {
  AI_CHAT_ENDPOINT,
  type AiChatRequestBody,
  type AiChatResponseBody,
} from "./aiChatContract";

const REQUEST_TIMEOUT_MS = 6000;
const SESSION_STORAGE_KEY = "khadijas-world-ai-chat-session";
export const AI_CHAT_MIN_REQUEST_GAP_MS = 1800;
const DEFAULT_RATE_LIMIT_BACKOFF_MS = 60_000;

export interface AiChatRequestAttempt {
  token: number;
  allowed: boolean;
}

/**
 * CHAT.2A — protects the AI path from rapid repeated submissions.
 *
 * The rule-based reply still appears for every message. This gate only
 * decides whether that message may also make a network request.
 */
export class AiChatRequestGate {
  private activeToken: number | null = null;
  private latestToken = 0;
  private nextAllowedAt = 0;
  private blockedUntil = 0;

  begin(now: number): AiChatRequestAttempt {
    const token = this.latestToken + 1;
    this.latestToken = token;

    const allowed = (
      this.activeToken === null
      && now >= this.nextAllowedAt
      && now >= this.blockedUntil
    );

    if (allowed) this.activeToken = token;
    return { token, allowed };
  }

  finish(token: number, now: number): void {
    if (this.activeToken !== token) return;
    this.activeToken = null;
    this.nextAllowedAt = Math.max(
      this.nextAllowedAt,
      now + AI_CHAT_MIN_REQUEST_GAP_MS,
    );
  }

  blockFor(token: number, now: number, retryAfterSeconds?: number): void {
    if (token !== this.activeToken) return;
    const requestedBackoff = (
      typeof retryAfterSeconds === "number"
      && Number.isFinite(retryAfterSeconds)
      && retryAfterSeconds > 0
    )
      ? retryAfterSeconds * 1000
      : DEFAULT_RATE_LIMIT_BACKOFF_MS;

    this.blockedUntil = Math.max(
      this.blockedUntil,
      now + requestedBackoff,
    );
  }

  isLatest(token: number): boolean {
    return token === this.latestToken;
  }
}

const requestGate = new AiChatRequestGate();

function readSessionId(): string {
  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    // Storage can be unavailable (private browsing, disabled storage).
    // A per-call random id still lets the server apply best-effort limits.
    return crypto.randomUUID();
  }
}

/**
 * Always resolves and never throws.
 *
 * Rapid duplicate submissions are dropped before fetch, so they do not
 * consume Workers AI quota. A newer player message also invalidates an
 * older pending upgrade, preventing an out-of-order AI reply from replacing
 * the wrong NPC bubble.
 */
export async function requestAiReply(
  body: Omit<AiChatRequestBody, "sessionId">,
): Promise<string | null> {
  const attempt = requestGate.begin(Date.now());
  if (!attempt.allowed) return null;

  const controller = new AbortController();
  const timeoutHandle = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const requestBody: AiChatRequestBody = {
      ...body,
      sessionId: readSessionId(),
    };

    const response = await fetch(AI_CHAT_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    let data: AiChatResponseBody;
    try {
      data = (await response.json()) as AiChatResponseBody;
    } catch {
      return null;
    }

    if (!data.ok) {
      if (data.reason === "rate-limited") {
        requestGate.blockFor(
          attempt.token,
          Date.now(),
          data.retryAfterSeconds,
        );
      }
      return null;
    }

    if (!response.ok || !requestGate.isLatest(attempt.token)) {
      return null;
    }

    return data.text;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutHandle);
    requestGate.finish(attempt.token, Date.now());
  }
}
