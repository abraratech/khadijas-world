import { describe, expect, it } from "vitest";
import { NPC_IDS } from "../livingCharacters";
import {
  COMPANION_HERO_PROFILES,
  NPC_HERO_PROFILES,
  type HeroCharacterProfile,
} from "./heroCharacterProfiles";

const NUMERIC_PROFILE_KEYS = [
  "headScale",
  "faceWidth",
  "headHeight",
  "headDepth",
  "eyeSpacing",
  "eyeScale",
  "earScale",
  "noseScale",
  "mouthWidth",
  "cheekScale",
  "neckWidth",
  "bodyWidth",
  "torsoHeight",
  "shoulderWidth",
  "armLength",
  "handScale",
  "legLength",
  "footScale",
] as const satisfies readonly (keyof HeroCharacterProfile)[];

const allProfiles = (): HeroCharacterProfile[] => [
  ...Object.values(COMPANION_HERO_PROFILES).filter(
    (profile): profile is HeroCharacterProfile => Boolean(profile),
  ),
  ...Object.values(NPC_HERO_PROFILES),
];

describe("ART.1K-B hero procedural profiles", () => {
  it("defines distinct profiles for both family companions", () => {
    expect(Object.keys(COMPANION_HERO_PROFILES).sort()).toEqual(["brother", "sister"]);
    expect(COMPANION_HERO_PROFILES.sister?.age).toBe("toddler");
    expect(COMPANION_HERO_PROFILES.brother?.clothingStyle).toBe("hoodie");
  });

  it("covers every stable NPC id", () => {
    expect(Object.keys(NPC_HERO_PROFILES).sort()).toEqual([...NPC_IDS].sort());
  });

  it("keeps every proportion finite and inside safe rig limits", () => {
    for (const profile of allProfiles()) {
      for (const key of NUMERIC_PROFILE_KEYS) {
        const value = profile[key];
        expect(Number.isFinite(value), `${profile.id}.${key}`).toBe(true);
        expect(value, `${profile.id}.${key}`).toBeGreaterThanOrEqual(.75);
        expect(value, `${profile.id}.${key}`).toBeLessThanOrEqual(1.25);
      }
    }
  });

  it("gives every visible cast member a unique full silhouette signature", () => {
    const signatures = allProfiles().map((profile) => [
      profile.age,
      profile.hairStyle,
      profile.clothingStyle,
      profile.accessory,
      profile.headScale.toFixed(2),
      profile.faceWidth.toFixed(2),
      profile.bodyWidth.toFixed(2),
      profile.shoulderWidth.toFixed(2),
      profile.legLength.toFixed(2),
    ].join(":"));

    expect(new Set(signatures).size).toBe(signatures.length);
  });

  it("keeps the toddler proportionally younger than the child and adults", () => {
    const sister = COMPANION_HERO_PROFILES.sister;
    const brother = COMPANION_HERO_PROFILES.brother;
    expect(sister).toBeDefined();
    expect(brother).toBeDefined();
    expect(sister!.headScale).toBeGreaterThan(brother!.headScale);
    expect(sister!.legLength).toBeLessThan(brother!.legLength);
    expect(sister!.shoulderWidth).toBeLessThan(brother!.shoulderWidth);
  });
});
