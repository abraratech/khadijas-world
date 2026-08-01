import { describe, expect, it } from "vitest";
import { describePwaConnection, shouldAutoWarmOfflineCache } from "./pwaPolicy";

describe("PWA.1 offline and installation policy", () => {
  it("describes online and offline play without implying cloud access offline", () => {
    expect(describePwaConnection(true)).toEqual({
      label: "Online · cloud features available",
      tone: "online",
    });
    expect(describePwaConnection(false)).toEqual({
      label: "Offline · local play and saves remain available",
      tone: "offline",
    });
  });

  it("does not automatically download the full world on constrained connections", () => {
    expect(shouldAutoWarmOfflineCache({ saveData: true, effectiveType: "4g" })).toBe(false);
    expect(shouldAutoWarmOfflineCache({ effectiveType: "2g" })).toBe(false);
    expect(shouldAutoWarmOfflineCache({ effectiveType: "slow-2g" })).toBe(false);
    expect(shouldAutoWarmOfflineCache({ effectiveType: "3g" })).toBe(false);
    expect(shouldAutoWarmOfflineCache({ effectiveType: "4g" })).toBe(true);
    expect(shouldAutoWarmOfflineCache()).toBe(true);
  });
});
