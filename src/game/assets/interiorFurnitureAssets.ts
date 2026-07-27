import type { RoomId } from "../storage";

export const INTERIOR_FURNITURE_ASSET_VERSION = "art1ka-1";

export interface InteriorFurnitureSelector {
  names?: readonly string[];
  prefixes?: readonly string[];
}

export interface InteriorFurniturePlacementDefinition {
  id: string;
  room: RoomId;
  modelPath: string;
  center: readonly [number, number, number];
  targetSize: readonly [number, number, number];
  rotationY: number;
  hide?: InteriorFurnitureSelector;
  source: string;
  license: string;
}

const source = "Quaternius Ultimate House Interior Pack";
const license = "CC0; see THIRD_PARTY_NOTICES.md";
const bedroomPath = "assets/interiors/ultimate-house-v1/bedroom";
const commercialPath = "assets/interiors/ultimate-house-v1/commercial";

const placement = (
  id: string,
  room: RoomId,
  modelPath: string,
  center: readonly [number, number, number],
  targetSize: readonly [number, number, number],
  rotationY = 0,
  hide?: InteriorFurnitureSelector,
): InteriorFurniturePlacementDefinition => ({
  id,
  room,
  modelPath,
  center,
  targetSize,
  rotationY,
  hide,
  source,
  license,
});

/**
 * Selected imported furniture for High graphics. These are visual shells only:
 * the existing procedural meshes remain the interaction, collision, seat,
 * storage, placement, and save authority. Items that did not clearly improve
 * the authored procedural scenes remain packaged for review but are not listed
 * here and therefore never enter the runtime.
 */
export function createInteriorFurniturePlacements(offsets: {
  bedroom: number;
  cafe: number;
  grocery: number;
}): readonly InteriorFurniturePlacementDefinition[] {
  const bedroom = offsets.bedroom;
  const cafe = offsets.cafe;
  const grocery = offsets.grocery;

  return [
    // Family-home kitchen: recognizable appliance shells over existing proxies.
    placement(
      "home-fridge-shell",
      "home",
      `${commercialPath}/kitchen-fridge.glb`,
      [2.30, 1.46, 2.95],
      [1.46, 2.92, 1.16],
      Math.PI,
      { names: ["fridge"], prefixes: ["fridge-"] },
    ),
    placement(
      "home-cabinet-shell",
      "home",
      `${commercialPath}/kitchen-cabinet2.glb`,
      [3.10, .54, 3.14],
      [.88, 1.02, .86],
      Math.PI,
      {
        names: ["cabinet-door-3.1", "cabinet-knob-3.1"],
        prefixes: ["art1g-home-cabinet-rail-3.1", "art1g-home-cabinet-stile-3.1"],
      },
    ),
    placement(
      "home-sink-shell",
      "home",
      `${commercialPath}/kitchen-sink.glb`,
      [4.00, .65, 3.14],
      [.90, 1.28, .86],
      Math.PI,
      {
        names: ["sink", "cabinet-door-4", "cabinet-knob-4"],
        prefixes: ["art1g-home-cabinet-rail-4", "art1g-home-cabinet-stile-4"],
      },
    ),
    placement(
      "home-oven-shell",
      "home",
      `${commercialPath}/kitchen-oven.glb`,
      [5.00, .54, 3.14],
      [.92, 1.02, .86],
      Math.PI,
      {
        names: ["cabinet-door-4.9", "cabinet-knob-4.9"],
        prefixes: [
          "art1g-home-cabinet-rail-4.9",
          "art1g-home-cabinet-stile-4.9",
          "art1g-home-oven",
        ],
      },
    ),

    // Bedroom: selected pieces that add silhouette detail without replacing the
    // richer authored bed, carpet, or wardrobe.
    placement(
      "bedroom-curtains-shell",
      "bedroom",
      `${bedroomPath}/curtains-double.glb`,
      [bedroom - 2.80, 2.52, 3.47],
      [3.02, 2.08, .34],
      0,
      {
        names: ["bedroom-curtain-left", "bedroom-curtain-right"],
        prefixes: ["art1h-bedroom-curtain-"],
      },
    ),
    placement(
      "bedroom-nightstand-shell",
      "bedroom",
      `${bedroomPath}/nightstand-1.glb`,
      [bedroom - 1.42, .48, 1.34],
      [.84, .78, .72],
      0,
      { prefixes: ["art1h-bedroom-nightstand"] },
    ),
    placement(
      "bedroom-desk-lamp-shell",
      "bedroom",
      `${bedroomPath}/light-desk.glb`,
      [bedroom + 4.33, 1.50, 2.88],
      [.38, .72, .50],
      Math.PI,
      { prefixes: ["art1h-bedroom-desk-lamp-"] },
    ),
    placement(
      "bedroom-plant-shell",
      "bedroom",
      `${bedroomPath}/houseplant-6.glb`,
      [bedroom + 5.25, .51, 2.65],
      [.88, 1.02, .88],
      0,
      { prefixes: ["art1h-bedroom-floor-plant-"] },
    ),
    placement(
      "bedroom-display-shelf-shell",
      "bedroom",
      `${bedroomPath}/shelf-small1.glb`,
      [bedroom + 1.00, .52, 3.12],
      [2.30, .78, .66],
      0,
      {
        names: ["toy-shelf", "toy-shelf-divider"],
        prefixes: ["art1h-bedroom-storage-"],
      },
    ),

    // Sunny Café: one imported seating vignette plus a recognizable work line.
    placement(
      "cafe-table-shell",
      "cafe",
      `${commercialPath}/table-roundsmall2.glb`,
      [cafe - 3.50, .57, .95],
      [1.42, 1.05, 1.18],
      0,
      {
        names: ["cafe-table-0", "cafe-table-leg-0"],
        prefixes: [
          "art1i-cafe-table-shadow-0",
          "art1i-cafe-table-top-0",
          "art1i-cafe-table-pedestal-0",
          "art1i-cafe-table-base-0",
          "art1i-cafe-vase-0",
          "art1i-cafe-flower-stem-0",
          "art1i-cafe-flower-0",
        ],
      },
    ),
    placement(
      "cafe-chair-front-shell",
      "cafe",
      `${commercialPath}/chair-2.glb`,
      [cafe - 3.50, .64, 0],
      [.78, 1.25, .78],
      0,
      {
        names: ["cafe-chair-seat-0-0", "cafe-chair-leg-0-0"],
        prefixes: [
          "art1i-cafe-chair-shadow-0-0",
          "art1i-cafe-chair-seat-0-0",
          "art1i-cafe-chair-back-0-0",
          "art1i-cafe-chair-leg-0-0",
        ],
      },
    ),
    placement(
      "cafe-chair-back-shell",
      "cafe",
      `${commercialPath}/chair-2.glb`,
      [cafe - 3.50, .64, 1.90],
      [.78, 1.25, .78],
      Math.PI,
      {
        names: ["cafe-chair-seat-0-1.9", "cafe-chair-leg-0-1.9"],
        prefixes: [
          "art1i-cafe-chair-shadow-0-1",
          "art1i-cafe-chair-seat-0-1",
          "art1i-cafe-chair-back-0-1",
          "art1i-cafe-chair-leg-0-1",
        ],
      },
    ),
    placement(
      "cafe-stool-left-shell",
      "cafe",
      `${commercialPath}/stool.glb`,
      [cafe + 2.82, .48, .43],
      [.58, .96, .58],
    ),
    placement(
      "cafe-stool-right-shell",
      "cafe",
      `${commercialPath}/stool.glb`,
      [cafe + 3.62, .48, .43],
      [.58, .96, .58],
    ),
    placement(
      "cafe-back-cabinet-shell",
      "cafe",
      `${commercialPath}/kitchen-cabinet2.glb`,
      [cafe + 2.58, .51, 3.34],
      [.92, 1.02, .72],
      Math.PI,
      {
        names: ["cafe-back-counter"],
        prefixes: ["art1i-cafe-back-counter", "art1i-cafe-back-cabinet", "art1i-cafe-back-knob"],
      },
    ),
    placement(
      "cafe-back-sink-shell",
      "cafe",
      `${commercialPath}/kitchen-sink.glb`,
      [cafe + 3.52, .62, 3.34],
      [.92, 1.24, .72],
      Math.PI,
    ),
    placement(
      "cafe-back-oven-shell",
      "cafe",
      `${commercialPath}/kitchen-oven.glb`,
      [cafe + 4.46, .51, 3.34],
      [.92, 1.02, .72],
      Math.PI,
    ),
    placement(
      "cafe-pendant-left-shell",
      "cafe",
      `${commercialPath}/light-ceilingsingle.glb`,
      [cafe - 3.50, 3.55, .95],
      [.42, .70, .42],
    ),
    placement(
      "cafe-pendant-right-shell",
      "cafe",
      `${commercialPath}/light-ceilingsingle.glb`,
      [cafe - 1.10, 3.55, .95],
      [.42, .70, .42],
    ),

    // Grocery: paired refrigerator shells and a clearly recognizable waste bin.
    placement(
      "grocery-fridge-left-shell",
      "grocery",
      `${commercialPath}/kitchen-fridge.glb`,
      [grocery + 3.82, 1.34, 2.90],
      [1.12, 2.64, .82],
      Math.PI,
      {
        names: ["grocery-fridge", "grocery-fridge-glass"],
        prefixes: ["art1i-grocery-fridge-"],
      },
    ),
    placement(
      "grocery-fridge-right-shell",
      "grocery",
      `${commercialPath}/kitchen-fridge.glb`,
      [grocery + 5.08, 1.34, 2.90],
      [1.12, 2.64, .82],
      Math.PI,
    ),
    placement(
      "grocery-trashcan-shell",
      "grocery",
      `${commercialPath}/trashcan-small1.glb`,
      [grocery + 5.12, .39, -1.42],
      [.62, .78, .48],
    ),
  ] as const;
}

export const INTERIOR_REVIEW_ONLY_ASSETS = [
  `${bedroomPath}/bed-single.glb`,
  `${bedroomPath}/carpet-2.glb`,
  `${bedroomPath}/drawer-3.glb`,
  `${commercialPath}/plate-1.glb`,
  `${commercialPath}/shelf-large.glb`,
  `${commercialPath}/spoon.glb`,
] as const;
