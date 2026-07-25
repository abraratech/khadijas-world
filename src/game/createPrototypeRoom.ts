import type { Engine } from "@babylonjs/core";
import type {
  PrototypeRoom,
  RoomOptions,
} from "./world/WorldContext";
import { createWorld } from "./world/createWorld";

export type {
  InteractionSound,
  PlayState,
  PrototypeRoom,
  RoomDialogueContext,
  RoomOptions,
} from "./world/WorldContext";

/**
 * Backwards-compatible public entry point.
 *
 * World construction now lives behind the typed world coordinator so callers do
 * not depend on location, character, or mesh-construction implementation details.
 */
export function createPrototypeRoom(
  engine: Engine,
  options: RoomOptions,
): PrototypeRoom {
  return createWorld(engine, options);
}
