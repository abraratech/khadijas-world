import {
  ActionManager,
  Color3,
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
import { createMaterial as material, type WorldMaterialRegistry } from "../../shared/createMaterials";
import { box, cylinder } from "../../shared/meshHelpers";
import type { InteractionSound } from "../../world/WorldContext";
import type { LocationBuildResult } from "../../world/LocationBuildResult";

export interface FamilyHomeBuild extends LocationBuildResult {
  doorPivot: TransformNode;
  cupboardDoor: Mesh;
}

export interface FamilyHomeContext {
  scene: Scene;
  materials: WorldMaterialRegistry;
  detailMeshes: Mesh[];
  contentState: ContentState;
  onAction(message: string, sound?: InteractionSound): void;
}

export function buildFamilyHome({
  scene,
  materials,
  detailMeshes,
  contentState,
  onAction,
}: FamilyHomeContext): FamilyHomeBuild {
  const root = new TransformNode("location-home-root", scene);
  const meshStart = scene.meshes.length;
  const {
    floor: floorMat, floorLight, lavender, creamWall, white, teal, mint,
    wood, dark, pink, yellow, sky,
  } = materials;

  const floor = box(scene, "floor", new Vector3(12, 0.18, 8), new Vector3(0, -0.1, 0), floorMat);
  floor.metadata = { walkable: true, room: "home" satisfies RoomId };
  box(scene, "back-wall", new Vector3(12, 4.2, 0.2), new Vector3(0, 2.0, 4), creamWall);
  box(scene, "left-wall", new Vector3(0.2, 4.2, 8), new Vector3(-6, 2.0, 0), lavender);
  box(scene, "kitchen-divider", new Vector3(0.1, 3.3, 3.5), new Vector3(1.2, 1.55, 2.25), white);

  // Low-cost floor planks provide visual depth and are disabled on low/adaptive presets.
  for (let z = -3.5; z <= 3.5; z += 0.5) {
    const plank = box(scene, `floor-plank-${z}`, new Vector3(11.8, 0.012, 0.025), new Vector3(0, 0.003, z), floorLight);
    plank.isPickable = false;
    detailMeshes.push(plank);
  }

  // Window and curtains.
  box(scene, "window-view", new Vector3(3.15, 1.75, 0.08), new Vector3(-3.05, 2.55, 3.86), sky);
  box(scene, "window-frame-top", new Vector3(3.35, 0.12, 0.12), new Vector3(-3.05, 3.48, 3.75), white);
  box(scene, "window-frame-bottom", new Vector3(3.35, 0.12, 0.12), new Vector3(-3.05, 1.62, 3.75), white);
  box(scene, "window-frame-left", new Vector3(0.12, 1.98, 0.12), new Vector3(-4.72, 2.55, 3.75), white);
  box(scene, "window-frame-right", new Vector3(0.12, 1.98, 0.12), new Vector3(-1.38, 2.55, 3.75), white);
  box(scene, "window-frame-middle", new Vector3(0.09, 1.85, 0.1), new Vector3(-3.05, 2.55, 3.72), white);
  const curtainLeft = box(scene, "curtain-left", new Vector3(0.48, 2.15, 0.2), new Vector3(-4.58, 2.52, 3.55), yellow);
  const curtainRight = box(scene, "curtain-right", new Vector3(0.48, 2.15, 0.2), new Vector3(-1.52, 2.52, 3.55), yellow);
  curtainLeft.scaling.x = 0.75;
  curtainRight.scaling.x = 0.75;

  // Wall art.
  box(scene, "art-frame", new Vector3(1.15, 1.25, 0.12), new Vector3(-5.83, 2.45, 1.0), wood);
  box(scene, "art-canvas", new Vector3(0.92, 1.02, 0.08), new Vector3(-5.75, 2.45, 1.0), pink);
  const artFlower = MeshBuilder.CreateDisc("art-flower", { radius: 0.25, tessellation: 16 }, scene);
  artFlower.position.set(-5.69, 2.45, 0.94);
  artFlower.rotation.y = Math.PI / 2;
  artFlower.material = yellow;
  artFlower.isPickable = false;

  // Living-room rug and sofa.
  const rug = box(scene, "rug", new Vector3(5.1, 0.04, 3.2), new Vector3(-2.6, 0.02, -0.4), teal);
  rug.metadata = { walkable: true, room: "home" satisfies RoomId };
  const rugInset = box(scene, "rug-inset", new Vector3(4.5, 0.018, 2.62), new Vector3(-2.6, 0.045, -0.4), mint);
  rugInset.isPickable = false;
  detailMeshes.push(rugInset);

  box(scene, "sofa-seat", new Vector3(3.25, 0.52, 1.25), new Vector3(-3.25, 0.53, 0.35), teal);
  box(scene, "sofa-back", new Vector3(3.25, 1.2, 0.38), new Vector3(-3.25, 1.12, 0.86), teal);
  box(scene, "sofa-arm-l", new Vector3(0.38, 0.92, 1.3), new Vector3(-4.88, 0.72, 0.35), teal);
  box(scene, "sofa-arm-r", new Vector3(0.38, 0.92, 1.3), new Vector3(-1.62, 0.72, 0.35), teal);
  const cushionOne = box(scene, "cushion-one", new Vector3(0.72, 0.58, 0.22), new Vector3(-4.15, 1.12, 0.54), yellow);
  cushionOne.rotation.z = 0.08;
  const cushionTwo = box(scene, "cushion-two", new Vector3(0.72, 0.58, 0.22), new Vector3(-2.25, 1.12, 0.54), pink);
  cushionTwo.rotation.z = -0.08;
  box(scene, "coffee-table", new Vector3(2.3, 0.15, 1.25), new Vector3(-2.6, 0.68, -1.8), wood);
  for (const x of [-3.45, -1.75]) {
    for (const z of [-2.2, -1.4]) {
      box(scene, `table-leg-${x}-${z}`, new Vector3(0.12, 0.65, 0.12), new Vector3(x, 0.34, z), white);
    }
  }
  box(scene, "tv-console", new Vector3(2.25, 0.58, 0.58), new Vector3(-4.55, 0.32, -2.4), wood);
  box(scene, "tv", new Vector3(1.85, 1.15, 0.12), new Vector3(-4.55, 1.16, -2.65), dark);
  const tvScreenMaterial = material(
    scene,
    "tv-screen-material",
    contentState.homeTvOn ? new Color3(.42, .78, .94) : new Color3(.13, .18, .24),
    contentState.homeTvOn ? new Color3(.16, .27, .34) : Color3.Black(),
  );
  const tvScreen = box(
    scene,
    "tv-screen",
    new Vector3(1.62, 0.92, 0.03),
    new Vector3(-4.55, 1.16, -2.73),
    tvScreenMaterial,
  );
  tvScreen.actionManager = new ActionManager(scene);
  tvScreen.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    contentState.homeTvOn = !contentState.homeTvOn;
    tvScreenMaterial.diffuseColor = contentState.homeTvOn
      ? new Color3(.42, .78, .94)
      : new Color3(.13, .18, .24);
    tvScreenMaterial.emissiveColor = contentState.homeTvOn
      ? new Color3(.16, .27, .34)
      : Color3.Black();
    saveContentState(contentState);
    onAction(
      contentState.homeTvOn ? "Story time is starting on TV!" : "The TV is tucked in for now.",
      "toggle",
    );
  }));

  // Kitchen floor zone.
  const kitchenFloor = box(scene, "kitchen-floor", new Vector3(4.65, 0.025, 3.95), new Vector3(3.65, 0.012, 2), white);
  kitchenFloor.metadata = { walkable: true, room: "home" satisfies RoomId };
  for (let x = 1.55; x <= 5.75; x += 0.7) {
    const line = box(scene, `tile-line-x-${x}`, new Vector3(0.018, 0.02, 3.8), new Vector3(x, 0.034, 2), lavender);
    line.isPickable = false;
    detailMeshes.push(line);
  }
  for (let z = 0.15; z <= 3.65; z += 0.7) {
    const line = box(scene, `tile-line-z-${z}`, new Vector3(4.5, 0.02, 0.018), new Vector3(3.65, 0.034, z), lavender);
    line.isPickable = false;
    detailMeshes.push(line);
  }

  // Kitchen cabinets, fridge and island.
  box(scene, "fridge", new Vector3(1.45, 2.9, 1.15), new Vector3(2.3, 1.43, 2.95), mint);
  box(scene, "fridge-divider", new Vector3(1.28, 0.05, 0.03), new Vector3(2.3, 1.35, 2.36), white);
  box(scene, "fridge-handle-top", new Vector3(0.08, 0.62, 0.08), new Vector3(2.82, 2.15, 2.34), white);
  box(scene, "fridge-handle-bottom", new Vector3(0.08, 0.62, 0.08), new Vector3(2.82, 0.72, 2.34), white);
  const magnetOne = cylinder(scene, "fridge-magnet-one", 0.18, 0.04, new Vector3(1.92, 2.2, 2.35), pink, 12);
  magnetOne.rotation.x = Math.PI / 2;
  const magnetTwo = cylinder(scene, "fridge-magnet-two", 0.16, 0.04, new Vector3(2.28, 1.9, 2.35), yellow, 12);
  magnetTwo.rotation.x = Math.PI / 2;

  box(scene, "counter", new Vector3(4.1, 1.0, 1.1), new Vector3(4.15, 0.5, 3.2), mint);
  box(scene, "counter-top", new Vector3(4.3, 0.14, 1.28), new Vector3(4.15, 1.07, 3.2), white);
  box(scene, "backsplash", new Vector3(4.3, 0.68, 0.08), new Vector3(4.15, 1.42, 3.77), teal);
  for (const x of [3.0, 3.75, 4.5, 5.25]) {
    box(scene, `cabinet-door-${x}`, new Vector3(0.63, 0.72, 0.04), new Vector3(x, 0.55, 2.62), mint);
    box(scene, `cabinet-handle-${x}`, new Vector3(0.22, 0.05, 0.06), new Vector3(x, 0.62, 2.57), dark);
  }
  box(scene, "island", new Vector3(3.1, 1.05, 1.45), new Vector3(3.5, 0.52, 0.6), mint);
  box(scene, "island-top", new Vector3(3.3, 0.16, 1.62), new Vector3(3.5, 1.1, 0.6), white);

  const sink = MeshBuilder.CreateCylinder("sink", { diameter: 0.75, height: 0.07, tessellation: 20 }, scene);
  sink.position.set(4.0, 1.17, 3.18);
  sink.material = dark;
  const faucet = MeshBuilder.CreateTorus("faucet", { diameter: 0.46, thickness: 0.07, tessellation: 18 }, scene);
  faucet.position.set(4.0, 1.48, 3.44);
  faucet.rotation.x = Math.PI / 2;
  faucet.material = white;

  for (const x of [2.65, 3.5, 4.35]) {
    cylinder(scene, `stool-${x}`, 0.52, 0.14, new Vector3(x, 0.68, -0.65), wood, 18);
    box(scene, `stool-leg-${x}`, new Vector3(0.12, 0.62, 0.12), new Vector3(x, 0.32, -0.65), mint);
  }

  // Cupboard with a pivoted interactive door.
  const cupboard = new TransformNode("cupboard", scene);
  cupboard.position.set(4.85, 1.9, 3.65);
  box(scene, "cupboard-body", new Vector3(1.75, 1.55, 0.5), Vector3.Zero(), wood, cupboard);
  box(scene, "cupboard-shelf", new Vector3(1.55, 0.07, 0.46), new Vector3(0, 0, -0.28), white, cupboard);
  for (const x of [-0.46, 0, 0.46]) {
    const jar = MeshBuilder.CreateCylinder(`jar-${x}`, { diameter: 0.25, height: 0.38, tessellation: 12 }, scene);
    jar.position.set(x, 0.33, -0.34);
    jar.material = x === 0 ? yellow : pink;
    jar.parent = cupboard;
    jar.isPickable = false;
  }

  const doorPivot = new TransformNode("cupboard-door-pivot", scene);
  doorPivot.parent = cupboard;
  doorPivot.position.set(-0.88, 0, -0.29);
  const cupboardDoor = box(
    scene,
    "cupboard-door",
    new Vector3(0.87, 1.45, 0.08),
    new Vector3(0.435, 0, 0),
    mint,
    doorPivot,
  );

  const ownedMeshes = scene.meshes.slice(meshStart);
  for (const mesh of ownedMeshes) if (!mesh.parent) mesh.parent = root;
  const seats: SeatSlot[] = [
    {
      id: "home-sofa-1",
      kind: "sofa",
      room: "home",
      position: new Vector3(-3.75, 0, .05),
      approach: new Vector3(-3.75, 0, -.48),
      rotationY: 0,
      sleeping: false,
    },
    {
      id: "home-sofa-2",
      kind: "sofa",
      room: "home",
      position: new Vector3(-2.72, 0, .05),
      approach: new Vector3(-2.72, 0, -.48),
      rotationY: 0,
      sleeping: false,
    },
  ];
  return {
    id: "home",
    root,
    interactiveMeshes: ownedMeshes.filter((mesh) => Boolean(mesh.actionManager)),
    seats,
    placementSlots: [],
    doorPivot,
    cupboardDoor,
    activate: () => undefined,
    deactivate: () => undefined,
    dispose: () => root.dispose(false, false),
  };
}
