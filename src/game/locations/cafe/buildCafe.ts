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
import { box, cylinder } from "../../shared/meshHelpers";
import type { InteractionSound } from "../../world/WorldContext";
import type { LocationBuildResult } from "../../world/LocationBuildResult";

export interface CafeBuild extends LocationBuildResult {
  pastryDisplayHotspot: Mesh;
  seatHotspot: Mesh;
  drinkHotspot: Mesh;
  cupcake: Mesh;
  sandwich: Mesh;
}

export interface CafeContext {
  scene: Scene;
  materials: WorldMaterialRegistry;
  detailMeshes: Mesh[];
  contentState: ContentState;
  position(x: number, y: number, z: number): Vector3;
  onAction(message: string, sound?: InteractionSound): void;
}

export function buildCafe({ scene, materials, detailMeshes, contentState, position: cafePosition, onAction }: CafeContext): CafeBuild {
  const root = new TransformNode("location-cafe-root", scene);
  const meshStart = scene.meshes.length;
  const { floor: floorMat, creamWall, mint, peach, sky, white, glass, cafeBlue, dark, yellow, wood, pink, green } = materials;

  const cafeFloor = box(
    scene,
    "cafe-floor",
    new Vector3(12, 0.18, 8),
    cafePosition(0, -0.1, 0),
    floorMat,
  );
  cafeFloor.metadata = { walkable: true, room: "cafe" satisfies RoomId };
  box(scene, "cafe-back-wall", new Vector3(12, 4.2, 0.2), cafePosition(0, 2, 4), creamWall);
  box(scene, "cafe-left-wall", new Vector3(0.2, 4.2, 8), cafePosition(-6, 2, 0), mint);
  const cafeRug = box(scene, "cafe-rug", new Vector3(4.2, 0.04, 2.6), cafePosition(-2.6, 0.02, -0.5), peach);
  cafeRug.metadata = { walkable: true, room: "cafe" satisfies RoomId };

  box(scene, "cafe-window-view", new Vector3(2.8, 1.75, 0.08), cafePosition(-3.45, 2.55, 3.86), sky);
  box(scene, "cafe-window-frame", new Vector3(3.15, 2.05, 0.12), cafePosition(-3.45, 2.55, 3.74), white);
  box(scene, "cafe-window-glass", new Vector3(2.75, 1.65, 0.04), cafePosition(-3.45, 2.55, 3.66), glass);

  box(scene, "cafe-counter", new Vector3(4.25, 1.15, 1.2), cafePosition(3.4, 0.57, 1.95), mint);
  box(scene, "cafe-counter-top", new Vector3(4.5, 0.16, 1.4), cafePosition(3.4, 1.2, 1.95), white);
  box(scene, "cafe-back-counter", new Vector3(3.7, 0.9, 0.75), cafePosition(3.5, 0.45, 3.35), cafeBlue);
  const cafeMenuBoard = box(
    scene,
    "cafe-menu-board",
    new Vector3(2.3, 1.35, 0.1),
    cafePosition(2.5, 2.65, 3.8),
    dark,
  );
  for (let y = 2.35; y <= 2.95; y += 0.3) {
    const menuLine = box(scene, `cafe-menu-line-${y}`, new Vector3(1.65, 0.055, 0.04), cafePosition(2.5, y, 3.72), white);
    menuLine.isPickable = false;
    detailMeshes.push(menuLine);
  }

  const cafeBell = MeshBuilder.CreateCylinder(
    "cafe-counter-bell",
    { diameterTop: .18, diameterBottom: .42, height: .28, tessellation: 16 },
    scene,
  );
  cafeBell.position.copyFrom(cafePosition(2.05, 1.42, 1.65));
  cafeBell.material = yellow;
  cafeBell.actionManager = new ActionManager(scene);
  cafeBell.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    contentState.cafeBellCount = Math.min(999, contentState.cafeBellCount + 1);
    const startY = cafeBell.position.y;
    Animation.CreateAndStartAnimation(
      "cafe-bell-ring",
      cafeBell,
      "position.y",
      30,
      5,
      startY,
      startY - .09,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
      undefined,
      () => {
        cafeBell.position.y = startY;
      },
    );
    saveContentState(contentState);
    onAction(
      contentState.cafeBellCount % 3 === 0
        ? "Ding ding! The café cheers for our favorite customer!"
        : "Ding! The barista waves hello.",
      "bell",
    );
  }));
  cafeMenuBoard.actionManager = new ActionManager(scene);
  cafeMenuBoard.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    const specials = ["berry cupcakes", "sunshine sandwiches", "warm cocoa"];
    onAction(
      `Today's special is ${specials[contentState.cafeBellCount % specials.length]}!`,
      "tap",
    );
  }));

  // Lightweight pastry case with two playable food props.
  box(scene, "cafe-pastry-base", new Vector3(1.75, 0.75, 1.05), cafePosition(4.7, 0.48, 0.55), wood);
  box(scene, "cafe-pastry-glass", new Vector3(1.75, 1.15, 1.05), cafePosition(4.7, 1.35, 0.55), glass);
  const pastryHotspotMaterial = material(scene, "pastry-hotspot-mat", colors.pink);
  pastryHotspotMaterial.alpha = 0.025;
  const pastryDisplayHotspot = box(
    scene,
    "cafe-pastry-hotspot",
    new Vector3(1.9, 1.7, 1.2),
    cafePosition(4.7, 1.2, 0.55),
    pastryHotspotMaterial,
  );

  const cupcake = MeshBuilder.CreateCylinder(
    "draggable-cupcake",
    { diameterTop: 0.38, diameterBottom: 0.46, height: 0.36, tessellation: 14 },
    scene,
  );
  cupcake.position.copyFrom(cafePosition(4.45, 1.12, 0.48));
  cupcake.material = yellow;
  const frosting = MeshBuilder.CreateSphere("cupcake-frosting", { diameter: 0.48, segments: 10 }, scene);
  frosting.position.set(0, 0.26, 0);
  frosting.scaling.y = 0.75;
  frosting.material = pink;
  frosting.parent = cupcake;
  frosting.isPickable = false;

  const sandwich = box(
    scene,
    "draggable-sandwich",
    new Vector3(0.68, 0.34, 0.55),
    cafePosition(4.95, 1.12, 0.5),
    yellow,
  );
  const sandwichFilling = box(
    scene,
    "sandwich-filling",
    new Vector3(0.62, 0.1, 0.52),
    new Vector3(0, 0, 0),
    green,
    sandwich,
  );
  sandwichFilling.isPickable = false;

  // Café tables and seating.
  for (const [index, x] of [-3.5, -1.1].entries()) {
    cylinder(scene, `cafe-table-${index}`, 1.3, 0.16, cafePosition(x, 0.9, 0.95), wood, 20);
    box(scene, `cafe-table-leg-${index}`, new Vector3(0.16, 0.85, 0.16), cafePosition(x, 0.43, 0.95), white);
    for (const z of [-.35, 1.9]) {
      cylinder(scene, `cafe-chair-seat-${index}-${z}`, 0.68, 0.16, cafePosition(x, 0.55, z), cafeBlue, 18);
      box(scene, `cafe-chair-leg-${index}-${z}`, new Vector3(0.12, 0.55, 0.12), cafePosition(x, 0.28, z), dark);
    }
  }
  const cafeSeatMaterial = material(scene, "cafe-seat-hotspot-mat", colors.pink);
  cafeSeatMaterial.alpha = 0.025;
  const cafeSeatHotspot = box(
    scene,
    "cafe-seat-hotspot",
    new Vector3(0.85, 0.5, 0.85),
    cafePosition(-3.5, 0.72, -.35),
    cafeSeatMaterial,
  );

  // Coffee machine and refill interaction.
  box(scene, "cafe-coffee-machine", new Vector3(1.25, 1.15, 0.75), cafePosition(2.1, 1.85, 3.28), dark);
  box(scene, "cafe-coffee-screen", new Vector3(0.55, 0.32, 0.04), cafePosition(2.1, 2.05, 2.88), sky);
  const drinkHotspotMaterial = material(scene, "drink-hotspot-mat", colors.teal);
  drinkHotspotMaterial.alpha = 0.025;
  const cafeDrinkHotspot = box(
    scene,
    "cafe-drink-hotspot",
    new Vector3(1.4, 1.45, 0.9),
    cafePosition(2.1, 1.75, 3.0),
    drinkHotspotMaterial,
  );

  // Toy corner keeps the café useful for the younger sister too.
  box(scene, "cafe-toy-shelf", new Vector3(1.8, 1.25, 0.72), cafePosition(-4.7, 0.63, 2.85), wood);
  const cafeToyBall = MeshBuilder.CreateSphere("cafe-toy-ball", { diameter: 0.45, segments: 10 }, scene);
  cafeToyBall.position.copyFrom(cafePosition(-4.95, 0.42, 2.48));
  cafeToyBall.material = yellow;
  cafeToyBall.isPickable = false;
  box(scene, "cafe-toy-block", new Vector3(0.45, 0.45, 0.45), cafePosition(-4.35, 0.42, 2.48), pink).isPickable = false;


  const ownedMeshes = scene.meshes.slice(meshStart);
  for (const mesh of ownedMeshes) if (!mesh.parent) mesh.parent = root;
  const seats: SeatSlot[] = [
    {
      id: "cafe-chair-1",
      kind: "cafe-chair",
      room: "cafe",
      position: cafePosition(-3.5, 0, -.35),
      approach: cafePosition(-3.5, 0, -.92),
      rotationY: 0,
      sleeping: false,
    },
    {
      id: "cafe-chair-2",
      kind: "cafe-chair",
      room: "cafe",
      position: cafePosition(-1.1, 0, -.35),
      approach: cafePosition(-1.1, 0, -.92),
      rotationY: 0,
      sleeping: false,
    },
  ];
  return {
    id: "cafe", root,
    interactiveMeshes: ownedMeshes.filter((mesh) => Boolean(mesh.actionManager)),
    seats, placementSlots: [],
    pastryDisplayHotspot,
    seatHotspot: cafeSeatHotspot,
    drinkHotspot: cafeDrinkHotspot,
    cupcake,
    sandwich,
    activate: () => undefined,
    deactivate: () => undefined,
    dispose: () => root.dispose(false, false),
  };
}
