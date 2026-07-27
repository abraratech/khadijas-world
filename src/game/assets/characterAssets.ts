import type { CharacterId } from "../characterState";
import type { NpcId } from "../livingCharacters";
import type { OutfitId } from "../storage";

export const CHARACTER_ASSET_VERSION = "art1e-1";

export type SemanticCharacterAnimation =
  | "idle"
  | "walk"
  | "run"
  | "walkCarry"
  | "pickUp"
  | "sitDown"
  | "standUp";

export type ProductionAssetQualityPolicy = "all" | "medium-high";

export interface ProductionCharacterAssetDefinition {
  id: string;
  assetVersion: string;
  modelPath: string;
  fallback: "procedural";
  scale: number;
  /** Optional world-space visual height. When set, imported bounds are normalized to this height. */
  targetHeight?: number;
  rotationY: number;
  verticalOffset: number;
  qualityPolicy: ProductionAssetQualityPolicy;
  animations: Partial<Record<SemanticCharacterAnimation, readonly string[]>>;
  /** Freeze an available movement clip at this normalized frame while idle. */
  idlePoseFraction?: number;
  /** Small local-node corrections applied after the idle frame is sampled. */
  idlePoseAdjustments?: readonly {
    nodeName: string;
    axis: "x" | "y" | "z";
    radians: number;
    multiply?: "before" | "after";
  }[];
  outfitTextures?: Partial<Record<OutfitId, string>>;
  triangleCount: number;
  textureSize: readonly [number, number];
  materialCount: number;
  source: string;
  license: string;
}

const QUATERNIUS_ANIMATIONS: ProductionCharacterAssetDefinition["animations"] = {
  idle: ["Idle"],
  walk: ["Walk"],
  run: ["Run"],
  walkCarry: ["Walk_Carry"],
  pickUp: ["PickUp"],
  sitDown: ["SitDown"],
  standUp: ["StandUp"],
};

export const KHADIJA_PRODUCTION_ASSET: ProductionCharacterAssetDefinition = {
  id: "khadija",
  assetVersion: CHARACTER_ASSET_VERSION,
  modelPath: "assets/characters/khadija/khadija-v1.glb",
  fallback: "procedural",
  // Babylon resolves the Meshy armature unit conversion during import.
  scale: 1.23,
  rotationY: Math.PI,
  verticalOffset: 0,
  qualityPolicy: "medium-high",
  animations: {
    walk: ["Walking", "walk", "walking"],
    run: ["Running", "run", "running"],
  },
  outfitTextures: {
    pink: "assets/characters/khadija/outfits/khadija-pink.webp",
    teal: "assets/characters/khadija/outfits/khadija-teal.webp",
    yellow: "assets/characters/khadija/outfits/khadija-yellow.webp",
  },
  triangleCount: 168_908,
  textureSize: [2048, 2048],
  materialCount: 1,
  source: "Meshy AI generation supplied by the project owner",
  license: "Project-owner generated asset; see ASSET_CREDITS.md",
};

export const BROTHER_PRODUCTION_ASSET: ProductionCharacterAssetDefinition = {
  id: "brother",
  assetVersion: CHARACTER_ASSET_VERSION,
  modelPath: "assets/characters/brother/brother-v1.glb",
  fallback: "procedural",
  scale: 1,
  targetHeight: 1.95,
  rotationY: 0,
  verticalOffset: 0,
  qualityPolicy: "all",
  animations: QUATERNIUS_ANIMATIONS,
  triangleCount: 3_216,
  textureSize: [0, 0],
  materialCount: 6,
  source: "Quaternius Ultimate Animated Character Pack — Casual2_Male",
  license: "CC0; see THIRD_PARTY_NOTICES.md",
};

export const MAMA_PRODUCTION_ASSET: ProductionCharacterAssetDefinition = {
  id: "parent",
  assetVersion: CHARACTER_ASSET_VERSION,
  modelPath: "assets/characters/mama/mama-v1.glb",
  fallback: "procedural",
  // Normalize from the imported visual bounds instead of guessing against
  // Meshy/armature unit conversions. This makes Mama visibly adult-sized.
  scale: 1,
  targetHeight: 2.80,
  rotationY: Math.PI,
  verticalOffset: 0,
  qualityPolicy: "medium-high",
  animations: {
    walk: ["Armature|walking_man|baselayer", "walking_man", "walking", "walk"],
  },
  // The GLB has no separate idle clip. Sample the least-strided walk frame,
  // then rotate both upper-arm nodes down from the source clip's wide pose.
  idlePoseFraction: 0,
  idlePoseAdjustments: [
    {
      nodeName: "LeftArm",
      axis: "x",
      radians: 0.58,
      multiply: "before",
    },
    {
      nodeName: "RightArm",
      axis: "x",
      radians: 0.58,
      multiply: "before",
    },
  ],
  triangleCount: 72_269,
  textureSize: [2048, 2048],
  materialCount: 1,
  source: "Meshy AI generation supplied by the project owner",
  license: "Project-owner generated asset; see ASSET_CREDITS.md",
};

export const NEIGHBOR_PRODUCTION_ASSET: ProductionCharacterAssetDefinition = {
  id: "neighbor",
  assetVersion: CHARACTER_ASSET_VERSION,
  modelPath: "assets/characters/neighbor/neighbor-v1.glb",
  fallback: "procedural",
  scale: 1,
  targetHeight: 2.28,
  rotationY: 0,
  verticalOffset: 0,
  qualityPolicy: "all",
  animations: QUATERNIUS_ANIMATIONS,
  triangleCount: 6_752,
  textureSize: [0, 0],
  materialCount: 6,
  source: "Quaternius Ultimate Animated Character Pack — Casual2_Female",
  license: "CC0; see THIRD_PARTY_NOTICES.md",
};

export const CAFE_WORKER_PRODUCTION_ASSET: ProductionCharacterAssetDefinition = {
  id: "cafe-worker",
  assetVersion: CHARACTER_ASSET_VERSION,
  modelPath: "assets/characters/cafe-worker/cafe-worker-v1.glb",
  fallback: "procedural",
  scale: 1,
  targetHeight: 2.34,
  rotationY: 0,
  verticalOffset: 0,
  qualityPolicy: "all",
  animations: QUATERNIUS_ANIMATIONS,
  triangleCount: 8_768,
  textureSize: [0, 0],
  materialCount: 6,
  source: "Quaternius Ultimate Animated Character Pack — Chef_Female",
  license: "CC0; see THIRD_PARTY_NOTICES.md",
};

export const PARK_KEEPER_PRODUCTION_ASSET: ProductionCharacterAssetDefinition = {
  id: "park-keeper",
  assetVersion: CHARACTER_ASSET_VERSION,
  modelPath: "assets/characters/park-keeper/park-keeper-v1.glb",
  fallback: "procedural",
  scale: 1,
  targetHeight: 2.38,
  rotationY: 0,
  verticalOffset: 0,
  qualityPolicy: "all",
  animations: QUATERNIUS_ANIMATIONS,
  triangleCount: 2_524,
  textureSize: [0, 0],
  materialCount: 6,
  source: "Quaternius Ultimate Animated Character Pack — Worker_Male",
  license: "CC0; see THIRD_PARTY_NOTICES.md",
};

export const SHOPKEEPER_PRODUCTION_ASSET: ProductionCharacterAssetDefinition = {
  id: "shopkeeper",
  assetVersion: CHARACTER_ASSET_VERSION,
  modelPath: "assets/characters/grocery-shopkeeper/grocery-shopkeeper-v1.glb",
  fallback: "procedural",
  scale: 1,
  targetHeight: 2.36,
  rotationY: 0,
  verticalOffset: 0,
  qualityPolicy: "all",
  animations: QUATERNIUS_ANIMATIONS,
  triangleCount: 5_856,
  textureSize: [0, 0],
  materialCount: 7,
  source: "Quaternius Ultimate Animated Character Pack — Worker_Female",
  license: "CC0; see THIRD_PARTY_NOTICES.md",
};

export const PRODUCTION_CHARACTER_ASSETS: Partial<
  Record<CharacterId, ProductionCharacterAssetDefinition>
> = {
  khadija: KHADIJA_PRODUCTION_ASSET,
};

/**
 * World NPCs use the cohesive hero-procedural system.
 *
 * Mama's Meshy definition remains above for asset history and rollback, but it
 * is deliberately not registered here because the supplied GLB has no true
 * idle/talk animation and reads as static beside the living procedural cast.
 */
export const PRODUCTION_NPC_ASSETS: Partial<
  Record<NpcId, ProductionCharacterAssetDefinition>
> = {};

export function resolvePublicAssetUrl(path: string, baseUri?: string): string {
  const base = baseUri
    ?? (typeof document !== "undefined" ? document.baseURI : "http://localhost/");
  return new URL(path, base).href;
}

export function findAnimationName(
  availableNames: readonly string[],
  candidates: readonly string[] | undefined,
): string | null {
  if (!candidates?.length) return null;
  const exact = new Map(availableNames.map((name) => [name.toLowerCase(), name]));
  for (const candidate of candidates) {
    const match = exact.get(candidate.toLowerCase());
    if (match) return match;
  }
  for (const candidate of candidates) {
    const loweredCandidate = candidate.toLowerCase();
    const partial = availableNames.find((name) => name.toLowerCase().includes(loweredCandidate));
    if (partial) return partial;
  }
  return null;
}

export function isProductionAssetAllowed(
  definition: ProductionCharacterAssetDefinition,
  mediumHighEnabled: boolean,
): boolean {
  return definition.qualityPolicy === "all" || mediumHighEnabled;
}
