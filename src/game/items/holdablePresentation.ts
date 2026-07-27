import { CONTAINER_IDS, type ContainerId } from "../everydayState";

export type HoldType = "one-hand" | "two-hand" | "hug" | "read" | "tray";
export type HolderClass = "toddler" | "child" | "adult";
export type HoldAnchorKind = "hand" | "center";

export interface HoldablePresentation {
  floorY: number;
  holdScale: readonly [number, number, number];
  holdOffset: readonly [number, number, number];
  holdRotation: readonly [number, number, number];
  footprint: readonly [number, number];
  holdType: HoldType;
}

export interface ResolvedHoldablePresentation extends HoldablePresentation {
  anchor: HoldAnchorKind;
}

const oneHand = (
  floorY: number,
  holdScale: readonly [number, number, number],
  holdOffset: readonly [number, number, number],
  holdRotation: readonly [number, number, number],
  footprint: readonly [number, number],
): HoldablePresentation => ({
  floorY,
  holdScale,
  holdOffset,
  holdRotation,
  footprint,
  holdType: "one-hand",
});

export const HOLDABLE_PRESENTATIONS: Readonly<Record<string, HoldablePresentation>> = {
  teddy: {
    floorY: .42,
    holdScale: [.62, .62, .62],
    holdOffset: [0, -.08, -.04],
    holdRotation: [0, .08, 0],
    footprint: [.62, .42],
    holdType: "hug",
  },
  book: {
    floorY: .09,
    holdScale: [.68, .68, .68],
    holdOffset: [0, -.10, -.06],
    holdRotation: [-.56, 0, 0],
    footprint: [.85, .62],
    holdType: "read",
  },
  apple: oneHand(
    .20,
    [.78, .78, .78],
    [0, -.02, -.08],
    [0, 0, 0],
    [.36, .36],
  ),
  cup: oneHand(
    .25,
    [.70, .70, .70],
    [.03, -.02, -.09],
    [0, -.22, 0],
    [.44, .38],
  ),
  cupcake: oneHand(
    .18,
    [.72, .72, .72],
    [0, -.02, -.08],
    [0, 0, 0],
    [.34, .34],
  ),
  sandwich: oneHand(
    .18,
    [.72, .72, .72],
    [0, -.02, -.09],
    [0, 0, .08],
    [.46, .32],
  ),
  "toy-block": oneHand(
    .17,
    [.76, .76, .76],
    [0, -.02, -.07],
    [0, .18, 0],
    [.34, .34],
  ),
  "serving-tray": {
    floorY: .12,
    holdScale: [.76, .76, .76],
    holdOffset: [0, -.24, -.08],
    holdRotation: [0, 0, 0],
    footprint: [.82, .52],
    holdType: "tray",
  },
  "prep-plate": {
    floorY: .08,
    holdScale: [.74, .74, .74],
    holdOffset: [0, -.20, -.06],
    holdRotation: [0, 0, 0],
    footprint: [.76, .76],
    holdType: "tray",
  },
  "mixing-bowl": {
    floorY: .14,
    holdScale: [.70, .70, .70],
    holdOffset: [0, -.17, -.07],
    holdRotation: [0, 0, 0],
    footprint: [.74, .74],
    holdType: "two-hand",
  },
  backpack: {
    floorY: .24,
    holdScale: [.72, .72, .72],
    holdOffset: [0, -.12, -.06],
    holdRotation: [0, 0, 0],
    footprint: [.68, .38],
    holdType: "hug",
  },
  basket: {
    floorY: .24,
    holdScale: [.74, .74, .74],
    holdOffset: [0, -.15, -.07],
    holdRotation: [0, 0, 0],
    footprint: [.68, .42],
    holdType: "two-hand",
  },
  "shopping-basket": {
    floorY: .28,
    holdScale: [.74, .74, .74],
    holdOffset: [0, -.16, -.08],
    holdRotation: [0, 0, 0],
    footprint: [.75, .50],
    holdType: "two-hand",
  },
  "shopping-bag": oneHand(
    .28,
    [.74, .74, .74],
    [.05, -.15, -.24],
    [0, -.12, 0],
    [.60, .42],
  ),
  "picnic-basket": {
    floorY: .28,
    holdScale: [.70, .70, .70],
    holdOffset: [0, -.16, -.08],
    holdRotation: [0, 0, 0],
    footprint: [.80, .50],
    holdType: "two-hand",
  },
};

const HOLDER_ADJUSTMENTS: Readonly<Record<HolderClass, {
  scale: number;
  handOffset: readonly [number, number, number];
  centerOffset: readonly [number, number, number];
}>> = {
  toddler: {
    scale: .82,
    handOffset: [-.01, -.07, .04],
    centerOffset: [0, -.12, .05],
  },
  child: {
    scale: 1,
    handOffset: [0, 0, 0],
    centerOffset: [0, 0, 0],
  },
  adult: {
    scale: 1.08,
    handOffset: [.01, .035, -.02],
    centerOffset: [0, .04, -.025],
  },
};

export function presentationFor(itemId: string): HoldablePresentation | null {
  return HOLDABLE_PRESENTATIONS[itemId] ?? null;
}

export function resolvePresentationForHolder(
  itemId: string,
  holderClass: HolderClass,
): ResolvedHoldablePresentation | null {
  const presentation = presentationFor(itemId);
  if (!presentation) return null;

  const anchor: HoldAnchorKind = presentation.holdType === "one-hand" ? "hand" : "center";
  const adjustment = HOLDER_ADJUSTMENTS[holderClass];
  const offsetAdjustment = anchor === "hand"
    ? adjustment.handOffset
    : adjustment.centerOffset;

  return {
    ...presentation,
    anchor,
    holdScale: presentation.holdScale.map((value) => value * adjustment.scale) as [
      number,
      number,
      number,
    ],
    holdOffset: presentation.holdOffset.map((value, index) => (
      value + offsetAdjustment[index]
    )) as [number, number, number],
  };
}

const TRAY_COMPATIBLE_ITEMS = new Set([
  "apple",
  "banana",
  "berries",
  "bread",
  "cheese",
  "cup",
  "cupcake",
  "mixing-bowl",
  "prep-plate",
  "sandwich",
  "tea-leaves",
]);

export function containerCompatibilityIssue(
  containerId: ContainerId,
  itemId: string,
): string | null {
  if (containerId === itemId) return "That cannot go inside itself.";

  if (CONTAINER_IDS.includes(itemId as ContainerId)) {
    return "Containers stay separate so nothing gets lost inside another container.";
  }

  if (containerId === "toy-box" && !["teddy", "toy-block"].includes(itemId)) {
    return "The toy box is saving room for toys.";
  }

  if (
    containerId === "serving-tray"
    && !TRAY_COMPATIBLE_ITEMS.has(itemId)
    && !itemId.startsWith("prepared-")
    && !itemId.startsWith("shop-")
  ) {
    return "The serving tray is for food, drinks, and dishes.";
  }

  return null;
}
