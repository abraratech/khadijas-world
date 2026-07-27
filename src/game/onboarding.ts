export const ONBOARDING_STEP_IDS = ["move", "interact", "travel", "help"] as const;

export type OnboardingStepId = typeof ONBOARDING_STEP_IDS[number];
export type OnboardingInputMode = "touch" | "pointer";

export interface OnboardingProgress {
  completedSteps: OnboardingStepId[];
  dismissed: boolean;
}

export interface OnboardingStepCopy {
  icon: string;
  title: string;
  message: string;
}

const isStepId = (value: unknown): value is OnboardingStepId => (
  typeof value === "string"
  && ONBOARDING_STEP_IDS.includes(value as OnboardingStepId)
);

export function createDefaultOnboardingProgress(): OnboardingProgress {
  return { completedSteps: [], dismissed: false };
}

export function createCompletedOnboardingProgress(): OnboardingProgress {
  return { completedSteps: [...ONBOARDING_STEP_IDS], dismissed: false };
}

export function normalizeOnboardingProgress(
  value: unknown,
  completeWhenMissing = false,
): OnboardingProgress {
  if (!value || typeof value !== "object") {
    return completeWhenMissing
      ? createCompletedOnboardingProgress()
      : createDefaultOnboardingProgress();
  }

  const candidate = value as Partial<OnboardingProgress>;
  const completedSteps = Array.isArray(candidate.completedSteps)
    ? candidate.completedSteps.filter(isStepId)
    : [];

  return {
    completedSteps: [...new Set(completedSteps)],
    dismissed: candidate.dismissed === true,
  };
}

export function isOnboardingComplete(progress: OnboardingProgress): boolean {
  return progress.dismissed
    || ONBOARDING_STEP_IDS.every((step) => progress.completedSteps.includes(step));
}

export function nextOnboardingStep(progress: OnboardingProgress): OnboardingStepId | null {
  if (progress.dismissed) return null;
  return ONBOARDING_STEP_IDS.find((step) => !progress.completedSteps.includes(step)) ?? null;
}

export function completeOnboardingStep(
  progress: OnboardingProgress,
  step: OnboardingStepId,
): OnboardingProgress {
  if (progress.completedSteps.includes(step)) return progress;
  return {
    ...progress,
    completedSteps: [...progress.completedSteps, step],
  };
}

export function dismissOnboarding(progress: OnboardingProgress): OnboardingProgress {
  return progress.dismissed ? progress : { ...progress, dismissed: true };
}

export function onboardingStepCopy(
  step: OnboardingStepId,
  inputMode: OnboardingInputMode,
): OnboardingStepCopy {
  if (step === "move") {
    return inputMode === "touch"
      ? { icon: "👆", title: "Walk around", message: "Tap an open place on the floor to move Khadija." }
      : { icon: "👆", title: "Walk around", message: "Click an open place on the floor, or use the arrow keys." };
  }
  if (step === "interact") {
    return {
      icon: "✨",
      title: "Try something",
      message: "Point at or tap an object, then use its action to play.",
    };
  }
  if (step === "travel") {
    return {
      icon: "🗺️",
      title: "Visit a place",
      message: "Choose a place from the location bar to continue your story.",
    };
  }
  return {
    icon: "?",
    title: "Help is always here",
    message: "Open the question-mark button whenever you need the controls again.",
  };
}
