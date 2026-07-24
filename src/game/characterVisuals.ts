import type { CharacterId } from "./characterState";

export type HairStyle = "long-curls" | "double-buns" | "soft-crop";

export interface CharacterVisualStyle {
  skin: readonly [number, number, number];
  hair: readonly [number, number, number];
  accent: readonly [number, number, number];
  shoe: readonly [number, number, number];
  hairStyle: HairStyle;
  faceWidth: number;
  bodyWidth: number;
  emblem: "flower" | "heart" | "star";
}

export const CHARACTER_VISUALS: Record<CharacterId, CharacterVisualStyle> = {
  khadija: {
    skin: [.62, .37, .23],
    hair: [.055, .032, .045],
    accent: [.98, .46, .68],
    shoe: [.94, .28, .48],
    hairStyle: "long-curls",
    faceWidth: 1,
    bodyWidth: 1,
    emblem: "flower",
  },
  sister: {
    skin: [.65, .40, .25],
    hair: [.07, .04, .045],
    accent: [.98, .72, .24],
    shoe: [.72, .43, .87],
    hairStyle: "double-buns",
    faceWidth: 1.06,
    bodyWidth: .94,
    emblem: "heart",
  },
  brother: {
    skin: [.57, .33, .21],
    hair: [.045, .03, .035],
    accent: [.28, .78, .67],
    shoe: [.20, .55, .78],
    hairStyle: "soft-crop",
    faceWidth: 1.02,
    bodyWidth: 1.06,
    emblem: "star",
  },
};

export const DEFAULT_CHARACTER_VISUAL: CharacterVisualStyle = {
  skin: [.58, .33, .21],
  hair: [.055, .035, .04],
  accent: [.96, .67, .18],
  shoe: [.96, .95, .91],
  hairStyle: "soft-crop",
  faceWidth: 1,
  bodyWidth: 1,
  emblem: "star",
};
