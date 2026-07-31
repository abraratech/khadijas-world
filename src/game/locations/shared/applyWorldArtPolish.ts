import { type Mesh, type Scene } from "@babylonjs/core";
import { applyBedroomHighPolish } from "../bedroom/applyBedroomHighPolish";
import { applyCafeHighPolish } from "../cafe/applyCafeHighPolish";
import { applyFamilyHomeHighPolish } from "../familyHome/applyFamilyHomeHighPolish";
import { applyFamilyHomeSceneComposition } from "../familyHome/applyFamilyHomeSceneComposition";
import { applyFamilyHomeLightingAndMaterials } from "../familyHome/applyFamilyHomeLightingAndMaterials";
import { applyFamilyHomeFocalHierarchy } from "../familyHome/applyFamilyHomeFocalHierarchy";
import { applyGroceryHighPolish } from "../grocery/applyGroceryHighPolish";
import { applyParkHighPolish } from "../park/applyParkHighPolish";
import { applyStreetHighPolish } from "../street/applyStreetHighPolish";
import { applyFastTrackSceneCleanup } from "./applyFastTrackSceneCleanup";
import { applyStreetGroceryRefresh } from "./applyStreetGroceryRefresh";

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
  const homeDetails =
    applyFamilyHomeHighPolish(scene);

  const composedHomeDetails =
    applyFamilyHomeSceneComposition(
      scene,
      homeDetails,
    );

  const litHomeDetails =
    applyFamilyHomeLightingAndMaterials(
      scene,
      composedHomeDetails,
    );

  const focusedHomeDetails =
    applyFamilyHomeFocalHierarchy(
      scene,
      litHomeDetails,
    );

  const details = [
    ...focusedHomeDetails,
    ...applyBedroomHighPolish(scene, offsets.bedroom),
    ...applyStreetHighPolish(scene, offsets.street),
    ...applyCafeHighPolish(scene, offsets.cafe),
    ...applyParkHighPolish(scene, offsets.park),
    ...applyGroceryHighPolish(scene, offsets.grocery),
  ];

  applyFastTrackSceneCleanup(scene);

  details.push(
    ...applyStreetGroceryRefresh(
      scene,
      offsets.grocery,
    ),
  );

  return details;
}
