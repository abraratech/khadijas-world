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
import {
  addPlantLeaves,
  addSoftShadow,
  createHomeMaterialPalette,
  roundedFootprint,
  softCushion,
} from "./homeVisualHelpers";

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
    dark, pink, yellow, sky,
  } = materials;
  const home = createHomeMaterialPalette(scene, materials);

  const floor = box(scene, "floor", new Vector3(12, .18, 8), new Vector3(0, -.1, 0), floorMat);
  floor.metadata = { walkable: true, room: "home" satisfies RoomId };
  box(scene, "back-wall", new Vector3(12, 4.2, .2), new Vector3(0, 2, 4), creamWall);
  box(scene, "left-wall", new Vector3(.2, 4.2, 8), new Vector3(-6, 2, 0), lavender);
  box(scene, "kitchen-divider", new Vector3(.1, 3.3, 3.5), new Vector3(1.2, 1.55, 2.25), white);

  // Warm baseboards give the room a finished edge without textures.
  for (const [name, size, position] of [
    ["home-baseboard-back", new Vector3(11.8, .16, .08), new Vector3(0, .08, 3.86)],
    ["home-baseboard-left", new Vector3(.08, .16, 7.75), new Vector3(-5.86, .08, 0)],
  ] as const) {
    const trim = box(scene, name, size, position, home.woodLight);
    trim.isPickable = false;
    detailMeshes.push(trim);
  }

  // Low-cost floor planks provide depth and are disabled on low/adaptive presets.
  for (let z = -3.5; z <= 3.5; z += .5) {
    const plank = box(scene, `floor-plank-${z}`, new Vector3(11.8, .012, .025), new Vector3(0, .003, z), floorLight);
    plank.isPickable = false;
    detailMeshes.push(plank);
  }

  // Window, curtain rod, tiebacks and layered curtains.
  box(scene, "window-view", new Vector3(3.15, 1.75, .08), new Vector3(-3.05, 2.55, 3.86), sky);
  box(scene, "window-frame-top", new Vector3(3.35, .12, .12), new Vector3(-3.05, 3.48, 3.75), white);
  box(scene, "window-frame-bottom", new Vector3(3.35, .12, .12), new Vector3(-3.05, 1.62, 3.75), white);
  box(scene, "window-frame-left", new Vector3(.12, 1.98, .12), new Vector3(-4.72, 2.55, 3.75), white);
  box(scene, "window-frame-right", new Vector3(.12, 1.98, .12), new Vector3(-1.38, 2.55, 3.75), white);
  box(scene, "window-frame-middle", new Vector3(.09, 1.85, .1), new Vector3(-3.05, 2.55, 3.72), white);
  const rod = MeshBuilder.CreateCylinder("curtain-rod", { diameter: .075, height: 3.8, tessellation: 12 }, scene);
  rod.position.set(-3.05, 3.65, 3.58);
  rod.rotation.z = Math.PI / 2;
  rod.material = home.metal;
  rod.isPickable = false;
  detailMeshes.push(rod);
  const curtainLeft = roundedFootprint(
    scene,
    "curtain-left",
    new Vector3(.62, 2.18, .22),
    new Vector3(-4.5, 2.5, 3.55),
    yellow,
    .08,
    root,
  );
  const curtainRight = roundedFootprint(
    scene,
    "curtain-right",
    new Vector3(.62, 2.18, .22),
    new Vector3(-1.6, 2.5, 3.55),
    yellow,
    .08,
    root,
  );
  for (const [name, x] of [["curtain-tie-left", -4.5], ["curtain-tie-right", -1.6]] as const) {
    const tie = MeshBuilder.CreateTorus(name, { diameter: .26, thickness: .04, tessellation: 14 }, scene);
    tie.position.set(x, 2.38, 3.42);
    tie.rotation.x = Math.PI / 2;
    tie.material = pink;
    tie.isPickable = false;
    tie.parent = root;
    detailMeshes.push(tie);
  }
  void curtainLeft;
  void curtainRight;

  // Wall art with a softer inset and simple flower motif.
  roundedFootprint(scene, "art-frame", new Vector3(1.18, .12, 1.32), new Vector3(-5.82, 2.45, 1), home.woodWarm, .12, root).rotation.z = Math.PI / 2;
  box(scene, "art-canvas", new Vector3(.92, 1.02, .08), new Vector3(-5.75, 2.45, 1), home.fabricCoral);
  const artFlower = MeshBuilder.CreateDisc("art-flower", { radius: .25, tessellation: 16 }, scene);
  artFlower.position.set(-5.69, 2.45, .94);
  artFlower.rotation.y = Math.PI / 2;
  artFlower.material = yellow;
  artFlower.isPickable = false;

  // Living-room rug, sofa and furniture shadows.
  const rug = roundedFootprint(scene, "rug", new Vector3(5.15, .04, 3.25), new Vector3(-2.6, .02, -.4), home.fabricTeal, .019, root);
  rug.metadata = { walkable: true, room: "home" satisfies RoomId };
  const rugInset = roundedFootprint(scene, "rug-inset", new Vector3(4.55, .018, 2.65), new Vector3(-2.6, .048, -.4), home.fabricMint, .008, root);
  rugInset.isPickable = false;
  detailMeshes.push(rugInset);
  for (const x of [-3.85, -3.2, -2.55, -1.9, -1.35]) {
    const stripe = box(scene, `rug-stripe-${x}`, new Vector3(.05, .014, 2.15), new Vector3(x, .062, -.4), white);
    stripe.isPickable = false;
    detailMeshes.push(stripe);
  }

  addSoftShadow(scene, "sofa-shadow", new Vector3(-3.25, .015, .38), new Vector3(1.95, 1, .86), home.shadow, detailMeshes, root);
  roundedFootprint(scene, "sofa-seat", new Vector3(3.35, .5, 1.3), new Vector3(-3.25, .53, .35), home.fabricTeal, .23, root);
  roundedFootprint(scene, "sofa-back", new Vector3(3.35, 1.15, .4), new Vector3(-3.25, 1.14, .83), home.fabricTeal, .17, root);
  roundedFootprint(scene, "sofa-arm-l", new Vector3(.44, .9, 1.34), new Vector3(-4.92, .73, .35), home.fabricTeal, .16, root);
  roundedFootprint(scene, "sofa-arm-r", new Vector3(.44, .9, 1.34), new Vector3(-1.58, .73, .35), home.fabricTeal, .16, root);
  for (const x of [-4.18, -3.25, -2.32]) {
    softCushion(scene, `sofa-seat-cushion-${x}`, new Vector3(.43, .18, .51), new Vector3(x, .82, .28), home.fabricMint, root);
  }
  const cushionOne = softCushion(scene, "cushion-one", new Vector3(.37, .31, .13), new Vector3(-4.14, 1.25, .55), yellow, root);
  cushionOne.rotation.z = .13;
  const cushionTwo = softCushion(scene, "cushion-two", new Vector3(.37, .31, .13), new Vector3(-2.25, 1.25, .55), home.fabricCoral, root);
  cushionTwo.rotation.z = -.13;
  for (const x of [-4.72, -1.78]) {
    for (const z of [.02, .66]) {
      const foot = MeshBuilder.CreateCylinder(`sofa-foot-${x}-${z}`, { diameter: .13, height: .16, tessellation: 10 }, scene);
      foot.position.set(x, .18, z);
      foot.material = home.woodWarm;
      foot.parent = root;
      foot.isPickable = false;
      detailMeshes.push(foot);
    }
  }

  addSoftShadow(scene, "coffee-table-shadow", new Vector3(-2.6, .016, -1.8), new Vector3(1.35, 1, .74), home.shadow, detailMeshes, root);
  roundedFootprint(scene, "coffee-table", new Vector3(2.35, .16, 1.3), new Vector3(-2.6, .7, -1.8), home.woodLight, .18, root);
  for (const x of [-3.42, -1.78]) {
    for (const z of [-2.16, -1.44]) {
      const leg = MeshBuilder.CreateCylinder(`table-leg-${x}-${z}`, { diameter: .13, height: .65, tessellation: 10 }, scene);
      leg.position.set(x, .35, z);
      leg.material = home.woodWarm;
      leg.parent = root;
      leg.isPickable = false;
    }
  }

  roundedFootprint(scene, "tv-console", new Vector3(2.3, .58, .62), new Vector3(-4.55, .34, -2.4), home.woodWarm, .12, root);
  box(scene, "tv-console-door-left", new Vector3(.75, .38, .04), new Vector3(-4.95, .35, -2.73), home.woodLight);
  box(scene, "tv-console-door-right", new Vector3(.75, .38, .04), new Vector3(-4.15, .35, -2.73), home.woodLight);
  roundedFootprint(scene, "tv", new Vector3(1.9, 1.18, .13), new Vector3(-4.55, 1.18, -2.65), dark, .08, root);
  const tvScreenMaterial = material(
    scene,
    "tv-screen-material",
    contentState.homeTvOn ? new Color3(.42, .78, .94) : new Color3(.13, .18, .24),
    contentState.homeTvOn ? new Color3(.16, .27, .34) : Color3.Black(),
  );
  const tvScreen = box(scene, "tv-screen", new Vector3(1.62, .92, .03), new Vector3(-4.55, 1.18, -2.73), tvScreenMaterial);
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
  const kitchenFloor = roundedFootprint(scene, "kitchen-floor", new Vector3(4.7, .025, 4), new Vector3(3.65, .012, 2), white, .011, root);
  kitchenFloor.metadata = { walkable: true, room: "home" satisfies RoomId };
  for (let x = 1.55; x <= 5.75; x += .7) {
    const line = box(scene, `tile-line-x-${x}`, new Vector3(.018, .02, 3.75), new Vector3(x, .034, 2), lavender);
    line.isPickable = false;
    detailMeshes.push(line);
  }
  for (let z = .15; z <= 3.65; z += .7) {
    const line = box(scene, `tile-line-z-${z}`, new Vector3(4.45, .02, .018), new Vector3(3.65, .034, z), lavender);
    line.isPickable = false;
    detailMeshes.push(line);
  }

  // Rounded fridge, cabinets and island establish the home production style.
  addSoftShadow(scene, "fridge-shadow", new Vector3(2.3, .015, 2.95), new Vector3(.84, 1, .66), home.shadow, detailMeshes, root);
  roundedFootprint(scene, "fridge", new Vector3(1.48, 2.92, 1.18), new Vector3(2.3, 1.46, 2.95), home.fabricMint, .16, root);
  roundedFootprint(scene, "fridge-top-door", new Vector3(1.24, 1.35, .08), new Vector3(2.3, 2.17, 2.34), mint, .08, root);
  roundedFootprint(scene, "fridge-bottom-door", new Vector3(1.24, 1.24, .08), new Vector3(2.3, .85, 2.34), mint, .08, root);
  box(scene, "fridge-divider", new Vector3(1.16, .04, .03), new Vector3(2.3, 1.48, 2.29), white);
  for (const [name, y] of [["fridge-handle-top", 2.17], ["fridge-handle-bottom", .84]] as const) {
    const handle = MeshBuilder.CreateCylinder(name, { diameter: .07, height: .58, tessellation: 10 }, scene);
    handle.position.set(2.81, y, 2.25);
    handle.material = home.metal;
    handle.parent = root;
  }
  const magnetOne = cylinder(scene, "fridge-magnet-one", .18, .04, new Vector3(1.92, 2.2, 2.25), pink, 12);
  magnetOne.rotation.x = Math.PI / 2;
  const magnetTwo = cylinder(scene, "fridge-magnet-two", .16, .04, new Vector3(2.28, 1.9, 2.25), yellow, 12);
  magnetTwo.rotation.x = Math.PI / 2;

  roundedFootprint(scene, "counter", new Vector3(4.12, 1, 1.12), new Vector3(4.15, .5, 3.2), mint, .12, root);
  roundedFootprint(scene, "counter-top", new Vector3(4.34, .14, 1.3), new Vector3(4.15, 1.07, 3.2), home.ceramic, .12, root);
  box(scene, "backsplash", new Vector3(4.3, .68, .08), new Vector3(4.15, 1.42, 3.77), teal);
  for (const x of [3, 3.75, 4.5, 5.25]) {
    roundedFootprint(scene, `cabinet-door-${x}`, new Vector3(.64, .72, .06), new Vector3(x, .55, 2.62), home.fabricMint, .06, root);
    const knob = MeshBuilder.CreateSphere(`cabinet-knob-${x}`, { diameter: .08, segments: 7 }, scene);
    knob.position.set(x, .61, 2.56);
    knob.material = home.metal;
    knob.parent = root;
  }

  addSoftShadow(scene, "island-shadow", new Vector3(3.5, .015, .6), new Vector3(1.75, 1, .88), home.shadow, detailMeshes, root);
  roundedFootprint(scene, "island", new Vector3(3.15, 1.05, 1.48), new Vector3(3.5, .52, .6), mint, .16, root);
  roundedFootprint(scene, "island-top", new Vector3(3.35, .16, 1.66), new Vector3(3.5, 1.1, .6), home.ceramic, .16, root);
  for (const x of [2.72, 3.5, 4.28]) {
    roundedFootprint(scene, `island-panel-${x}`, new Vector3(.62, .65, .05), new Vector3(x, .55, -.16), home.fabricMint, .05, root);
  }

  const sink = MeshBuilder.CreateCylinder("sink", { diameter: .75, height: .07, tessellation: 20 }, scene);
  sink.position.set(4, 1.17, 3.18);
  sink.material = home.metal;
  const faucet = MeshBuilder.CreateTorus("faucet", { diameter: .46, thickness: .07, tessellation: 18 }, scene);
  faucet.position.set(4, 1.48, 3.44);
  faucet.rotation.x = Math.PI / 2;
  faucet.material = home.metal;

  for (const x of [2.65, 3.5, 4.35]) {
    cylinder(scene, `stool-${x}`, .54, .15, new Vector3(x, .68, -.65), home.woodLight, 18);
    const leg = MeshBuilder.CreateCylinder(`stool-leg-${x}`, { diameter: .13, height: .62, tessellation: 10 }, scene);
    leg.position.set(x, .32, -.65);
    leg.material = home.metal;
    leg.parent = root;
  }

  // Cupboard with a pivoted interactive door.
  const cupboard = new TransformNode("cupboard", scene);
  cupboard.position.set(4.85, 1.9, 3.65);
  cupboard.parent = root;
  roundedFootprint(scene, "cupboard-body", new Vector3(1.78, 1.58, .52), Vector3.Zero(), home.woodWarm, .09, cupboard);
  box(scene, "cupboard-shelf", new Vector3(1.55, .07, .46), new Vector3(0, 0, -.28), white, cupboard);
  for (const x of [-.46, 0, .46]) {
    const jar = MeshBuilder.CreateCylinder(`jar-${x}`, { diameter: .25, height: .38, tessellation: 12 }, scene);
    jar.position.set(x, .33, -.34);
    jar.material = x === 0 ? yellow : pink;
    jar.parent = cupboard;
    jar.isPickable = false;
    const lid = MeshBuilder.CreateCylinder(`jar-lid-${x}`, { diameter: .27, height: .05, tessellation: 12 }, scene);
    lid.position.set(x, .545, -.34);
    lid.material = home.metal;
    lid.parent = cupboard;
    lid.isPickable = false;
  }

  const doorPivot = new TransformNode("cupboard-door-pivot", scene);
  doorPivot.parent = cupboard;
  doorPivot.position.set(-.88, 0, -.29);
  const cupboardDoor = box(
    scene,
    "cupboard-door",
    new Vector3(.87, 1.45, .08),
    new Vector3(.435, 0, 0),
    mint,
    doorPivot,
  );
  const cupboardKnob = MeshBuilder.CreateSphere("cupboard-door-knob", { diameter: .1, segments: 8 }, scene);
  cupboardKnob.position.set(.75, 0, -.08);
  cupboardKnob.material = home.metal;
  cupboardKnob.parent = doorPivot;
  cupboardKnob.isPickable = false;

  // A finished corner plant adds an organic silhouette without an external asset.
  const plantPot = MeshBuilder.CreateCylinder(
    "home-corner-plant-pot",
    { diameterTop: .52, diameterBottom: .38, height: .48, tessellation: 14 },
    scene,
  );
  plantPot.position.set(-5.18, .24, 2.82);
  plantPot.material = home.fabricCoral;
  plantPot.parent = root;
  plantPot.isPickable = false;
  addPlantLeaves(scene, "home-corner-plant", new Vector3(-5.18, .62, 2.82), home.leaf, root);

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
