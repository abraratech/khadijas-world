import { describe, expect, it } from "vitest";
import { NPC_IDS } from "../livingCharacters";
import { COMPANION_HERO_PROFILES, NPC_HERO_PROFILES } from "./heroCharacterProfiles";

describe("ART.1E hero procedural profiles", () => {
  it("defines distinct profiles for both family companions", () => {
    expect(Object.keys(COMPANION_HERO_PROFILES).sort()).toEqual(["brother", "sister"]);
    expect(COMPANION_HERO_PROFILES.sister?.age).toBe("toddler");
    expect(COMPANION_HERO_PROFILES.brother?.clothingStyle).toBe("hoodie");
  });

  it("covers every stable NPC id", () => {
    expect(Object.keys(NPC_HERO_PROFILES).sort()).toEqual([...NPC_IDS].sort());
  });

  it("gives the visible cast varied silhouettes rather than recolors", () => {
    const signatures = Object.values(NPC_HERO_PROFILES).map((profile) => (
      `${profile.hairStyle}:${profile.clothingStyle}:${profile.accessory}`
    ));
    expect(new Set(signatures).size).toBeGreaterThanOrEqual(6);
  });
});
