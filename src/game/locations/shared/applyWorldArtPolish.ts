import { type Mesh, type Scene } from "@babylonjs/core";
import { applyBedroomHighPolish } from "../bedroom/applyBedroomHighPolish";
import { applyCafeHighPolish } from "../cafe/applyCafeHighPolish";
import { applyFamilyHomeHighPolish } from "../familyHome/applyFamilyHomeHighPolish";
import { applyGroceryHighPolish } from "../grocery/applyGroceryHighPolish";
import { applyParkHighPolish } from "../park/applyParkHighPolish";
import { applyStreetHighPolish } from "../street/applyStreetHighPolish";

export interface WorldArtPolishOffsets {
  bedroom: number;
  street: number;
  cafe: number;
  park: number;
  grocery: number;
}

/**
 * Adds non-interactive visual layers over the existing gameplay geometry.
 * Every mesh is tagged as a High decorative detail so quality switching can
 * hide the richer presentation without changing collisions, seats, hotspots,
 * items, NPC state, travel, or save identifiers.
 */
export function applyWorldArtPolish(
  scene: Scene,
  offsets: WorldArtPolishOffsets,
): Mesh[] {
  return [
    ...applyFamilyHomeHighPolish(scene),
    ...applyBedroomHighPolish(scene, offsets.bedroom),
    ...applyStreetHighPolish(scene, offsets.street),
    ...applyCafeHighPolish(scene, offsets.cafe),
    ...applyParkHighPolish(scene, offsets.park),
    ...applyGroceryHighPolish(scene, offsets.grocery),
  ];
}
