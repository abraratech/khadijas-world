import type { Engine } from "@babylonjs/core";
import type { PrototypeRoom, RoomOptions } from "./WorldContext";
import { createWorldRuntime } from "./createWorldRuntime";

/**
 * Coordinates creation of the shared world.
 *
 * The runtime module owns cross-location gameplay wiring while focused builders
 * own geometry, character visuals, materials, interactions, and placement.
 */
export function createWorld(
  engine: Engine,
  options: RoomOptions,
): PrototypeRoom {
  return createWorldRuntime(engine, options);
}
