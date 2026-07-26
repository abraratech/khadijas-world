import { describe, expect, it } from "vitest";
import {
  BROTHER_PRODUCTION_ASSET,
  CAFE_WORKER_PRODUCTION_ASSET,
  findAnimationName,
  isProductionAssetAllowed,
  KHADIJA_PRODUCTION_ASSET,
  MAMA_PRODUCTION_ASSET,
  PRODUCTION_CHARACTER_ASSETS,
  PRODUCTION_NPC_ASSETS,
  resolvePublicAssetUrl,
} from "./characterAssets";

describe("ART.1G production character registry", () => {
  it("keeps Khadija as the only active imported character visual", () => {
    expect(Object.keys(PRODUCTION_CHARACTER_ASSETS)).toEqual(["khadija"]);
    expect(Object.keys(PRODUCTION_NPC_ASSETS)).toEqual([]);
    expect(PRODUCTION_CHARACTER_ASSETS.khadija).toBe(KHADIJA_PRODUCTION_ASSET);
    expect(PRODUCTION_NPC_ASSETS.parent).toBeUndefined();
  });

  it("retains inactive Quaternius definitions for audit and rollback only", () => {
    expect(BROTHER_PRODUCTION_ASSET.source).toContain("Quaternius");
    expect(CAFE_WORKER_PRODUCTION_ASSET.source).toContain("Quaternius");
    expect(PRODUCTION_CHARACTER_ASSETS.brother).toBeUndefined();
    expect(PRODUCTION_NPC_ASSETS["cafe-worker"]).toBeUndefined();
  });

  it("keeps high-detail Meshy characters off Low quality", () => {
    expect(isProductionAssetAllowed(KHADIJA_PRODUCTION_ASSET, false)).toBe(false);
    expect(isProductionAssetAllowed(MAMA_PRODUCTION_ASSET, false)).toBe(false);
  });

  it("retains Mama's inactive GLB definition for audit and rollback", () => {
    expect(MAMA_PRODUCTION_ASSET).toMatchObject({
      id: "parent",
      fallback: "procedural",
      triangleCount: 72_269,
      materialCount: 1,
      scale: 1,
      targetHeight: 2.80,
      idlePoseFraction: 0,
    });
    expect(MAMA_PRODUCTION_ASSET.idlePoseAdjustments).toHaveLength(2);
  });

  it("defines production texture variants for every saved Khadija outfit id", () => {
    expect(KHADIJA_PRODUCTION_ASSET.outfitTextures).toEqual({
      pink: "assets/characters/khadija/outfits/khadija-pink.webp",
      teal: "assets/characters/khadija/outfits/khadija-teal.webp",
      yellow: "assets/characters/khadija/outfits/khadija-yellow.webp",
    });
  });

  it("matches semantic animation names case-insensitively", () => {
    expect(findAnimationName(["Running", "Walking"], ["walking"])).toBe("Walking");
    expect(findAnimationName(["char_Walk_Loop"], ["walk"])).toBe("char_Walk_Loop");
    expect(findAnimationName(["Running"], ["idle"])).toBeNull();
  });

  it("resolves public assets relative to Vite and WAMP subpaths", () => {
    expect(resolvePublicAssetUrl(
      "assets/characters/khadija/khadija-v1.glb",
      "http://localhost/khadijas-world/",
    )).toBe("http://localhost/khadijas-world/assets/characters/khadija/khadija-v1.glb");
  });
});
