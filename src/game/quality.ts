import type { Engine } from "@babylonjs/core";

export type QualityPreset = "adaptive" | "low" | "balanced";

export interface QualitySettings {
  hardwareScalingLevel: number;
  enhancedLighting: boolean;
  decorativeDetails: boolean;
  adaptive: boolean;
}

export const QUALITY_SETTINGS: Record<QualityPreset, QualitySettings> = {
  adaptive: {
    hardwareScalingLevel: 1.5,
    enhancedLighting: false,
    decorativeDetails: false,
    adaptive: true,
  },
  low: {
    hardwareScalingLevel: 1.65,
    enhancedLighting: false,
    decorativeDetails: false,
    adaptive: false,
  },
  balanced: {
    hardwareScalingLevel: 1,
    enhancedLighting: true,
    decorativeDetails: true,
    adaptive: false,
  },
};

export function applyQuality(engine: Engine, preset: QualityPreset): QualitySettings {
  const settings = QUALITY_SETTINGS[preset];
  engine.setHardwareScalingLevel(settings.hardwareScalingLevel);
  return settings;
}
