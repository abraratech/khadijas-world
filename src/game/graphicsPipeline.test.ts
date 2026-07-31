import { describe, expect, it } from "vitest";
import { graphicsProfileForQuality } from "./graphicsPipeline";
import { QUALITY_SETTINGS } from "./quality";

describe("quality-aware graphics profiles", () => {
  it("keeps expensive rendering disabled on Low", () => {
    expect(
      graphicsProfileForQuality(QUALITY_SETTINGS.low),
    ).toMatchObject({
      tier: "low",
      cascadedShadows: false,
      ssao: false,
      postProcessing: false,
      msaaSamples: 1,
      bloom: false,
      toyPbrMaterials: false,
    });
  });

  it("keeps Adaptive lightweight", () => {
    expect(
      graphicsProfileForQuality(QUALITY_SETTINGS.adaptive),
    ).toMatchObject({
      tier: "adaptive",
      cascadedShadows: false,
      ssao: false,
      postProcessing: false,
      msaaSamples: 1,
      bloom: false,
      toyPbrMaterials: false,
    });
  });

  it("enables the optimized toy rendering profile for Balanced", () => {
    expect(
      graphicsProfileForQuality(QUALITY_SETTINGS.balanced),
    ).toMatchObject({
      tier: "balanced",
      cascadedShadows: true,
      ssao: true,
      postProcessing: true,
      msaaSamples: 2,
      bloom: true,
      toyPbrMaterials: true,
    });
  });
});
