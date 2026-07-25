import {
  ActionManager,
  Animation,
  ExecuteCodeAction,
  type Mesh,
  MeshBuilder,
  type Scene,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import type { ContentState } from "../../contentState";
import type { SeatSlot } from "../../seatRegistry";
import { saveContentState, type RoomId } from "../../storage";
import { createMaterial as material, WORLD_COLORS as colors, type WorldMaterialRegistry } from "../../shared/createMaterials";
import { box } from "../../shared/meshHelpers";
import type { InteractionSound } from "../../world/WorldContext";
import type { LocationBuildResult } from "../../world/LocationBuildResult";

export interface StreetBuild extends LocationBuildResult {
  benchHotspot: Mesh;
  scooterHotspot: Mesh;
}

export interface StreetContext {
  scene: Scene;
  materials: WorldMaterialRegistry;
  detailMeshes: Mesh[];
  contentState: ContentState;
  position(x: number, y: number, z: number): Vector3;
  onAction(message: string, sound?: InteractionSound): void;
}

export function buildStreet({ scene, materials, detailMeshes, contentState, position: streetPosition, onAction }: StreetContext): StreetBuild {
  const root = new TransformNode("location-street-root", scene);
  const meshStart = scene.meshes.length;
  const { road, grass, sidewalk, peach, pink, sky, creamWall, cafeBlue, white, glass, wood, green, dark, teal, yellow } = materials;

  const streetGround = box(
    scene,
    "street-ground",
    new Vector3(12, 0.18, 8),
    streetPosition(0, -0.1, 0),
    grass,
  );
  streetGround.metadata = { walkable: true, room: "street" satisfies RoomId };
  const streetRoad = box(
    scene,
    "street-road",
    new Vector3(12, 0.05, 2.65),
    streetPosition(0, 0.01, -1.85),
    road,
  );
  streetRoad.metadata = { walkable: true, room: "street" satisfies RoomId };
  const streetSidewalk = box(
    scene,
    "street-sidewalk",
    new Vector3(12, 0.08, 1.35),
    streetPosition(0, 0.05, 0.15),
    sidewalk,
  );
  streetSidewalk.metadata = { walkable: true, room: "street" satisfies RoomId };
  for (const x of [-4.8, -3.2, -1.6, 0, 1.6, 3.2, 4.8]) {
    const roadMark = box(
      scene,
      `street-road-mark-${x}`,
      new Vector3(0.85, 0.02, 0.08),
      streetPosition(x, 0.05, -1.85),
      yellow,
    );
    roadMark.isPickable = false;
    detailMeshes.push(roadMark);
  }

  // Pastel building fronts give the hub clear destinations without loading full interiors.
  box(scene, "street-home-front", new Vector3(4.4, 3.45, 0.42), streetPosition(-3.55, 1.65, 3.55), peach);
  box(scene, "street-home-roof", new Vector3(4.75, 0.38, 0.72), streetPosition(-3.55, 3.45, 3.5), pink);
  box(scene, "street-home-window", new Vector3(1.35, 1.15, 0.08), streetPosition(-4.55, 2.05, 3.3), sky);
  box(scene, "street-cafe-front", new Vector3(4.4, 3.45, 0.42), streetPosition(3.55, 1.65, 3.55), creamWall);
  box(scene, "street-cafe-awning", new Vector3(4.4, 0.45, 0.85), streetPosition(3.55, 2.85, 3.12), cafeBlue);
  for (const x of [1.75, 2.6, 3.45, 4.3, 5.15]) {
    const stripe = box(scene, `street-awning-stripe-${x}`, new Vector3(0.36, 0.47, 0.88), streetPosition(x, 2.87, 3.1), white);
    stripe.isPickable = false;
    detailMeshes.push(stripe);
  }
  box(scene, "street-cafe-window", new Vector3(1.55, 1.2, 0.08), streetPosition(4.45, 1.85, 3.3), glass);

  // Street tree, flowers, mailbox, bench and scooter.
  box(scene, "street-tree-trunk", new Vector3(0.42, 2.1, 0.42), streetPosition(-0.25, 1.05, 2.3), wood);
  for (const [index, offset] of [
    new Vector3(-0.42, 2.3, 2.28),
    new Vector3(0.38, 2.35, 2.25),
    new Vector3(0, 2.75, 2.28),
  ].entries()) {
    const crown = MeshBuilder.CreateSphere(`street-tree-crown-${index}`, { diameter: 1.55, segments: 10 }, scene);
    crown.position.copyFrom(streetPosition(offset.x, offset.y, offset.z));
    crown.material = green;
    crown.isPickable = false;
  }
  box(scene, "street-bench-seat", new Vector3(2.2, 0.2, 0.72), streetPosition(-2.1, 0.6, 1.15), wood);
  box(scene, "street-bench-back", new Vector3(2.2, 0.85, 0.16), streetPosition(-2.1, 1.0, 1.48), wood);
  for (const x of [-2.85, -1.35]) {
    box(scene, `street-bench-leg-${x}`, new Vector3(0.15, 0.62, 0.15), streetPosition(x, 0.3, 1.15), dark);
  }
  const streetBenchMaterial = material(scene, "street-bench-hotspot-mat", colors.pink);
  streetBenchMaterial.alpha = 0.025;
  const streetBenchHotspot = box(
    scene,
    "street-bench-hotspot",
    new Vector3(1.9, 0.28, 0.62),
    streetPosition(-2.1, 0.78, 1.12),
    streetBenchMaterial,
  );
  box(scene, "street-mailbox-post", new Vector3(0.12, 1.15, 0.12), streetPosition(-5.1, 0.57, 0.75), wood);
  const streetMailbox = box(
    scene,
    "street-mailbox",
    new Vector3(0.75, 0.52, 0.48),
    streetPosition(-5.1, 1.2, 0.75),
    teal,
  );
  const streetMailboxFlag = box(
    scene,
    "street-mailbox-flag",
    new Vector3(0.08, 0.45, 0.08),
    streetPosition(-4.68, 1.45, 0.75),
    pink,
  );
  streetMailboxFlag.rotation.z = contentState.streetMailboxOpen ? -1.25 : 0;
  streetMailbox.actionManager = new ActionManager(scene);
  streetMailbox.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    contentState.streetMailboxOpen = !contentState.streetMailboxOpen;
    Animation.CreateAndStartAnimation(
      "street-mailbox-flag-toggle",
      streetMailboxFlag,
      "rotation.z",
      30,
      10,
      streetMailboxFlag.rotation.z,
      contentState.streetMailboxOpen ? -1.25 : 0,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
    );
    saveContentState(contentState);
    onAction(
      contentState.streetMailboxOpen
        ? "A cheerful letter says: Have a sunny day!"
        : "The letter is safe in the mailbox.",
      contentState.streetMailboxOpen ? "success" : "toggle",
    );
  }));

  const scooterRoot = new TransformNode("street-scooter", scene);
  scooterRoot.position.copyFrom(streetPosition(1.0, 0, -0.15));
  const scooterDeck = box(scene, "street-scooter-deck", new Vector3(0.95, 0.1, 0.28), new Vector3(0, 0.2, 0), pink, scooterRoot);
  scooterDeck.isPickable = false;
  box(scene, "street-scooter-stem", new Vector3(0.1, 1.1, 0.1), new Vector3(0.36, 0.72, 0), teal, scooterRoot).isPickable = false;
  box(scene, "street-scooter-handle", new Vector3(0.55, 0.08, 0.08), new Vector3(0.36, 1.28, 0), teal, scooterRoot).isPickable = false;
  for (const x of [-0.34, 0.34]) {
    const wheel = MeshBuilder.CreateCylinder(`street-scooter-wheel-${x}`, { diameter: 0.32, height: 0.12, tessellation: 14 }, scene);
    wheel.position.set(x, 0.16, 0);
    wheel.rotation.x = Math.PI / 2;
    wheel.material = dark;
    wheel.parent = scooterRoot;
    wheel.isPickable = false;
  }
  const scooterHotspotMaterial = material(scene, "scooter-hotspot-mat", colors.yellow);
  scooterHotspotMaterial.alpha = 0.025;
  const streetScooterHotspot = box(
    scene,
    "street-scooter-hotspot",
    new Vector3(1.25, 1.5, 0.8),
    streetPosition(1.0, 0.75, -0.15),
    scooterHotspotMaterial,
  );


  const ownedMeshes = scene.meshes.slice(meshStart);
  for (const mesh of ownedMeshes) if (!mesh.parent) mesh.parent = root;
  const seats: SeatSlot[] = [
    {
      id: "street-bench-1",
      kind: "bench",
      room: "street",
      position: streetPosition(-2.48, 0, 1.08),
      approach: streetPosition(-2.48, 0, .54),
      rotationY: 0,
      sleeping: false,
    },
    {
      id: "street-bench-2",
      kind: "bench",
      room: "street",
      position: streetPosition(-1.75, 0, 1.08),
      approach: streetPosition(-1.75, 0, .54),
      rotationY: 0,
      sleeping: false,
    },
  ];
  return {
    id: "street", root,
    interactiveMeshes: ownedMeshes.filter((mesh) => Boolean(mesh.actionManager)),
    seats, placementSlots: [],
    benchHotspot: streetBenchHotspot,
    scooterHotspot: streetScooterHotspot,
    activate: () => undefined,
    deactivate: () => undefined,
    dispose: () => root.dispose(false, false),
  };
}
