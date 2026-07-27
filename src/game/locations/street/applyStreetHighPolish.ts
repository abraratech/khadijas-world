import {
  Color3,
  Mesh,
  MeshBuilder,
  type Scene,
  type StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { createMaterial } from "../../shared/createMaterials";
import { roundedFootprint } from "../familyHome/homeVisualHelpers";

interface StreetPalette {
  plasterPink: StandardMaterial;
  plasterGold: StandardMaterial;
  trim: StandardMaterial;
  coral: StandardMaterial;
  blush: StandardMaterial;
  teal: StandardMaterial;
  mint: StandardMaterial;
  cafeBlue: StandardMaterial;
  mustard: StandardMaterial;
  navy: StandardMaterial;
  brick: StandardMaterial;
  stone: StandardMaterial;
  paving: StandardMaterial;
  road: StandardMaterial;
  wood: StandardMaterial;
  woodLight: StandardMaterial;
  leaf: StandardMaterial;
  leafLight: StandardMaterial;
  flowerPurple: StandardMaterial;
  flowerWhite: StandardMaterial;
  metal: StandardMaterial;
  glass: StandardMaterial;
  glow: StandardMaterial;
  shadow: StandardMaterial;
}

function translucent(
  scene: Scene,
  name: string,
  diffuse: Color3,
  alpha: number,
  emissive?: Color3,
): StandardMaterial {
  const result = createMaterial(scene, name, diffuse, emissive, "soft-toy");
  result.alpha = alpha;
  result.backFaceCulling = false;
  return result;
}

function createPalette(scene: Scene): StreetPalette {
  const shadow = createMaterial(scene, "art1j-street-shadow", new Color3(.04, .035, .05), undefined, "shadow");
  shadow.alpha = .13;
  return {
    plasterPink: createMaterial(scene, "art1j-street-plaster-pink", new Color3(.88, .58, .62), undefined, "matte"),
    plasterGold: createMaterial(scene, "art1j-street-plaster-gold", new Color3(.88, .68, .42), undefined, "matte"),
    trim: createMaterial(scene, "art1j-street-trim", new Color3(.99, .96, .88), undefined, "ceramic"),
    coral: createMaterial(scene, "art1j-street-coral", new Color3(.91, .37, .47), undefined, "soft-toy"),
    blush: createMaterial(scene, "art1j-street-blush", new Color3(.96, .62, .70), undefined, "fabric"),
    teal: createMaterial(scene, "art1j-street-teal", new Color3(.11, .50, .50), undefined, "soft-toy"),
    mint: createMaterial(scene, "art1j-street-mint", new Color3(.52, .76, .66), undefined, "soft-toy"),
    cafeBlue: createMaterial(scene, "art1j-street-cafe-blue", new Color3(.18, .49, .66), undefined, "fabric"),
    mustard: createMaterial(scene, "art1j-street-mustard", new Color3(.95, .68, .18), undefined, "soft-toy"),
    navy: createMaterial(scene, "art1j-street-navy", new Color3(.09, .15, .24), undefined, "soft-toy"),
    brick: createMaterial(scene, "art1j-street-brick", new Color3(.64, .31, .20), undefined, "matte"),
    stone: createMaterial(scene, "art1j-street-stone", new Color3(.67, .62, .55), undefined, "matte"),
    paving: createMaterial(scene, "art1j-street-paving", new Color3(.77, .71, .62), undefined, "matte"),
    road: createMaterial(scene, "art1j-street-road", new Color3(.25, .28, .31), undefined, "matte"),
    wood: createMaterial(scene, "art1j-street-wood", new Color3(.43, .24, .13), undefined, "wood"),
    woodLight: createMaterial(scene, "art1j-street-wood-light", new Color3(.72, .48, .26), undefined, "wood"),
    leaf: createMaterial(scene, "art1j-street-leaf", new Color3(.18, .45, .25), undefined, "soft-toy"),
    leafLight: createMaterial(scene, "art1j-street-leaf-light", new Color3(.44, .67, .32), undefined, "soft-toy"),
    flowerPurple: createMaterial(scene, "art1j-street-flower-purple", new Color3(.62, .34, .73), undefined, "soft-toy"),
    flowerWhite: createMaterial(scene, "art1j-street-flower-white", new Color3(.98, .95, .89), undefined, "ceramic"),
    metal: createMaterial(scene, "art1j-street-metal", new Color3(.52, .59, .60), undefined, "metal"),
    glass: translucent(scene, "art1j-street-glass", new Color3(.54, .81, .91), .31, new Color3(.02, .05, .065)),
    glow: translucent(scene, "art1j-street-glow", new Color3(1, .78, .36), .68, new Color3(.20, .10, .02)),
    shadow,
  };
}

function decorate(mesh: Mesh, root: TransformNode, details: Mesh[]): Mesh {
  mesh.parent = root;
  mesh.isPickable = false;
  mesh.receiveShadows = true;
  mesh.metadata = {
    ...mesh.metadata,
    decorativeDetail: true,
    qualityTier: "high",
    artPass: "art1j-street",
  };
  details.push(mesh);
  return mesh;
}

function box(
  scene: Scene,
  name: string,
  size: Vector3,
  position: Vector3,
  material: StandardMaterial,
  root: TransformNode,
  details: Mesh[],
): Mesh {
  const mesh = MeshBuilder.CreateBox(name, { width: size.x, height: size.y, depth: size.z }, scene);
  mesh.position.copyFrom(position);
  mesh.material = material;
  return decorate(mesh, root, details);
}

function rounded(
  scene: Scene,
  name: string,
  size: Vector3,
  position: Vector3,
  radius: number,
  material: StandardMaterial,
  root: TransformNode,
  details: Mesh[],
): Mesh {
  const mesh = roundedFootprint(scene, name, size, position, material, radius, root);
  return decorate(mesh, root, details);
}

function sphere(
  scene: Scene,
  name: string,
  diameter: number,
  position: Vector3,
  scaling: Vector3,
  material: StandardMaterial,
  root: TransformNode,
  details: Mesh[],
  segments = 12,
): Mesh {
  const mesh = MeshBuilder.CreateSphere(name, { diameter, segments }, scene);
  mesh.position.copyFrom(position);
  mesh.scaling.copyFrom(scaling);
  mesh.material = material;
  return decorate(mesh, root, details);
}

function cylinder(
  scene: Scene,
  name: string,
  diameter: number,
  height: number,
  position: Vector3,
  material: StandardMaterial,
  root: TransformNode,
  details: Mesh[],
  tessellation = 16,
): Mesh {
  const mesh = MeshBuilder.CreateCylinder(name, { diameter, height, tessellation }, scene);
  mesh.position.copyFrom(position);
  mesh.material = material;
  return decorate(mesh, root, details);
}

function torus(
  scene: Scene,
  name: string,
  diameter: number,
  thickness: number,
  position: Vector3,
  material: StandardMaterial,
  root: TransformNode,
  details: Mesh[],
): Mesh {
  const mesh = MeshBuilder.CreateTorus(name, { diameter, thickness, tessellation: 24 }, scene);
  mesh.position.copyFrom(position);
  mesh.material = material;
  return decorate(mesh, root, details);
}

function contactShadow(
  scene: Scene,
  name: string,
  position: Vector3,
  scaleX: number,
  scaleZ: number,
  palette: StreetPalette,
  root: TransformNode,
  details: Mesh[],
): void {
  const shadow = MeshBuilder.CreateDisc(name, { radius: 1, tessellation: 28 }, scene);
  shadow.rotation.x = Math.PI / 2;
  shadow.position.copyFrom(position);
  shadow.scaling.set(scaleX, scaleZ, 1);
  shadow.material = palette.shadow;
  decorate(shadow, root, details);
}

function addWindowBox(
  scene: Scene,
  name: string,
  center: Vector3,
  palette: StreetPalette,
  root: TransformNode,
  details: Mesh[],
  movingFlowers: Mesh[],
): void {
  rounded(scene, `${name}-box`, new Vector3(1.42, .30, .42), center, .08, palette.wood, root, details);
  box(scene, `${name}-lip`, new Vector3(1.52, .08, .49), new Vector3(center.x, center.y + .16, center.z - .02), palette.woodLight, root, details);
  for (let index = 0; index < 7; index += 1) {
    const x = center.x - .54 + index * .18;
    cylinder(scene, `${name}-stem-${index}`, .025, .30, new Vector3(x, center.y + .36, center.z - .08), palette.leaf, root, details, 6);
    const flower = sphere(
      scene,
      `${name}-flower-${index}`,
      .19,
      new Vector3(x, center.y + .54 + (index % 2) * .05, center.z - .08),
      new Vector3(1, .72, .88),
      [palette.coral, palette.mustard, palette.flowerPurple, palette.flowerWhite][index % 4],
      root,
      details,
      9,
    );
    movingFlowers.push(flower);
  }
}

function addFacadeArchitecture(
  scene: Scene,
  offsetX: number,
  palette: StreetPalette,
  root: TransformNode,
  details: Mesh[],
  movingFlowers: Mesh[],
  awningPieces: Mesh[],
): void {
  // House shell: moulded base, cornice, framed door, bay-style window and planters.
  box(scene, "art1j-street-house-base", new Vector3(4.25, .48, .18), new Vector3(offsetX - 3.55, .28, 3.28), palette.stone, root, details);
  box(scene, "art1j-street-house-cornice", new Vector3(4.62, .24, .54), new Vector3(offsetX - 3.55, 3.38, 3.28), palette.trim, root, details);
  for (const x of [-5.28, -1.82]) {
    box(scene, `art1j-street-house-quoin-${x}`, new Vector3(.30, 3.00, .22), new Vector3(offsetX + x, 1.78, 3.24), palette.trim, root, details);
    for (let y = .48; y <= 3.00; y += .42) {
      box(scene, `art1j-street-house-quoin-block-${x}-${y}`, new Vector3(.36, .08, .26), new Vector3(offsetX + x, y, 3.17), palette.stone, root, details);
    }
  }

  rounded(scene, "art1j-street-house-door-surround", new Vector3(1.62, 2.92, .14), new Vector3(offsetX - 3.35, 1.46, 3.16), .12, palette.trim, root, details);
  rounded(scene, "art1j-street-house-door-inset", new Vector3(1.30, 2.56, .06), new Vector3(offsetX - 3.35, 1.28, 3.04), .10, palette.teal, root, details);
  rounded(scene, "art1j-street-house-door-window", new Vector3(.70, .72, .025), new Vector3(offsetX - 3.35, 1.84, 3.00), .18, palette.glass, root, details);
  sphere(scene, "art1j-street-house-door-knob", .12, new Vector3(offsetX - 2.86, 1.18, 2.98), Vector3.One(), palette.mustard, root, details, 10);
  rounded(scene, "art1j-street-house-step-top", new Vector3(1.74, .18, .72), new Vector3(offsetX - 3.35, .11, 2.87), .06, palette.paving, root, details);

  rounded(scene, "art1j-street-house-window-frame", new Vector3(1.82, 1.58, .15), new Vector3(offsetX - 4.55, 2.03, 3.15), .13, palette.trim, root, details);
  rounded(scene, "art1j-street-house-window-glass", new Vector3(1.54, 1.30, .035), new Vector3(offsetX - 4.55, 2.03, 3.04), .09, palette.glass, root, details);
  box(scene, "art1j-street-house-window-mullion-v", new Vector3(.07, 1.18, .04), new Vector3(offsetX - 4.55, 2.03, 2.99), palette.trim, root, details);
  box(scene, "art1j-street-house-window-mullion-h", new Vector3(1.42, .07, .04), new Vector3(offsetX - 4.55, 2.03, 2.99), palette.trim, root, details);
  addWindowBox(scene, "art1j-street-house-window-box", new Vector3(offsetX - 4.55, 1.31, 3.02), palette, root, details, movingFlowers);

  // Café shell: tiled plinth, moulded cornice, branded sign, deep window and awning.
  box(scene, "art1j-street-cafe-plinth", new Vector3(4.25, .58, .20), new Vector3(offsetX + 3.55, .32, 3.28), palette.teal, root, details);
  for (let x = 1.55; x <= 5.55; x += .40) {
    box(scene, `art1j-street-cafe-plinth-tile-${x}`, new Vector3(.025, .48, .025), new Vector3(offsetX + x, .34, 3.15), palette.mint, root, details);
  }
  box(scene, "art1j-street-cafe-cornice", new Vector3(4.62, .24, .58), new Vector3(offsetX + 3.55, 3.38, 3.27), palette.woodLight, root, details);
  rounded(scene, "art1j-street-cafe-sign", new Vector3(2.65, .66, .14), new Vector3(offsetX + 3.55, 3.22, 3.00), .12, palette.wood, root, details);
  rounded(scene, "art1j-street-cafe-sign-inner", new Vector3(2.40, .46, .025), new Vector3(offsetX + 3.55, 3.22, 2.91), .08, palette.mustard, root, details);
  torus(scene, "art1j-street-cafe-sign-cup", .28, .045, new Vector3(offsetX + 2.83, 3.22, 2.87), palette.trim, root, details).rotation.y = Math.PI / 2;
  cylinder(scene, "art1j-street-cafe-sign-cup-body", .25, .13, new Vector3(offsetX + 2.70, 3.22, 2.87), palette.trim, root, details, 18).rotation.z = Math.PI / 2;
  for (const [index, width] of [1.12, .82].entries()) {
    box(scene, `art1j-street-cafe-sign-line-${index}`, new Vector3(width, .055, .024), new Vector3(offsetX + 3.95, 3.31 - index * .18, 2.86), palette.trim, root, details);
  }

  rounded(scene, "art1j-street-cafe-door-surround", new Vector3(1.60, 2.90, .14), new Vector3(offsetX + 3.45, 1.45, 3.15), .12, palette.woodLight, root, details);
  rounded(scene, "art1j-street-cafe-door-inset", new Vector3(1.30, 2.56, .06), new Vector3(offsetX + 3.45, 1.28, 3.04), .10, palette.wood, root, details);
  rounded(scene, "art1j-street-cafe-door-glass", new Vector3(.76, 1.18, .025), new Vector3(offsetX + 3.45, 1.66, 3.00), .12, palette.glass, root, details);
  sphere(scene, "art1j-street-cafe-door-knob", .12, new Vector3(offsetX + 2.97, 1.14, 2.98), Vector3.One(), palette.mustard, root, details, 10);

  rounded(scene, "art1j-street-cafe-window-frame", new Vector3(1.92, 1.54, .15), new Vector3(offsetX + 4.55, 1.88, 3.15), .12, palette.trim, root, details);
  rounded(scene, "art1j-street-cafe-window-glass", new Vector3(1.65, 1.28, .035), new Vector3(offsetX + 4.55, 1.88, 3.04), .09, palette.glass, root, details);
  box(scene, "art1j-street-cafe-window-sill", new Vector3(2.02, .14, .44), new Vector3(offsetX + 4.55, 1.18, 2.96), palette.trim, root, details);
  for (const [index, x] of [3.80, 4.55, 5.30].entries()) {
    cylinder(scene, `art1j-street-cafe-window-pot-${index}`, .28, .25, new Vector3(offsetX + x, 1.42, 2.92), [palette.coral, palette.teal, palette.mustard][index], root, details, 14);
    const leaf = sphere(scene, `art1j-street-cafe-window-plant-${index}`, .34, new Vector3(offsetX + x, 1.72, 2.91), new Vector3(.58, 1.22, .45), index % 2 ? palette.leafLight : palette.leaf, root, details, 10);
    movingFlowers.push(leaf);
  }

  box(scene, "art1j-street-cafe-awning-bar", new Vector3(4.25, .13, .72), new Vector3(offsetX + 3.55, 2.88, 2.82), palette.navy, root, details);
  for (let index = 0; index < 10; index += 1) {
    const x = offsetX + 1.73 + index * .40;
    const panel = rounded(
      scene,
      `art1j-street-cafe-awning-panel-${index}`,
      new Vector3(.42, .52, .76),
      new Vector3(x, 2.67, 2.77),
      .12,
      index % 2 ? palette.trim : palette.cafeBlue,
      root,
      details,
    );
    panel.rotation.x = -.18;
    awningPieces.push(panel);
  }
}

function addStreetSurface(
  scene: Scene,
  offsetX: number,
  palette: StreetPalette,
  root: TransformNode,
  details: Mesh[],
): void {
  // Layered curb and pavers add scale without changing the walkable surfaces.
  box(scene, "art1j-street-curb-front", new Vector3(11.72, .15, .20), new Vector3(offsetX, .11, -.55), palette.stone, root, details);
  box(scene, "art1j-street-curb-back", new Vector3(11.72, .15, .20), new Vector3(offsetX, .11, .83), palette.stone, root, details);
  for (let index = 0; index < 17; index += 1) {
    const x = offsetX - 5.55 + index * .70;
    const paver = rounded(scene, `art1j-street-paver-${index}`, new Vector3(.62, .035, .48), new Vector3(x, .112, .16 + (index % 2) * .05), .06, palette.paving, root, details);
    paver.rotation.y = (index % 3 - 1) * .025;
  }
  for (let index = 0; index < 12; index += 1) {
    const x = offsetX - 5.25 + index * .95;
    box(scene, `art1j-street-road-seam-${index}`, new Vector3(.035, .012, 2.32), new Vector3(x, .045, -1.85), palette.road, root, details);
  }
  for (const x of [-4.70, -2.75, -.80, 1.15, 3.10, 5.05]) {
    rounded(scene, `art1j-street-road-mark-${x}`, new Vector3(1.02, .025, .10), new Vector3(offsetX + x, .056, -1.85), .04, palette.mustard, root, details);
  }
  rounded(scene, "art1j-street-bike-lane", new Vector3(2.00, .025, .65), new Vector3(offsetX + 3.80, .058, -.94), .13, palette.teal, root, details);
  torus(scene, "art1j-street-bike-wheel-left", .30, .035, new Vector3(offsetX + 3.55, .085, -.94), palette.trim, root, details).rotation.x = Math.PI / 2;
  torus(scene, "art1j-street-bike-wheel-right", .30, .035, new Vector3(offsetX + 4.05, .085, -.94), palette.trim, root, details).rotation.x = Math.PI / 2;
  box(scene, "art1j-street-bike-frame", new Vector3(.52, .035, .035), new Vector3(offsetX + 3.80, .10, -.94), palette.trim, root, details).rotation.y = .55;
}

function addTreeGardenAndFence(
  scene: Scene,
  offsetX: number,
  palette: StreetPalette,
  root: TransformNode,
  details: Mesh[],
  leaves: Mesh[],
  movingFlowers: Mesh[],
): void {
  contactShadow(scene, "art1j-street-tree-shadow", new Vector3(offsetX - .25, .012, 2.30), 1.28, .72, palette, root, details);
  cylinder(scene, "art1j-street-tree-ring", 1.65, .18, new Vector3(offsetX - .25, .10, 2.30), palette.brick, root, details, 28);
  cylinder(scene, "art1j-street-tree-soil", 1.40, .12, new Vector3(offsetX - .25, .18, 2.30), palette.wood, root, details, 28);
  cylinder(scene, "art1j-street-tree-trunk-overlay", .48, 2.18, new Vector3(offsetX - .25, 1.09, 2.30), palette.wood, root, details, 12);
  for (let index = 0; index < 15; index += 1) {
    const angle = index / 15 * Math.PI * 2;
    const radius = .52 + (index % 3) * .17;
    const leaf = sphere(
      scene,
      `art1j-street-tree-leaf-${index}`,
      .82 + (index % 4) * .10,
      new Vector3(
        offsetX - .25 + Math.cos(angle) * radius,
        2.18 + (index % 5) * .18,
        2.30 + Math.sin(angle) * radius * .55,
      ),
      new Vector3(1.10, .83, .78),
      index % 3 ? palette.leaf : palette.leafLight,
      root,
      details,
      10,
    );
    leaves.push(leaf);
  }
  for (let index = 0; index < 12; index += 1) {
    const angle = index / 12 * Math.PI * 2;
    cylinder(scene, `art1j-street-tree-flower-stem-${index}`, .018, .18, new Vector3(offsetX - .25 + Math.cos(angle) * .52, .34, 2.30 + Math.sin(angle) * .38), palette.leaf, root, details, 6);
    const flower = sphere(scene, `art1j-street-tree-flower-${index}`, .13, new Vector3(offsetX - .25 + Math.cos(angle) * .52, .45, 2.30 + Math.sin(angle) * .38), new Vector3(1, .62, .88), index % 2 ? palette.flowerWhite : palette.blush, root, details, 8);
    movingFlowers.push(flower);
  }

  // Foreground picket garden hints at a larger neighborhood but remains inside the mask.
  for (let index = 0; index < 8; index += 1) {
    const x = offsetX - 5.70 + index * .28;
    rounded(scene, `art1j-street-fence-picket-${index}`, new Vector3(.14, .88 + (index % 2) * .08, .12), new Vector3(x, .48, 2.15), .05, palette.trim, root, details);
  }
  box(scene, "art1j-street-fence-rail-top", new Vector3(2.08, .12, .12), new Vector3(offsetX - 4.72, .70, 2.15), palette.trim, root, details);
  box(scene, "art1j-street-fence-rail-bottom", new Vector3(2.08, .12, .12), new Vector3(offsetX - 4.72, .30, 2.15), palette.trim, root, details);
  for (let index = 0; index < 10; index += 1) {
    const x = offsetX - 5.72 + index * .22;
    const flower = sphere(scene, `art1j-street-garden-flower-${index}`, .16, new Vector3(x, .34 + (index % 3) * .07, 2.42), new Vector3(1, .68, .88), [palette.coral, palette.mustard, palette.flowerPurple][index % 3], root, details, 8);
    movingFlowers.push(flower);
  }
}

function addFurnitureAndWayfinding(
  scene: Scene,
  offsetX: number,
  palette: StreetPalette,
  root: TransformNode,
  details: Mesh[],
  swayingSigns: Mesh[],
  glowMeshes: Mesh[],
): void {
  // Bench overlay: curved arms, separate slats and metal supports.
  contactShadow(scene, "art1j-street-bench-shadow", new Vector3(offsetX - 2.10, .012, 1.15), 1.30, .52, palette, root, details);
  for (const z of [.94, 1.12, 1.30]) {
    rounded(scene, `art1j-street-bench-seat-slat-${z}`, new Vector3(2.18, .09, .14), new Vector3(offsetX - 2.10, .72, z), .04, palette.woodLight, root, details);
  }
  for (const y of [.84, 1.08, 1.32]) {
    rounded(scene, `art1j-street-bench-back-slat-${y}`, new Vector3(2.18, .13, .10), new Vector3(offsetX - 2.10, y, 1.48), .04, palette.woodLight, root, details);
  }
  for (const x of [-3.08, -1.12]) {
    cylinder(scene, `art1j-street-bench-leg-${x}`, .12, .66, new Vector3(offsetX + x, .36, 1.16), palette.navy, root, details, 10);
    const arm = torus(scene, `art1j-street-bench-arm-${x}`, .64, .08, new Vector3(offsetX + x, .86, 1.16), palette.navy, root, details);
    arm.rotation.x = Math.PI / 2;
    arm.scaling.z = .65;
  }

  // Mailbox overlay.
  contactShadow(scene, "art1j-street-mailbox-shadow", new Vector3(offsetX - 5.10, .012, .75), .52, .38, palette, root, details);
  rounded(scene, "art1j-street-mailbox-body", new Vector3(.82, .58, .62), new Vector3(offsetX - 5.10, 1.20, .75), .16, palette.teal, root, details);
  torus(scene, "art1j-street-mailbox-round-top", .72, .12, new Vector3(offsetX - 5.10, 1.45, .75), palette.teal, root, details).rotation.x = Math.PI / 2;
  rounded(scene, "art1j-street-mail-slot", new Vector3(.38, .08, .025), new Vector3(offsetX - 5.10, 1.26, .42), .03, palette.navy, root, details);
  sphere(scene, "art1j-street-mail-flower", .16, new Vector3(offsetX - 5.10, .95, .42), new Vector3(1, .65, .90), palette.mustard, root, details, 8);
  cylinder(scene, "art1j-street-mailbox-post-overlay", .16, 1.18, new Vector3(offsetX - 5.10, .58, .75), palette.wood, root, details, 10);

  // Direction sign near the park/grocery crossroads.
  cylinder(scene, "art1j-street-signpost", .13, 2.45, new Vector3(offsetX + 5.05, 1.23, .70), palette.teal, root, details, 12);
  sphere(scene, "art1j-street-signpost-cap", .26, new Vector3(offsetX + 5.05, 2.48, .70), Vector3.One(), palette.mustard, root, details, 10);
  for (const [index, y, material] of [
    [0, 2.02, palette.mint],
    [1, 1.62, palette.cafeBlue],
    [2, 1.22, palette.mustard],
  ] as const) {
    const sign = rounded(scene, `art1j-street-direction-sign-${index}`, new Vector3(1.45, .34, .12), new Vector3(offsetX + 4.42, y, .70), .09, material, root, details);
    sign.rotation.z = (index - 1) * .02;
    swayingSigns.push(sign);
    sphere(scene, `art1j-street-direction-dot-${index}`, .11, new Vector3(offsetX + 3.92, y, .62), Vector3.One(), palette.trim, root, details, 8);
    for (const [lineIndex, width] of [.52, .34].entries()) {
      box(scene, `art1j-street-direction-line-${index}-${lineIndex}`, new Vector3(width, .035, .025), new Vector3(offsetX + 4.52, y + .06 - lineIndex * .12, .61), palette.trim, root, details);
    }
  }

  // Street lamps and warm pools.
  for (const [index, x] of [-5.30, .65, 5.45].entries()) {
    cylinder(scene, `art1j-street-lamp-post-${index}`, .12, 2.35, new Vector3(offsetX + x, 1.18, .80), palette.navy, root, details, 12);
    cylinder(scene, `art1j-street-lamp-base-${index}`, .34, .14, new Vector3(offsetX + x, .10, .80), palette.navy, root, details, 16);
    const shade = MeshBuilder.CreateCylinder(`art1j-street-lamp-shade-${index}`, { diameterTop: .18, diameterBottom: .48, height: .40, tessellation: 18 }, scene);
    shade.position.set(offsetX + x, 2.46, .80);
    shade.material = palette.glow;
    decorate(shade, root, details);
    glowMeshes.push(shade);
    const pool = MeshBuilder.CreateDisc(`art1j-street-lamp-pool-${index}`, { radius: 1, tessellation: 28 }, scene);
    pool.rotation.x = Math.PI / 2;
    pool.position.set(offsetX + x, .015, .80);
    pool.scaling.set(.72, .48, 1);
    pool.material = palette.glow;
    decorate(pool, root, details);
    glowMeshes.push(pool);
  }

  // Café pavement table: visual storytelling only, kept outside core navigation lanes.
  contactShadow(scene, "art1j-street-cafe-table-shadow", new Vector3(offsetX + 2.10, .012, 1.48), .72, .58, palette, root, details);
  cylinder(scene, "art1j-street-cafe-table-pedestal", .16, .70, new Vector3(offsetX + 2.10, .40, 1.48), palette.metal, root, details, 14);
  rounded(scene, "art1j-street-cafe-table-top", new Vector3(1.08, .13, .88), new Vector3(offsetX + 2.10, .80, 1.48), .16, palette.woodLight, root, details);
  cylinder(scene, "art1j-street-cafe-table-cup", .20, .24, new Vector3(offsetX + 2.10, 1.00, 1.48), palette.trim, root, details, 16);
  torus(scene, "art1j-street-cafe-table-cup-handle", .18, .035, new Vector3(offsetX + 2.27, 1.00, 1.48), palette.trim, root, details).rotation.y = Math.PI / 2;
}

/**
 * Dedicated High-quality neighborhood layer. Existing roads, doors, mailbox,
 * bench, scooter, NPCs, travel hotspots, walkability, and saves remain active.
 */
export function applyStreetHighPolish(scene: Scene, offsetX: number): Mesh[] {
  const root = new TransformNode("art1j-street-high-polish", scene);
  const details: Mesh[] = [];
  const palette = createPalette(scene);
  const leaves: Mesh[] = [];
  const movingFlowers: Mesh[] = [];
  const awningPieces: Mesh[] = [];
  const swayingSigns: Mesh[] = [];
  const glowMeshes: Mesh[] = [];

  addFacadeArchitecture(scene, offsetX, palette, root, details, movingFlowers, awningPieces);
  addStreetSurface(scene, offsetX, palette, root, details);
  addTreeGardenAndFence(scene, offsetX, palette, root, details, leaves, movingFlowers);
  addFurnitureAndWayfinding(scene, offsetX, palette, root, details, swayingSigns, glowMeshes);

  const leafBase = leaves.map((mesh) => mesh.rotation.z);
  const leafPosition = leaves.map((mesh) => mesh.position.clone());
  const flowerBase = movingFlowers.map((mesh) => mesh.rotation.z);
  const awningBase = awningPieces.map((mesh) => mesh.rotation.x);
  const signBase = swayingSigns.map((mesh) => mesh.rotation.z);
  const glowBase = glowMeshes.map((mesh) => mesh.scaling.clone());
  let elapsed = 0;

  scene.onBeforeRenderObservable.add(() => {
    const visible = details[0]?.isEnabled() ?? false;
    if (!visible) return;
    elapsed += Math.min(scene.getEngine().getDeltaTime(), 50) / 1000;

    for (const [index, leaf] of leaves.entries()) {
      leaf.rotation.z = leafBase[index] + Math.sin(elapsed * .42 + index * .43) * .014;
      leaf.position.x = leafPosition[index].x + Math.sin(elapsed * .35 + index) * .016;
    }
    for (const [index, flower] of movingFlowers.entries()) {
      flower.rotation.z = flowerBase[index] + Math.sin(elapsed * .58 + index * .72) * .020;
    }
    for (const [index, awning] of awningPieces.entries()) {
      awning.rotation.x = awningBase[index] + Math.sin(elapsed * .36 + index * .31) * .006;
    }
    for (const [index, sign] of swayingSigns.entries()) {
      sign.rotation.z = signBase[index] + Math.sin(elapsed * .28 + index * .75) * .010;
    }
    for (const [index, glow] of glowMeshes.entries()) {
      const pulse = 1 + Math.sin(elapsed * (.72 + index * .03) + index) * .025;
      glow.scaling.copyFrom(glowBase[index]).scaleInPlace(pulse);
    }
    palette.glow.alpha = .65 + Math.sin(elapsed * .82) * .035;
  });

  return details;
}
