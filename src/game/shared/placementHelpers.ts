import {
  type Mesh,
  MeshBuilder,
  PointerDragBehavior,
  type Scene,
  type StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { saveProp } from "../storage";

export interface SnapTarget {
  name: string;
  position: Vector3;
  marker: Mesh;
  occupiedBy: string | null;
}

export function createSnapMarker(scene: Scene, name: string, position: Vector3, markerMaterial: StandardMaterial): Mesh {
  const marker = MeshBuilder.CreateTorus(name, { diameter: 0.7, thickness: 0.07, tessellation: 20 }, scene);
  marker.position.copyFrom(position);
  marker.position.y = Math.max(0.04, position.y - 0.18);
  marker.material = markerMaterial;
  marker.isPickable = false;
  marker.setEnabled(false);
  return marker;
}

export function makeDraggable(
  mesh: Mesh,
  floorY: number,
  targets: SnapTarget[],
  onAction: (message: string) => void,
): void {
  const drag = new PointerDragBehavior({ dragPlaneNormal: Vector3.Up() });
  drag.useObjectOrientationForDragging = false;
  drag.updateDragPlane = false;
  mesh.addBehavior(drag);

  let dragStartPosition = mesh.position.clone();
  let dragActivated = false;
  const restoredTarget = targets.find((target) => (
    Math.hypot(target.position.x - mesh.position.x, target.position.z - mesh.position.z) < .12
  ));
  if (restoredTarget && !restoredTarget.occupiedBy) restoredTarget.occupiedBy = mesh.name;

  drag.onDragStartObservable.add(() => {
    dragStartPosition = mesh.position.clone();
    dragActivated = false;
    mesh.metadata = { ...mesh.metadata, dragging: true, dragMoved: false };
    for (const target of targets) {
      if (target.occupiedBy === mesh.name) target.occupiedBy = null;
    }
  });

  drag.onDragObservable.add(() => {
    const horizontalDistance = Math.hypot(
      mesh.position.x - dragStartPosition.x,
      mesh.position.z - dragStartPosition.z,
    );

    if (!dragActivated && horizontalDistance < 0.08) return;

    if (!dragActivated) {
      dragActivated = true;
      mesh.metadata = { ...mesh.metadata, dragMoved: true };
      for (const target of targets) target.marker.setEnabled(true);
      onAction(`Drag the ${mesh.name.replace("draggable-", "")} to a glowing spot!`);
    }

    mesh.position.y = floorY;
    mesh.position.x = Math.max(-5.4, Math.min(71.4, mesh.position.x));
    mesh.position.z = Math.max(-3.55, Math.min(3.55, mesh.position.z));

    let nearest: SnapTarget | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const target of targets) {
      const dx = target.position.x - mesh.position.x;
      const dz = target.position.z - mesh.position.z;
      const distance = Math.hypot(dx, dz);
      target.marker.scaling.setAll(1);
      if ((!target.occupiedBy || target.occupiedBy === mesh.name) && distance < nearestDistance) {
        nearest = target;
        nearestDistance = distance;
      }
    }
    if (nearest && nearestDistance < 1.15) nearest.marker.scaling.setAll(1.35);
  });

  drag.onDragEndObservable.add(() => {
    mesh.metadata = { ...mesh.metadata, dragging: false };

    if (!dragActivated) {
      mesh.position.copyFrom(dragStartPosition);
      mesh.metadata = { ...mesh.metadata, dragMoved: false };
      return;
    }

    window.setTimeout(() => {
      mesh.metadata = { ...mesh.metadata, dragMoved: false };
    }, 220);

    let nearest: SnapTarget | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const target of targets) {
      target.marker.setEnabled(false);
      target.marker.scaling.setAll(1);
      const dx = target.position.x - mesh.position.x;
      const dz = target.position.z - mesh.position.z;
      const distance = Math.hypot(dx, dz);
      if ((!target.occupiedBy || target.occupiedBy === mesh.name) && distance < nearestDistance) {
        nearest = target;
        nearestDistance = distance;
      }
    }

    if (nearest && nearestDistance < 1.15) {
      mesh.position.copyFrom(nearest.position);
      nearest.occupiedBy = mesh.name;
      onAction(`Lovely! The ${mesh.name.replace("draggable-", "")} is on the ${nearest.name}.`);
    } else {
      mesh.position.y = floorY;
      const blockedNearby = targets.some((target) => (
        target.occupiedBy
        && Math.hypot(target.position.x - mesh.position.x, target.position.z - mesh.position.z) < 1.15
      ));
      onAction(blockedNearby
        ? "That spot is already busy. Try another glowing place!"
        : `The ${mesh.name.replace("draggable-", "")} is ready to play with.`);
    }
    saveProp(mesh);
  });
}


