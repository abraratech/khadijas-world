import {
  MeshBuilder,
  type Mesh,
  type Scene,
  type StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { box } from "../shared/meshHelpers";

export interface ItemMaterialPalette {
  wood: StandardMaterial;
  dark: StandardMaterial;
  pink: StandardMaterial;
  yellow: StandardMaterial;
  teal: StandardMaterial;
  sky: StandardMaterial;
  white: StandardMaterial;
  green: StandardMaterial;
}

export {
  HOLDABLE_PRESENTATIONS,
  containerCompatibilityIssue,
  presentationFor,
  resolvePresentationForHolder,
} from "./holdablePresentation";
export type {
  HoldablePresentation,
  HoldAnchorKind,
  HolderClass,
  HoldType,
  ResolvedHoldablePresentation,
} from "./holdablePresentation";

export function createProductionTeddy(
  scene: Scene,
  position: Vector3,
  materials: ItemMaterialPalette,
): Mesh {
  const body = MeshBuilder.CreateSphere("draggable-teddy", { diameter: .66, segments: 12 }, scene);
  body.position.copyFrom(position);
  body.scaling.set(.82, 1.02, .72);
  body.material = materials.wood;

  const head = MeshBuilder.CreateSphere("teddy-head", { diameter: .48, segments: 12 }, scene);
  head.position.set(0, .36, 0);
  head.material = materials.wood;
  head.parent = body;
  head.isPickable = false;

  for (const x of [-.17, .17]) {
    const ear = MeshBuilder.CreateSphere(`teddy-ear-${x}`, { diameter: .2, segments: 8 }, scene);
    ear.position.set(x, .55, .01);
    ear.material = materials.wood;
    ear.parent = body;
    ear.isPickable = false;

    const eye = MeshBuilder.CreateSphere(`teddy-eye-${x}`, { diameter: .055, segments: 7 }, scene);
    eye.position.set(x * .55, .39, -.225);
    eye.scaling.z = .4;
    eye.material = materials.dark;
    eye.parent = body;
    eye.isPickable = false;

    const arm = MeshBuilder.CreateCapsule(`teddy-arm-${x}`, { radius: .07, height: .34, tessellation: 8 }, scene);
    arm.position.set(x * 1.35, .03, 0);
    arm.rotation.z = x < 0 ? -.45 : .45;
    arm.material = materials.wood;
    arm.parent = body;
    arm.isPickable = false;

    const leg = MeshBuilder.CreateCapsule(`teddy-leg-${x}`, { radius: .07, height: .22, tessellation: 8 }, scene);
    leg.position.set(x * .75, -.28, 0);
    leg.material = materials.wood;
    leg.parent = body;
    leg.isPickable = false;
  }

  const muzzle = MeshBuilder.CreateSphere("teddy-muzzle", { diameter: .2, segments: 9 }, scene);
  muzzle.position.set(0, .29, -.225);
  muzzle.scaling.set(1.05, .72, .45);
  muzzle.material = materials.white;
  muzzle.parent = body;
  muzzle.isPickable = false;

  const nose = MeshBuilder.CreateSphere("teddy-nose", { diameter: .075, segments: 7 }, scene);
  nose.position.set(0, .32, -.292);
  nose.scaling.z = .45;
  nose.material = materials.dark;
  nose.parent = body;
  nose.isPickable = false;

  const bow = box(
    scene,
    "teddy-bow",
    new Vector3(.26, .1, .06),
    new Vector3(0, .08, -.31),
    materials.pink,
    body,
  );
  bow.isPickable = false;
  return body;
}

export function createProductionBook(
  scene: Scene,
  position: Vector3,
  materials: ItemMaterialPalette,
): Mesh {
  const cover = box(
    scene,
    "draggable-book",
    new Vector3(.88, .12, .64),
    position,
    materials.pink,
  );
  const pages = box(
    scene,
    "book-pages",
    new Vector3(.76, .08, .55),
    new Vector3(0, -.01, 0),
    materials.white,
    cover,
  );
  pages.isPickable = false;
  const spine = box(
    scene,
    "book-spine",
    new Vector3(.08, .15, .65),
    new Vector3(-.4, .01, 0),
    materials.yellow,
    cover,
  );
  spine.isPickable = false;
  const emblem = MeshBuilder.CreateDisc("book-star-emblem", { radius: .12, tessellation: 10 }, scene);
  emblem.position.set(.08, .071, 0);
  emblem.rotation.x = Math.PI / 2;
  emblem.material = materials.yellow;
  emblem.parent = cover;
  emblem.isPickable = false;
  return cover;
}

export function createProductionApple(
  scene: Scene,
  position: Vector3,
  materials: ItemMaterialPalette,
): Mesh {
  const apple = MeshBuilder.CreateSphere("draggable-apple", { diameter: .38, segments: 12 }, scene);
  apple.position.copyFrom(position);
  apple.scaling.set(1, .9, 1);
  apple.material = materials.pink;

  const stem = MeshBuilder.CreateCylinder("apple-stem", { diameter: .045, height: .16, tessellation: 7 }, scene);
  stem.position.set(0, .2, 0);
  stem.rotation.z = .12;
  stem.material = materials.wood;
  stem.parent = apple;
  stem.isPickable = false;

  const leaf = MeshBuilder.CreateSphere("apple-leaf", { diameter: .13, segments: 7 }, scene);
  leaf.scaling.set(1.4, .35, .65);
  leaf.position.set(.08, .23, 0);
  leaf.rotation.z = -.4;
  leaf.material = materials.green;
  leaf.parent = apple;
  leaf.isPickable = false;
  return apple;
}

export function createProductionCup(
  scene: Scene,
  position: Vector3,
  materials: ItemMaterialPalette,
): Mesh {
  const cup = MeshBuilder.CreateCylinder(
    "draggable-cup",
    { diameterTop: .38, diameterBottom: .32, height: .48, tessellation: 16 },
    scene,
  );
  cup.position.copyFrom(position);
  cup.material = materials.sky;

  const handle = MeshBuilder.CreateTorus("cup-handle", { diameter: .32, thickness: .065, tessellation: 16 }, scene);
  handle.position.set(.21, 0, 0);
  handle.rotation.y = Math.PI / 2;
  handle.material = materials.sky;
  handle.parent = cup;
  handle.isPickable = false;

  const rim = MeshBuilder.CreateTorus("cup-rim", { diameter: .37, thickness: .025, tessellation: 18 }, scene);
  rim.position.y = .24;
  rim.material = materials.white;
  rim.parent = cup;
  rim.isPickable = false;

  const drink = MeshBuilder.CreateCylinder("cup-drink", { diameter: .32, height: .018, tessellation: 16 }, scene);
  drink.position.y = .235;
  drink.material = materials.wood;
  drink.parent = cup;
  drink.isPickable = false;
  return cup;
}

export function createProductionPlate(
  scene: Scene,
  name: string,
  position: Vector3,
  materials: ItemMaterialPalette,
): Mesh {
  const plate = MeshBuilder.CreateCylinder(name, { diameter: .74, height: .07, tessellation: 22 }, scene);
  plate.position.copyFrom(position);
  plate.material = materials.white;
  const rim = MeshBuilder.CreateTorus(`${name}-rim`, { diameter: .61, thickness: .035, tessellation: 20 }, scene);
  rim.position.y = .045;
  rim.material = materials.sky;
  rim.parent = plate;
  rim.isPickable = false;
  return plate;
}

export function createProductionBowl(
  scene: Scene,
  name: string,
  position: Vector3,
  materials: ItemMaterialPalette,
): Mesh {
  const bowl = MeshBuilder.CreateCylinder(
    name,
    { diameterTop: .72, diameterBottom: .42, height: .27, tessellation: 20 },
    scene,
  );
  bowl.position.copyFrom(position);
  bowl.material = materials.sky;
  const rim = MeshBuilder.CreateTorus(`${name}-rim`, { diameter: .7, thickness: .035, tessellation: 20 }, scene);
  rim.position.y = .145;
  rim.material = materials.white;
  rim.parent = bowl;
  rim.isPickable = false;
  return bowl;
}

export function createProductionTray(
  scene: Scene,
  position: Vector3,
  materials: ItemMaterialPalette,
): Mesh {
  const tray = box(
    scene,
    "draggable-serving-tray",
    new Vector3(.82, .08, .52),
    position,
    materials.teal,
  );
  for (const [suffix, offset, size] of [
    ["front", new Vector3(0, .08, -.24), new Vector3(.82, .12, .05)],
    ["back", new Vector3(0, .08, .24), new Vector3(.82, .12, .05)],
    ["left", new Vector3(-.39, .08, 0), new Vector3(.05, .12, .46)],
    ["right", new Vector3(.39, .08, 0), new Vector3(.05, .12, .46)],
  ] as const) {
    const rim = box(scene, `serving-tray-rim-${suffix}`, size, offset, materials.white, tray);
    rim.isPickable = false;
  }
  return tray;
}
