export interface AdaptiveResolutionConfig {
  sampleWindowMs: number;
  lowFpsThreshold: number;
  highFpsThreshold: number;
  minimumScalingLevel: number;
  maximumScalingLevel: number;
  degradeStep: number;
  recoveryStep: number;
  recoveryWindowsRequired: number;
  adjustmentCooldownMs: number;
  scalingStep: number;
}

export interface AdaptiveResolutionSnapshot {
  elapsedMs: number;
  sampleCount: number;
  cooldownMs: number;
  recoveryWindows: number;
  lastAverageFps: number | null;
}

export const DEFAULT_ADAPTIVE_RESOLUTION_CONFIG: Readonly<AdaptiveResolutionConfig> = {
  sampleWindowMs: 4_000,
  lowFpsThreshold: 28,
  highFpsThreshold: 50,
  minimumScalingLevel: 1.15,
  maximumScalingLevel: 2,
  degradeStep: 0.15,
  recoveryStep: 0.1,
  recoveryWindowsRequired: 2,
  adjustmentCooldownMs: 8_000,
  scalingStep: 0.05,
};

const clamp = (value: number, minimum: number, maximum: number): number => (
  Math.min(maximum, Math.max(minimum, value))
);

const roundToStep = (value: number, step: number): number => (
  Math.round(value / step) * step
);

/**
 * Maintains a bounded FPS sampling window for adaptive render resolution.
 *
 * A larger Babylon hardware scaling level means a lower internal resolution.
 * Performance degradation therefore raises the scaling level, while sustained
 * headroom lowers it.
 */
export class AdaptiveResolutionController {
  private elapsedMs = 0;
  private fpsTotal = 0;
  private sampleCount = 0;
  private cooldownMs = 0;
  private recoveryWindows = 0;
  private lastAverageFps: number | null = null;

  constructor(
    private readonly config: Readonly<AdaptiveResolutionConfig> =
      DEFAULT_ADAPTIVE_RESOLUTION_CONFIG,
  ) {}

  reset(): void {
    this.elapsedMs = 0;
    this.fpsTotal = 0;
    this.sampleCount = 0;
    this.cooldownMs = 0;
    this.recoveryWindows = 0;
    this.lastAverageFps = null;
  }

  sample(
    fps: number,
    deltaMs: number,
    currentScalingLevel: number,
  ): number | null {
    if (
      !Number.isFinite(fps)
      || !Number.isFinite(deltaMs)
      || !Number.isFinite(currentScalingLevel)
      || fps <= 0
      || deltaMs <= 0
    ) {
      return null;
    }

    this.cooldownMs = Math.max(0, this.cooldownMs - deltaMs);
    this.elapsedMs += deltaMs;
    this.fpsTotal += fps;
    this.sampleCount += 1;

    if (this.elapsedMs < this.config.sampleWindowMs) return null;

    const averageFps = this.fpsTotal / this.sampleCount;
    this.lastAverageFps = averageFps;
    this.clearSampleWindow();

    if (averageFps < this.config.lowFpsThreshold) {
      this.recoveryWindows = 0;
      if (this.cooldownMs > 0) return null;

      return this.adjust(
        currentScalingLevel,
        currentScalingLevel + this.config.degradeStep,
      );
    }

    if (averageFps > this.config.highFpsThreshold) {
      if (this.cooldownMs > 0) {
        this.recoveryWindows = 0;
        return null;
      }

      this.recoveryWindows += 1;
      if (this.recoveryWindows < this.config.recoveryWindowsRequired) {
        return null;
      }

      this.recoveryWindows = 0;
      return this.adjust(
        currentScalingLevel,
        currentScalingLevel - this.config.recoveryStep,
      );
    }

    this.recoveryWindows = 0;
    return null;
  }

  snapshot(): AdaptiveResolutionSnapshot {
    return {
      elapsedMs: this.elapsedMs,
      sampleCount: this.sampleCount,
      cooldownMs: this.cooldownMs,
      recoveryWindows: this.recoveryWindows,
      lastAverageFps: this.lastAverageFps,
    };
  }

  private clearSampleWindow(): void {
    this.elapsedMs = 0;
    this.fpsTotal = 0;
    this.sampleCount = 0;
  }

  private adjust(
    currentScalingLevel: number,
    requestedScalingLevel: number,
  ): number | null {
    const nextScalingLevel = clamp(
      roundToStep(requestedScalingLevel, this.config.scalingStep),
      this.config.minimumScalingLevel,
      this.config.maximumScalingLevel,
    );

    if (Math.abs(nextScalingLevel - currentScalingLevel) < 0.025) {
      return null;
    }

    this.cooldownMs = this.config.adjustmentCooldownMs;
    return nextScalingLevel;
  }
}
