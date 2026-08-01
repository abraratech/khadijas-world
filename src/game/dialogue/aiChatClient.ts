import {
  AI_CHAT_ENDPOINT,
  type AiChatRequestBody,
  type AiChatResponseBody,
} from "./aiChatContract";

const REQUEST_TIMEOUT_MS = 6000;
const SESSION_STORAGE_KEY = "khadijas-world-ai-chat-session";

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
 * Always resolves — never throws. On any failure (network, timeout,
 * non-200, moderation rejection, malformed response) it resolves `null`,
 * and the caller keeps showing whatever rule-based reply is already on
 * screen. This function only ever *upgrades* a reply, never blocks one.
 */
export async function requestAiReply(
  body: Omit<AiChatRequestBody, "sessionId">,
): Promise<string | null> {
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

    if (!response.ok) return null;

    const data = (await response.json()) as AiChatResponseBody;
    return data.ok ? data.text : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutHandle);
  }
}
