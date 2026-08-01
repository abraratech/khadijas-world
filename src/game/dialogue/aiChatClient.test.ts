import { describe, expect, it } from "vitest";
import {
  AI_CHAT_MIN_REQUEST_GAP_MS,
  AiChatRequestGate,
} from "./aiChatClient";

describe("CHAT.2A AI spam recovery", () => {
  it("allows only one in-flight request and invalidates a stale reply", () => {
    const gate = new AiChatRequestGate();
    const first = gate.begin(1_000);
    const spam = gate.begin(1_100);

    expect(first.allowed).toBe(true);
    expect(spam.allowed).toBe(false);
    expect(gate.isLatest(first.token)).toBe(false);

    gate.finish(first.token, 1_500);

    expect(
      gate.begin(1_500 + AI_CHAT_MIN_REQUEST_GAP_MS - 1).allowed,
    ).toBe(false);
    expect(
      gate.begin(1_500 + AI_CHAT_MIN_REQUEST_GAP_MS).allowed,
    ).toBe(true);
  });

  it("recovers automatically after the server retry window", () => {
    const gate = new AiChatRequestGate();
    const attempt = gate.begin(5_000);

    expect(attempt.allowed).toBe(true);

    gate.blockFor(attempt.token, 5_100, 12);
    gate.finish(attempt.token, 5_200);

    expect(gate.begin(17_099).allowed).toBe(false);
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
