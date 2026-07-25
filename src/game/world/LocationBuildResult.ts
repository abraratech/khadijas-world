import type {
  AbstractMesh,
  TransformNode,
} from "@babylonjs/core";
import type { SeatSlot } from "../seatRegistry";
import type { RoomId } from "../storage";
import type { SnapTarget } from "../shared/placementHelpers";

export interface LocationBuildResult {
  id: RoomId;
  root: TransformNode;
  interactiveMeshes: AbstractMesh[];
  seats: SeatSlot[];
  placementSlots: SnapTarget[];
  activate(): void;
  deactivate(): void;
  dispose(): void;
}
