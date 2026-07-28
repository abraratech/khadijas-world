import { describe, expect, it } from "vitest";
import { AdaptiveResolutionController } from "./adaptiveResolution";

const runWindow = (
  controller: AdaptiveResolutionController,
  fps: number,
  currentScalingLevel: number,
): number | null => {
  let decision: number | null = null;

  for (let second = 0; second < 4; second += 1) {
    decision = controller.sample(fps, 1_000, currentScalingLevel) ?? decision;
  }

  return decision;
};

describe("adaptive resolution controller", () => {
  it("lowers internal resolution after one sustained low-FPS window", () => {
    const controller = new AdaptiveResolutionController();

    expect(runWindow(controller, 24, 1.5)).toBeCloseTo(1.65);
  });

  it("requires two sustained high-FPS windows before restoring resolution", () => {
    const controller = new AdaptiveResolutionController();

    expect(runWindow(controller, 58, 1.5)).toBeNull();
    expect(runWindow(controller, 58, 1.5)).toBeCloseTo(1.4);
  });

  it("clears a recovery streak when performance returns to the neutral band", () => {
    const controller = new AdaptiveResolutionController();

    expect(runWindow(controller, 58, 1.5)).toBeNull();
    expect(runWindow(controller, 40, 1.5)).toBeNull();
    expect(runWindow(controller, 58, 1.5)).toBeNull();
    expect(runWindow(controller, 58, 1.5)).toBeCloseTo(1.4);
  });

  it("uses a cooldown to prevent repeated resolution changes", () => {
    const controller = new AdaptiveResolutionController();

    expect(runWindow(controller, 20, 1.5)).toBeCloseTo(1.65);
    expect(runWindow(controller, 20, 1.65)).toBeNull();
    expect(runWindow(controller, 20, 1.65)).toBeCloseTo(1.8);
  });

  it("clamps scaling decisions to safe limits", () => {
    const lowFpsController = new AdaptiveResolutionController();
    const highFpsController = new AdaptiveResolutionController();

    expect(runWindow(lowFpsController, 20, 1.95)).toBe(2);
    expect(runWindow(highFpsController, 60, 1.15)).toBeNull();
    expect(runWindow(highFpsController, 60, 1.15)).toBeNull();
  });

  it("ignores invalid samples and can clear stale sampling state", () => {
    const controller = new AdaptiveResolutionController();

    expect(controller.sample(Number.NaN, 16, 1.5)).toBeNull();
    expect(controller.sample(60, 0, 1.5)).toBeNull();
    expect(controller.snapshot().sampleCount).toBe(0);

    controller.sample(60, 1_000, 1.5);
    expect(controller.snapshot().sampleCount).toBe(1);

    controller.reset();
    expect(controller.snapshot()).toEqual({
      elapsedMs: 0,
      sampleCount: 0,
      cooldownMs: 0,
      recoveryWindows: 0,
      lastAverageFps: null,
    });
  });
});
