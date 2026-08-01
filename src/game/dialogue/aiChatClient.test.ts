import { describe, expect, it } from "vitest";
import {
  AI_CHAT_MIN_REQUEST_GAP_MS,
  AiChatRequestGate,
  AiChatUsageTracker,
  aiChatDayKey,
} from "./aiChatClient";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe("CHAT.2 AI request recovery", () => {
  it("allows only one in-flight request and invalidates a stale reply", () => {
    const gate = new AiChatRequestGate();
    const first = gate.begin(1_000);
    const spam = gate.begin(1_100);

    expect(first.allowed).toBe(true);
    expect(spam).toMatchObject({ allowed: false, reason: "busy" });
    expect(gate.isLatest(first.token)).toBe(false);

    gate.finish(first.token, 1_500);

    expect(
      gate.begin(1_500 + AI_CHAT_MIN_REQUEST_GAP_MS - 1).allowed,
    ).toBe(false);
    expect(
      gate.begin(1_500 + AI_CHAT_MIN_REQUEST_GAP_MS).allowed,
    ).toBe(true);
  });

  it("reports a countdown and recovers after the server retry window", () => {
    const gate = new AiChatRequestGate();
    const attempt = gate.begin(5_000);

    expect(attempt.allowed).toBe(true);

    gate.blockFor(attempt.token, 5_100, 12);
    gate.finish(attempt.token, 5_200);

    expect(gate.begin(17_099)).toMatchObject({
      allowed: false,
      reason: "cooldown",
      retryAfterSeconds: 1,
    });
    expect(gate.begin(17_100).allowed).toBe(true);
  });

  it("uses a safe default backoff when the server omits retry timing", () => {
    const gate = new AiChatRequestGate();
    const attempt = gate.begin(10_000);

    gate.blockFor(attempt.token, 10_100);
    gate.finish(attempt.token, 10_200);

    expect(gate.begin(70_099).allowed).toBe(false);
    expect(gate.begin(70_100).allowed).toBe(true);
  });
});

describe("CHAT.2 AI allowance tracking", () => {
  it("uses the grown-up selected daily and play-session limits", () => {
    const tracker = new AiChatUsageTracker(new MemoryStorage(), new MemoryStorage());
    const now = Date.UTC(2026, 7, 1, 12);

    expect(tracker.snapshot("light", now)).toMatchObject({
      dayKey: "2026-08-01",
      dailyLimit: 10,
      sessionLimit: 4,
      dailyUsed: 0,
      sessionUsed: 0,
    });
    expect(tracker.noteAttempt("balanced", now)).toMatchObject({
      dailyLimit: 20,
      sessionLimit: 8,
      dailyUsed: 1,
      sessionUsed: 1,
    });
  });

  it("resets the play session without erasing today's total", () => {
    const tracker = new AiChatUsageTracker(new MemoryStorage(), new MemoryStorage());
    const now = Date.UTC(2026, 7, 1, 12);
    tracker.noteAttempt("balanced", now);
    tracker.resetPlaySession();

    expect(tracker.snapshot("balanced", now)).toMatchObject({
      dailyUsed: 1,
      sessionUsed: 0,
    });
  });

  it("starts a fresh daily count on the next UTC day", () => {
    const tracker = new AiChatUsageTracker(new MemoryStorage(), new MemoryStorage());
    const firstDay = Date.UTC(2026, 7, 1, 23, 59);
    const nextDay = Date.UTC(2026, 7, 2, 0, 1);
    tracker.noteAttempt("more", firstDay);

    expect(aiChatDayKey(firstDay)).toBe("2026-08-01");
    expect(tracker.snapshot("more", nextDay).dailyUsed).toBe(0);
  });

  it("accepts the server usage as the authoritative counter", () => {
    const tracker = new AiChatUsageTracker(new MemoryStorage(), new MemoryStorage());
    const now = Date.UTC(2026, 7, 1, 12);
    tracker.applyServerUsage({
      dayKey: "2026-08-01",
      dailyUsed: 7,
      dailyLimit: 20,
      sessionUsed: 3,
      sessionLimit: 8,
    });

    expect(tracker.snapshot("balanced", now)).toMatchObject({
      dailyUsed: 7,
      sessionUsed: 3,
    });
  });
});
