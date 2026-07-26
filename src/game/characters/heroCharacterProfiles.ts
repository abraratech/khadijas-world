import type { CharacterId } from "../characterState";
import type { NpcId } from "../livingCharacters";

export type HeroHairStyle =
  | "double-buns"
  | "fluffy-crop"
  | "layered-bob"
  | "low-bun"
  | "garden-crop"
  | "wrapped-scarf"
  | "silver-bob"
  | "neat-crop";

export type HeroClothingStyle =
  | "hoodie"
  | "dress"
  | "tunic"
  | "apron"
  | "work-shirt"
  | "cardigan";

export type HeroAccessory =
  | "none"
  | "bow"
  | "earrings"
  | "chef-cap"
  | "garden-hat"
  | "scarf"
  | "glasses"
  | "name-badge";

export interface HeroCharacterProfile {
  id: string;
  age: "toddler" | "child" | "adult" | "elder";
  skin: readonly [number, number, number];
  hair: readonly [number, number, number];
  eye: readonly [number, number, number];
  primary: readonly [number, number, number];
  secondary: readonly [number, number, number];
  accent: readonly [number, number, number];
  shoe: readonly [number, number, number];
  hairStyle: HeroHairStyle;
  clothingStyle: HeroClothingStyle;
  accessory: HeroAccessory;
  headScale: number;
  bodyWidth: number;
  shoulderWidth: number;
  legLength: number;
  nameBadge?: string;
}

export const COMPANION_HERO_PROFILES: Partial<Record<CharacterId, HeroCharacterProfile>> = {
  sister: {
    id: "sister",
    age: "toddler",
    skin: [.67, .42, .27],
    hair: [.055, .032, .042],
    eye: [.29, .15, .08],
    primary: [.97, .70, .22],
    secondary: [.98, .47, .67],
    accent: [.74, .43, .88],
    shoe: [.76, .44, .89],
    hairStyle: "double-buns",
    clothingStyle: "dress",
    accessory: "bow",
    headScale: 1.13,
    bodyWidth: .92,
    shoulderWidth: .91,
    legLength: .88,
  },
  brother: {
    id: "brother",
    age: "child",
    skin: [.59, .35, .23],
    hair: [.045, .028, .035],
    eye: [.23, .12, .07],
    primary: [.23, .62, .43],
    secondary: [.15, .35, .57],
    accent: [.84, .66, .17],
    shoe: [.16, .40, .61],
    hairStyle: "fluffy-crop",
    clothingStyle: "hoodie",
    accessory: "none",
    headScale: 1.03,
    bodyWidth: 1.04,
    shoulderWidth: 1.06,
    legLength: 1.02,
  },
};

export const NPC_HERO_PROFILES: Record<NpcId, HeroCharacterProfile> = {
  parent: {
    id: "parent",
    age: "adult",
    skin: [.61, .37, .24],
    hair: [.06, .035, .043],
    eye: [.27, .14, .08],
    primary: [.26, .61, .58],
    secondary: [.88, .63, .45],
    accent: [.93, .46, .61],
    shoe: [.25, .21, .23],
    hairStyle: "low-bun",
    clothingStyle: "tunic",
    accessory: "earrings",
    headScale: .98,
    bodyWidth: 1.06,
    shoulderWidth: 1.04,
    legLength: 1.06,
  },
  neighbor: {
    id: "neighbor",
    age: "adult",
    skin: [.47, .27, .18],
    hair: [.09, .045, .042],
    eye: [.22, .11, .06],
    primary: [.85, .35, .44],
    secondary: [.27, .62, .59],
    accent: [.96, .72, .23],
    shoe: [.34, .20, .23],
    hairStyle: "layered-bob",
    clothingStyle: "tunic",
    accessory: "scarf",
    headScale: 1,
    bodyWidth: 1.04,
    shoulderWidth: 1.02,
    legLength: 1.03,
  },
  "cafe-worker": {
    id: "cafe-worker",
    age: "adult",
    skin: [.63, .39, .25],
    hair: [.055, .03, .038],
    eye: [.30, .16, .08],
    primary: [.91, .40, .50],
    secondary: [.98, .92, .81],
    accent: [.98, .72, .22],
    shoe: [.24, .18, .19],
    hairStyle: "low-bun",
    clothingStyle: "apron",
    accessory: "chef-cap",
    headScale: 1,
    bodyWidth: 1.04,
    shoulderWidth: 1.03,
    legLength: 1.04,
    nameBadge: "S",
  },
  "park-keeper": {
    id: "park-keeper",
    age: "adult",
    skin: [.55, .32, .20],
    hair: [.075, .045, .035],
    eye: [.26, .14, .07],
    primary: [.26, .55, .28],
    secondary: [.61, .42, .21],
    accent: [.94, .68, .19],
    shoe: [.30, .22, .14],
    hairStyle: "garden-crop",
    clothingStyle: "work-shirt",
    accessory: "garden-hat",
    headScale: 1,
    bodyWidth: 1.08,
    shoulderWidth: 1.08,
    legLength: 1.06,
    nameBadge: "S",
  },
  "park-parent": {
    id: "park-parent",
    age: "adult",
    skin: [.48, .28, .18],
    hair: [.06, .035, .045],
    eye: [.25, .12, .07],
    primary: [.67, .45, .78],
    secondary: [.96, .68, .50],
    accent: [.28, .65, .60],
    shoe: [.34, .21, .28],
    hairStyle: "wrapped-scarf",
    clothingStyle: "cardigan",
    accessory: "earrings",
    headScale: 1.01,
    bodyWidth: 1.04,
    shoulderWidth: 1.01,
    legLength: 1.03,
  },
  shopkeeper: {
    id: "shopkeeper",
    age: "adult",
    skin: [.45, .25, .16],
    hair: [.05, .035, .035],
    eye: [.21, .11, .06],
    primary: [.18, .53, .54],
    secondary: [.16, .28, .43],
    accent: [.94, .66, .18],
    shoe: [.20, .17, .18],
    hairStyle: "neat-crop",
    clothingStyle: "work-shirt",
    accessory: "name-badge",
    headScale: .99,
    bodyWidth: 1.08,
    shoulderWidth: 1.10,
    legLength: 1.06,
    nameBadge: "K",
  },
  "grocery-shopper": {
    id: "grocery-shopper",
    age: "elder",
    skin: [.61, .38, .25],
    hair: [.66, .65, .68],
    eye: [.29, .15, .08],
    primary: [.64, .30, .48],
    secondary: [.94, .82, .68],
    accent: [.28, .62, .59],
    shoe: [.30, .21, .25],
    hairStyle: "silver-bob",
    clothingStyle: "cardigan",
    accessory: "glasses",
    headScale: 1.02,
    bodyWidth: 1.06,
    shoulderWidth: 1.00,
    legLength: .98,
  },
};
