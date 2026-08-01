import {
  AI_CHAT_BUDGET_LIMITS,
  AI_CHAT_ENDPOINT,
  type AiChatBudget,
  type AiChatRequestBody,
  type AiChatResponseBody,
  type AiChatUsageSnapshot,
} from "./aiChatContract";

const REQUEST_TIMEOUT_MS = 7000;
const DEVICE_SESSION_STORAGE_KEY = "khadijas-world-ai-chat-session";
const PLAY_SESSION_STORAGE_KEY = "khadijas-world-ai-chat-play-session";
const DAILY_USAGE_STORAGE_KEY = "khadijas-world-ai-chat-daily-usage";
const SESSION_USAGE_STORAGE_KEY = "khadijas-world-ai-chat-session-usage";
export const AI_CHAT_MIN_REQUEST_GAP_MS = 1800;
const DEFAULT_RATE_LIMIT_BACKOFF_MS = 60_000;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface StoredDailyUsage {
  dayKey: string;
  used: number;
}

interface StoredSessionUsage {
  playSessionId: string;
  used: number;
}

export type AiChatRequestBlockReason = "busy" | "cooldown";

export interface AiChatRequestAttempt {
  token: number;
  allowed: boolean;
  reason?: AiChatRequestBlockReason;
  retryAfterSeconds?: number;
}

export type AiChatClientFailureReason =
  | "busy"
  | "cooldown"
  | "session-limit"
  | "daily-limit"
  | "unsafe"
  | "moderation"
  | "network"
  | "server-error"
  | "stale";

export type AiChatClientResult =
  | {
      ok: true;
      text: string;
      usage: AiChatUsageSnapshot;
    }
  | {
      ok: false;
      reason: AiChatClientFailureReason;
      retryAfterSeconds?: number;
      usage: AiChatUsageSnapshot;
    };

function safeInteger(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
}

export function aiChatDayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function readJson<T>(storage: StorageLike | null, key: string): T | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
}

function writeJson(storage: StorageLike | null, key: string, value: unknown): void {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private browsing. The in-memory values
    // below still protect the current page session.
  }
}

function randomId(): string {
  return globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export class AiChatUsageTracker {
  private memoryDaily: StoredDailyUsage | null = null;
  private memorySession: StoredSessionUsage | null = null;

  constructor(
    private readonly persistentStorage: StorageLike | null,
    private readonly sessionStorage: StorageLike | null,
  ) {}

  playSessionId(): string {
    const stored = this.readSession();
    if (stored.playSessionId) return stored.playSessionId;
    const created = randomId();
    this.memorySession = { playSessionId: created, used: 0 };
    writeJson(this.sessionStorage, SESSION_USAGE_STORAGE_KEY, this.memorySession);
    try {
      this.sessionStorage?.setItem(PLAY_SESSION_STORAGE_KEY, created);
    } catch {
      // Best-effort only.
    }
    return created;
  }

  snapshot(budget: AiChatBudget, now = Date.now()): AiChatUsageSnapshot {
    const limits = AI_CHAT_BUDGET_LIMITS[budget];
    const dayKey = aiChatDayKey(now);
    const daily = this.readDaily(dayKey);
    const session = this.readSession();
    const playSessionId = session.playSessionId || this.playSessionId();
    const normalizedSession = session.playSessionId === playSessionId
      ? session
      : { playSessionId, used: 0 };

    return {
      dayKey,
      dailyUsed: Math.min(daily.used, limits.daily),
      dailyLimit: limits.daily,
      sessionUsed: Math.min(normalizedSession.used, limits.session),
      sessionLimit: limits.session,
    };
  }

  noteAttempt(budget: AiChatBudget, now = Date.now()): AiChatUsageSnapshot {
    const dayKey = aiChatDayKey(now);
    const daily = this.readDaily(dayKey);
    daily.used += 1;
    this.memoryDaily = daily;
    writeJson(this.persistentStorage, DAILY_USAGE_STORAGE_KEY, daily);

    const session = this.readSession();
    session.playSessionId ||= this.playSessionId();
    session.used += 1;
    this.memorySession = session;
    writeJson(this.sessionStorage, SESSION_USAGE_STORAGE_KEY, session);

    return this.snapshot(budget, now);
  }

  applyServerUsage(usage: AiChatUsageSnapshot): void {
    const daily: StoredDailyUsage = {
      dayKey: usage.dayKey,
      used: safeInteger(usage.dailyUsed),
    };
    const session: StoredSessionUsage = {
      playSessionId: this.playSessionId(),
      used: safeInteger(usage.sessionUsed),
    };
    this.memoryDaily = daily;
    this.memorySession = session;
    writeJson(this.persistentStorage, DAILY_USAGE_STORAGE_KEY, daily);
    writeJson(this.sessionStorage, SESSION_USAGE_STORAGE_KEY, session);
  }

  resetPlaySession(): void {
    const created = randomId();
    this.memorySession = { playSessionId: created, used: 0 };
    writeJson(this.sessionStorage, SESSION_USAGE_STORAGE_KEY, this.memorySession);
    try {
      this.sessionStorage?.setItem(PLAY_SESSION_STORAGE_KEY, created);
    } catch {
      // Best-effort only.
    }
  }

  private readDaily(dayKey: string): StoredDailyUsage {
    const stored = this.memoryDaily
      ?? readJson<StoredDailyUsage>(this.persistentStorage, DAILY_USAGE_STORAGE_KEY);
    if (!stored || stored.dayKey !== dayKey) {
      const fresh = { dayKey, used: 0 };
      this.memoryDaily = fresh;
      writeJson(this.persistentStorage, DAILY_USAGE_STORAGE_KEY, fresh);
      return fresh;
    }
    const normalized = { dayKey, used: safeInteger(stored.used) };
    this.memoryDaily = normalized;
    return normalized;
  }

  private readSession(): StoredSessionUsage {
    const stored = this.memorySession
      ?? readJson<StoredSessionUsage>(this.sessionStorage, SESSION_USAGE_STORAGE_KEY);
    if (stored?.playSessionId) {
      const normalized = {
        playSessionId: stored.playSessionId,
        used: safeInteger(stored.used),
      };
      this.memorySession = normalized;
      return normalized;
    }

    let legacyId = "";
    try {
      legacyId = this.sessionStorage?.getItem(PLAY_SESSION_STORAGE_KEY) ?? "";
    } catch {
      legacyId = "";
    }
    const fresh = { playSessionId: legacyId || randomId(), used: 0 };
    this.memorySession = fresh;
    writeJson(this.sessionStorage, SESSION_USAGE_STORAGE_KEY, fresh);
    return fresh;
  }
}

/**
 * Protects the AI path from rapid repeated submissions.
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

    if (this.activeToken !== null) {
      return { token, allowed: false, reason: "busy" };
    }

    const availableAt = Math.max(this.nextAllowedAt, this.blockedUntil);
    if (now < availableAt) {
      return {
        token,
        allowed: false,
        reason: "cooldown",
        retryAfterSeconds: Math.max(1, Math.ceil((availableAt - now) / 1000)),
      };
    }

    this.activeToken = token;
    return { token, allowed: true };
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

function browserStorage(kind: "localStorage" | "sessionStorage"): StorageLike | null {
  try {
    return window[kind];
  } catch {
    return null;
  }
}

const requestGate = new AiChatRequestGate();
let usageTracker: AiChatUsageTracker | null = null;

function tracker(): AiChatUsageTracker {
  usageTracker ??= new AiChatUsageTracker(
    browserStorage("localStorage"),
    browserStorage("sessionStorage"),
  );
  return usageTracker;
}

function readDeviceSessionId(): string {
  try {
    const existing = window.localStorage.getItem(DEVICE_SESSION_STORAGE_KEY);
    if (existing) return existing;
    const created = randomId();
    window.localStorage.setItem(DEVICE_SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    return randomId();
  }
}

export function getAiChatUsageSnapshot(
  budget: AiChatBudget,
): AiChatUsageSnapshot {
  return tracker().snapshot(budget);
}

export function resetAiChatPlaySession(
  budget: AiChatBudget,
): AiChatUsageSnapshot {
  tracker().resetPlaySession();
  return tracker().snapshot(budget);
}

function localLimitResult(
  budget: AiChatBudget,
): AiChatClientResult | null {
  const usage = tracker().snapshot(budget);
  if (usage.dailyUsed >= usage.dailyLimit) {
    return { ok: false, reason: "daily-limit", usage };
  }
  if (usage.sessionUsed >= usage.sessionLimit) {
    return { ok: false, reason: "session-limit", usage };
  }
  return null;
}

/** Always resolves and never throws. */
export async function requestAiReply(
  body: Omit<AiChatRequestBody, "sessionId" | "playSessionId">,
): Promise<AiChatClientResult> {
  const localLimit = localLimitResult(body.budget);
  if (localLimit) return localLimit;

  const attempt = requestGate.begin(Date.now());
  if (!attempt.allowed) {
    return {
      ok: false,
      reason: attempt.reason ?? "busy",
      retryAfterSeconds: attempt.retryAfterSeconds,
      usage: tracker().snapshot(body.budget),
    };
  }

  const controller = new AbortController();
  const timeoutHandle = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );
  tracker().noteAttempt(body.budget);

  try {
    const requestBody: AiChatRequestBody = {
      ...body,
      sessionId: readDeviceSessionId(),
      playSessionId: tracker().playSessionId(),
    };

    const response = await fetch(AI_CHAT_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    let data: AiChatResponseBody;
    try {
      data = await response.json() as AiChatResponseBody;
    } catch {
      return {
        ok: false,
        reason: "server-error",
        usage: tracker().snapshot(body.budget),
      };
    }

    if (data.usage) tracker().applyServerUsage(data.usage);
    const usage = tracker().snapshot(body.budget);

    if (!data.ok) {
      if (data.reason === "rate-limited") {
        requestGate.blockFor(
          attempt.token,
          Date.now(),
          data.retryAfterSeconds,
        );
        const reason = data.limit === "daily"
          ? "daily-limit"
          : data.limit === "session"
            ? "session-limit"
            : "cooldown";
        return {
          ok: false,
          reason,
          retryAfterSeconds: data.retryAfterSeconds,
          usage,
        };
      }
      if (data.reason === "unsafe") return { ok: false, reason: "unsafe", usage };
      if (data.reason === "moderation") {
        return { ok: false, reason: "moderation", usage };
      }
      return { ok: false, reason: "server-error", usage };
    }

    if (!response.ok) {
      return { ok: false, reason: "server-error", usage };
    }
    if (!requestGate.isLatest(attempt.token)) {
      return { ok: false, reason: "stale", usage };
    }

    return { ok: true, text: data.text, usage };
  } catch {
    return {
      ok: false,
      reason: "network",
      usage: tracker().snapshot(body.budget),
    };
  } finally {
    window.clearTimeout(timeoutHandle);
    requestGate.finish(attempt.token, Date.now());
  }
}
