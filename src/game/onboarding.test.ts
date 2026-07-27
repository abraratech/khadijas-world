import { describe, expect, it } from "vitest";
import {
  ONBOARDING_STEP_IDS,
  completeOnboardingStep,
  createCompletedOnboardingProgress,
  createDefaultOnboardingProgress,
  dismissOnboarding,
  isOnboardingComplete,
  nextOnboardingStep,
  normalizeOnboardingProgress,
  onboardingStepCopy,
} from "./onboarding";

describe("UX.1 first-play onboarding", () => {
  it("progresses through the stable action-driven step order", () => {
    let progress = createDefaultOnboardingProgress();
    expect(nextOnboardingStep(progress)).toBe("move");

    for (const step of ONBOARDING_STEP_IDS) {
      progress = completeOnboardingStep(progress, step);
    }

    expect(isOnboardingComplete(progress)).toBe(true);
    expect(nextOnboardingStep(progress)).toBeNull();
  });

  it("deduplicates and rejects unfamiliar persisted steps", () => {
    expect(normalizeOnboardingProgress({
      completedSteps: ["move", "move", "unknown", "travel"],
      dismissed: false,
    })).toEqual({ completedSteps: ["move", "travel"], dismissed: false });
  });

  it("grandfathers saves that predate onboarding", () => {
    const progress = normalizeOnboardingProgress(undefined, true);
    expect(progress).toEqual(createCompletedOnboardingProgress());
    expect(isOnboardingComplete(progress)).toBe(true);
  });

  it("supports a persistent skip without mutating prior state", () => {
    const progress = createDefaultOnboardingProgress();
    const dismissed = dismissOnboarding(progress);
    expect(progress.dismissed).toBe(false);
    expect(dismissed.dismissed).toBe(true);
    expect(isOnboardingComplete(dismissed)).toBe(true);
  });

  it("uses input-aware movement wording", () => {
    expect(onboardingStepCopy("move", "touch").message).toContain("Tap");
    expect(onboardingStepCopy("move", "pointer").message).toContain("arrow keys");
  });
});
