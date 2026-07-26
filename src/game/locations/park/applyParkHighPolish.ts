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

interface ParkPalette {
  grass: StandardMaterial;
  grassLight: StandardMaterial;
  hedge: StandardMaterial;
  leaf: StandardMaterial;
  leafLight: StandardMaterial;
  leafDark: StandardMaterial;
  wood: StandardMaterial;
  woodLight: StandardMaterial;
  stone: StandardMaterial;
  paving: StandardMaterial;
  sand: StandardMaterial;
  water: StandardMaterial;
  waterGlow: StandardMaterial;
  coral: StandardMaterial;
  blush: StandardMaterial;
  teal: StandardMaterial;
  mint: StandardMaterial;
  mustard: StandardMaterial;
  navy: StandardMaterial;
  flowerPurple: StandardMaterial;
  flowerWhite: StandardMaterial;
  metal: StandardMaterial;
  ceramic: StandardMaterial;
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

function createPalette(scene: Scene): ParkPalette {
  const shadow = createMaterial(scene, "art1j-park-shadow", new Color3(.035, .045, .04), undefined, "shadow");
  shadow.alpha = .13;
  return {
    grass: createMaterial(scene, "art1j-park-grass", new Color3(.35, .61, .30), undefined, "matte"),
    grassLight: createMaterial(scene, "art1j-park-grass-light", new Color3(.55, .72, .38), undefined, "matte"),
    hedge: createMaterial(scene, "art1j-park-hedge", new Color3(.20, .43, .24), undefined, "soft-toy"),
    leaf: createMaterial(scene, "art1j-park-leaf", new Color3(.24, .52, .28), undefined, "soft-toy"),
    leafLight: createMaterial(scene, "art1j-park-leaf-light", new Color3(.48, .69, .34), undefined, "soft-toy"),
    leafDark: createMaterial(scene, "art1j-park-leaf-dark", new Color3(.13, .35, .20), undefined, "soft-toy"),
    wood: createMaterial(scene, "art1j-park-wood", new Color3(.43, .25, .14), undefined, "wood"),
    woodLight: createMaterial(scene, "art1j-park-wood-light", new Color3(.72, .48, .25), undefined, "wood"),
    stone: createMaterial(scene, "art1j-park-stone", new Color3(.65, .62, .56), undefined, "matte"),
    paving: createMaterial(scene, "art1j-park-paving", new Color3(.81, .75, .64), undefined, "matte"),
    sand: createMaterial(scene, "art1j-park-sand", new Color3(.91, .72, .37), undefined, "matte"),
    water: translucent(scene, "art1j-park-water", new Color3(.28, .70, .83), .58, new Color3(.025, .09, .12)),
    waterGlow: translucent(scene, "art1j-park-water-glow", new Color3(.66, .93, .98), .48, new Color3(.05, .12, .14)),
    coral: createMaterial(scene, "art1j-park-coral", new Color3(.91, .36, .47), undefined, "soft-toy"),
    blush: createMaterial(scene, "art1j-park-blush", new Color3(.96, .62, .69), undefined, "fabric"),
    teal: createMaterial(scene, "art1j-park-teal", new Color3(.11, .50, .51), undefined, "soft-toy"),
    mint: createMaterial(scene, "art1j-park-mint", new Color3(.54, .78, .67), undefined, "soft-toy"),
    mustard: createMaterial(scene, "art1j-park-mustard", new Color3(.95, .68, .18), undefined, "soft-toy"),
    navy: createMaterial(scene, "art1j-park-navy", new Color3(.09, .15, .24), undefined, "soft-toy"),
    flowerPurple: createMaterial(scene, "art1j-park-flower-purple", new Color3(.62, .34, .73), undefined, "soft-toy"),
    flowerWhite: createMaterial(scene, "art1j-park-flower-white", new Color3(.98, .96, .90), undefined, "ceramic"),
    metal: createMaterial(scene, "art1j-park-metal", new Color3(.54, .62, .63), undefined, "metal"),
    ceramic: createMaterial(scene, "art1j-park-ceramic", new Color3(.98, .95, .87), undefined, "ceramic"),
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
    artPass: "art1j-park",
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
  palette: ParkPalette,
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

function addFlowerCluster(
  scene: Scene,
  name: string,
  center: Vector3,
  palette: ParkPalette,
  root: TransformNode,
  details: Mesh[],
  flowers: Mesh[],
  count = 7,
): void {
  for (let index = 0; index < count; index += 1) {
    const angle = index / count * Math.PI * 2;
    const radius = .16 + (index % 3) * .08;
    cylinder(scene, `${name}-stem-${index}`, .018, .22 + (index % 2) * .08, new Vector3(center.x + Math.cos(angle) * radius, center.y + .12, center.z + Math.sin(angle) * radius * .75), palette.leafDark, root, details, 6);
    const bloom = sphere(
      scene,
      `${name}-bloom-${index}`,
      .16 + (index % 2) * .025,
      new Vector3(center.x + Math.cos(angle) * radius, center.y + .28 + (index % 2) * .07, center.z + Math.sin(angle) * radius * .75),
      new Vector3(1, .65, .88),
      [palette.coral, palette.mustard, palette.flowerPurple, palette.flowerWhite][index % 4],
      root,
      details,
      8,
    );
    flowers.push(bloom);
  }
}

function addLandscapeFrame(
  scene: Scene,
  offsetX: number,
  palette: ParkPalette,
  root: TransformNode,
  details: Mesh[],
  leaves: Mesh[],
  flowers: Mesh[],
): void {
  // Background hedges create a clear park edge and hide the box-only horizon.
  for (let index = 0; index < 15; index += 1) {
    const x = offsetX - 5.55 + index * .79;
    sphere(scene, `art1j-park-hedge-${index}`, .92, new Vector3(x, .58 + (index % 3) * .08, 3.55), new Vector3(1.10, .78, .62), index % 2 ? palette.hedge : palette.leafDark, root, details, 10);
  }
  box(scene, "art1j-park-hedge-border", new Vector3(11.55, .28, .26), new Vector3(offsetX, .16, 3.34), palette.stone, root, details);

  for (const [treeIndex, x, z, scale] of [
    [0, -5.05, 2.85, 1.00],
    [1, -2.55, 3.05, .86],
    [2, 2.72, 3.05, .90],
    [3, 5.10, 2.76, 1.02],
  ] as const) {
    contactShadow(scene, `art1j-park-tree-shadow-${treeIndex}`, new Vector3(offsetX + x, .012, z), .86 * scale, .60 * scale, palette, root, details);
    cylinder(scene, `art1j-park-tree-trunk-${treeIndex}`, .38 * scale, 1.90 * scale, new Vector3(offsetX + x, .96 * scale, z), palette.wood, root, details, 12);
    for (let leafIndex = 0; leafIndex < 11; leafIndex += 1) {
      const angle = leafIndex / 11 * Math.PI * 2;
      const radius = .42 + (leafIndex % 3) * .15;
      const leaf = sphere(
        scene,
        `art1j-park-tree-leaf-${treeIndex}-${leafIndex}`,
        (.82 + (leafIndex % 4) * .10) * scale,
        new Vector3(
          offsetX + x + Math.cos(angle) * radius * scale,
          1.92 * scale + (leafIndex % 4) * .18 * scale,
          z + Math.sin(angle) * radius * .55 * scale,
        ),
        new Vector3(1.05, .82, .78),
        leafIndex % 3 ? palette.leaf : palette.leafLight,
        root,
        details,
        10,
      );
      leaves.push(leaf);
    }
  }

  // Curved-looking flower borders made from overlapping rounded stones and clusters.
  for (const side of [-1, 1]) {
    for (let index = 0; index < 7; index += 1) {
      const x = offsetX + side * (4.85 - index * .48);
      const z = 1.45 + Math.sin(index * .62) * .22;
      sphere(scene, `art1j-park-flower-border-stone-${side}-${index}`, .38, new Vector3(x, .10, z), new Vector3(1.20, .34, .78), palette.stone, root, details, 10);
      addFlowerCluster(scene, `art1j-park-flower-border-${side}-${index}`, new Vector3(x, .16, z + .12), palette, root, details, flowers, 4);
    }
  }
}

function addPathsAndGroundDetail(
  scene: Scene,
  offsetX: number,
  palette: ParkPalette,
  root: TransformNode,
  details: Mesh[],
): void {
  // Rounded paving overlays follow the existing cross and main paths.
  for (let index = 0; index < 11; index += 1) {
    const z = -3.55 + index * .70;
    rounded(scene, `art1j-park-main-paver-${index}`, new Vector3(2.55, .03, .56), new Vector3(offsetX + Math.sin(index * .58) * .05, .045, z), .12, index % 2 ? palette.paving : palette.ceramic, root, details);
  }
  for (let index = 0; index < 14; index += 1) {
    const x = offsetX - 5.45 + index * .84;
    rounded(scene, `art1j-park-cross-paver-${index}`, new Vector3(.68, .03, .86), new Vector3(x, .052, -.80 + Math.sin(index * .70) * .03), .11, index % 2 ? palette.paving : palette.ceramic, root, details);
  }
  for (const x of [-1.62, 1.62]) {
    box(scene, `art1j-park-main-curb-${x}`, new Vector3(.12, .12, 7.75), new Vector3(offsetX + x, .085, 0), palette.stone, root, details);
  }
  for (const z of [-1.47, -.13]) {
    box(scene, `art1j-park-cross-curb-${z}`, new Vector3(11.45, .12, .12), new Vector3(offsetX, .09, z), palette.stone, root, details);
  }

  // Grass tufts and clover add scale without textures.
  for (let index = 0; index < 30; index += 1) {
    const x = offsetX - 5.35 + (index * 1.37) % 10.70;
    const z = -3.30 + (index * 1.91) % 6.60;
    if (Math.abs(x - offsetX) < 1.85 || Math.abs(z + .8) < .85) continue;
    const tuft = sphere(scene, `art1j-park-grass-tuft-${index}`, .20, new Vector3(x, .15, z), new Vector3(.36, 1.15, .28), index % 2 ? palette.grass : palette.grassLight, root, details, 8);
    tuft.rotation.z = (index % 5 - 2) * .10;
  }
}

function addBench(
  scene: Scene,
  name: string,
  centerX: number,
  offsetX: number,
  palette: ParkPalette,
  root: TransformNode,
  details: Mesh[],
): void {
  contactShadow(scene, `${name}-shadow`, new Vector3(offsetX + centerX, .012, -.05), 1.30, .48, palette, root, details);
  for (const z of [-.28, -.05, .18]) {
    rounded(scene, `${name}-seat-${z}`, new Vector3(2.02, .10, .17), new Vector3(offsetX + centerX, .72, z), .04, palette.woodLight, root, details);
  }
  for (const y of [.86, 1.08, 1.30]) {
    rounded(scene, `${name}-back-${y}`, new Vector3(2.02, .13, .10), new Vector3(offsetX + centerX, y, .30), .04, palette.woodLight, root, details);
  }
  for (const x of [centerX - .90, centerX + .90]) {
    cylinder(scene, `${name}-leg-${x}`, .12, .62, new Vector3(offsetX + x, .35, -.05), palette.navy, root, details, 10);
    const arm = torus(scene, `${name}-arm-${x}`, .62, .075, new Vector3(offsetX + x, .87, -.05), palette.navy, root, details);
    arm.rotation.x = Math.PI / 2;
    arm.scaling.z = .66;
  }
}

function addSeatingAndPicnic(
  scene: Scene,
  offsetX: number,
  palette: ParkPalette,
  root: TransformNode,
  details: Mesh[],
  bunting: Mesh[],
): void {
  addBench(scene, "art1j-park-bench-left", -3.60, offsetX, palette, root, details);
  addBench(scene, "art1j-park-bench-right", 3.60, offsetX, palette, root, details);

  contactShadow(scene, "art1j-park-picnic-shadow", new Vector3(offsetX - 3.35, .012, -2.20), 1.65, .92, palette, root, details);
  rounded(scene, "art1j-park-picnic-blanket", new Vector3(3.02, .06, 2.12), new Vector3(offsetX - 3.35, .055, -2.20), .18, palette.blush, root, details);
  for (let stripe = 0; stripe < 7; stripe += 1) {
    box(scene, `art1j-park-picnic-stripe-${stripe}`, new Vector3(.12, .025, 1.92), new Vector3(offsetX - 4.62 + stripe * .42, .095, -2.20), stripe % 2 ? palette.coral : palette.ceramic, root, details);
  }
  rounded(scene, "art1j-park-picnic-table-top", new Vector3(2.25, .17, 1.02), new Vector3(offsetX - 3.35, .76, -2.20), .12, palette.woodLight, root, details);
  for (const x of [-4.18, -2.52]) {
    cylinder(scene, `art1j-park-picnic-table-leg-${x}`, .13, .70, new Vector3(offsetX + x, .38, -2.20), palette.navy, root, details, 10);
  }
  rounded(scene, "art1j-park-picnic-basket", new Vector3(.82, .54, .58), new Vector3(offsetX - 4.42, .34, -2.88), .12, palette.woodLight, root, details);
  torus(scene, "art1j-park-picnic-basket-handle", .64, .055, new Vector3(offsetX - 4.42, .66, -2.88), palette.wood, root, details).rotation.x = Math.PI / 2;
  cylinder(scene, "art1j-park-picnic-thermos", .24, .48, new Vector3(offsetX - 2.72, 1.08, -2.20), palette.teal, root, details, 16);
  cylinder(scene, "art1j-park-picnic-cup", .20, .22, new Vector3(offsetX - 3.20, .99, -2.20), palette.ceramic, root, details, 16);
  sphere(scene, "art1j-park-picnic-apple", .24, new Vector3(offsetX - 3.62, .98, -2.20), Vector3.One(), palette.coral, root, details, 10);

  cylinder(scene, "art1j-park-bunting-post-left", .08, 2.10, new Vector3(offsetX - 4.95, 1.05, -3.03), palette.wood, root, details, 8);
  cylinder(scene, "art1j-park-bunting-post-right", .08, 2.10, new Vector3(offsetX - 1.75, 1.05, -3.03), palette.wood, root, details, 8);
  box(scene, "art1j-park-bunting-wire", new Vector3(3.20, .025, .025), new Vector3(offsetX - 3.35, 2.02, -3.03), palette.navy, root, details);
  for (let index = 0; index < 8; index += 1) {
    const flag = MeshBuilder.CreateCylinder(`art1j-park-bunting-${index}`, { diameterTop: 0, diameterBottom: .28, height: .36, tessellation: 3 }, scene);
    flag.position.set(offsetX - 4.76 + index * .40, 1.83, -3.03);
    flag.rotation.z = Math.PI;
    flag.material = [palette.coral, palette.mustard, palette.teal, palette.flowerPurple][index % 4];
    decorate(flag, root, details);
    bunting.push(flag);
  }
}

function addPlayground(
  scene: Scene,
  offsetX: number,
  palette: ParkPalette,
  root: TransformNode,
  details: Mesh[],
  swings: Mesh[],
): void {
  // Slide overlay: side rails, ladder, rounded platform and landing pad.
  contactShadow(scene, "art1j-park-slide-shadow", new Vector3(offsetX + 3.40, .012, -2.10), 1.10, 1.35, palette, root, details);
  rounded(scene, "art1j-park-slide-platform", new Vector3(1.18, .18, .96), new Vector3(offsetX + 3.40, 1.66, -1.84), .12, palette.mustard, root, details);
  for (const x of [3.02, 3.78]) {
    cylinder(scene, `art1j-park-slide-rail-${x}`, .09, 1.40, new Vector3(offsetX + x, 2.18, -1.78), palette.teal, root, details, 10);
  }
  for (let rung = 0; rung < 4; rung += 1) {
    box(scene, `art1j-park-slide-ladder-rung-${rung}`, new Vector3(.70, .07, .09), new Vector3(offsetX + 3.40, .46 + rung * .34, -1.40), palette.metal, root, details);
  }
  for (const x of [3.02, 3.78]) {
    const rail = rounded(scene, `art1j-park-slide-side-${x}`, new Vector3(.10, .20, 2.75), new Vector3(offsetX + x, .96, -2.90), .05, palette.teal, root, details);
    rail.rotation.x = -.56;
  }
  const ramp = rounded(scene, "art1j-park-slide-ramp-overlay", new Vector3(.76, .10, 2.62), new Vector3(offsetX + 3.40, .94, -2.92), .10, palette.coral, root, details);
  ramp.rotation.x = -.56;
  rounded(scene, "art1j-park-slide-landing", new Vector3(1.20, .06, .90), new Vector3(offsetX + 3.40, .05, -3.40), .20, palette.sand, root, details);

  // Swing frame overlay and moving seats.
  contactShadow(scene, "art1j-park-swings-shadow", new Vector3(offsetX + 2.00, .012, 2.45), 1.45, .62, palette, root, details);
  for (const x of [1.02, 2.98]) {
    const postFront = cylinder(scene, `art1j-park-swing-post-front-${x}`, .13, 2.72, new Vector3(offsetX + x, 1.36, 2.17), palette.teal, root, details, 12);
    postFront.rotation.z = x < 2 ? -.12 : .12;
    const postBack = cylinder(scene, `art1j-park-swing-post-back-${x}`, .13, 2.72, new Vector3(offsetX + x, 1.36, 2.73), palette.teal, root, details, 12);
    postBack.rotation.z = x < 2 ? -.12 : .12;
  }
  rounded(scene, "art1j-park-swing-top", new Vector3(2.32, .16, .16), new Vector3(offsetX + 2.00, 2.62, 2.45), .07, palette.navy, root, details);
  for (const [seatIndex, x] of [1.55, 2.45].entries()) {
    for (const dx of [-.20, .20]) {
      box(scene, `art1j-park-swing-rope-${seatIndex}-${dx}`, new Vector3(.035, 1.44, .035), new Vector3(offsetX + x + dx, 1.86, 2.45), palette.navy, root, details);
    }
    const seat = rounded(scene, `art1j-park-swing-seat-${seatIndex}`, new Vector3(.62, .12, .42), new Vector3(offsetX + x, 1.10, 2.45), .09, seatIndex ? palette.mustard : palette.coral, root, details);
    swings.push(seat);
  }

  // Sandbox overlay with toys.
  contactShadow(scene, "art1j-park-sandbox-shadow", new Vector3(offsetX + 4.45, .012, .20), 1.26, .94, palette, root, details);
  cylinder(scene, "art1j-park-sandbox-rim", 2.38, .28, new Vector3(offsetX + 4.45, .16, .20), palette.woodLight, root, details, 28);
  cylinder(scene, "art1j-park-sandbox-fill", 2.10, .16, new Vector3(offsetX + 4.45, .28, .20), palette.sand, root, details, 28);
  rounded(scene, "art1j-park-sandbox-bucket", new Vector3(.42, .36, .36), new Vector3(offsetX + 4.15, .54, .08), .09, palette.teal, root, details);
  torus(scene, "art1j-park-sandbox-bucket-handle", .38, .035, new Vector3(offsetX + 4.15, .76, .08), palette.navy, root, details).rotation.x = Math.PI / 2;
  const spade = rounded(scene, "art1j-park-sandbox-spade", new Vector3(.16, .08, .54), new Vector3(offsetX + 4.78, .48, .32), .05, palette.coral, root, details);
  spade.rotation.y = .65;
}

function addPondAndFountain(
  scene: Scene,
  offsetX: number,
  palette: ParkPalette,
  root: TransformNode,
  details: Mesh[],
  waterDrops: Mesh[],
  lilyPads: Mesh[],
): void {
  contactShadow(scene, "art1j-park-pond-shadow", new Vector3(offsetX - 1.80, .010, 2.45), 1.35, .92, palette, root, details);
  cylinder(scene, "art1j-park-pond-stone-base", 2.50, .18, new Vector3(offsetX - 1.80, .10, 2.45), palette.stone, root, details, 30).scaling.z = .74;
  cylinder(scene, "art1j-park-pond-water", 2.22, .11, new Vector3(offsetX - 1.80, .20, 2.45), palette.water, root, details, 30).scaling.z = .72;
  for (let index = 0; index < 15; index += 1) {
    const angle = index / 15 * Math.PI * 2;
    sphere(scene, `art1j-park-pond-stone-${index}`, .34, new Vector3(offsetX - 1.80 + Math.cos(angle) * 1.12, .22, 2.45 + Math.sin(angle) * .78), new Vector3(1.18, .40, .78), index % 2 ? palette.paving : palette.stone, root, details, 10);
  }
  for (const [index, x, z, material] of [
    [0, -2.22, 2.36, palette.leaf],
    [1, -1.62, 2.62, palette.leafLight],
    [2, -1.18, 2.28, palette.leaf],
  ] as const) {
    const pad = cylinder(scene, `art1j-park-lily-pad-${index}`, .42, .035, new Vector3(offsetX + x, .31, z), material, root, details, 18);
    pad.scaling.z = .72;
    lilyPads.push(pad);
    sphere(scene, `art1j-park-lily-flower-${index}`, .14, new Vector3(offsetX + x + .08, .39, z), new Vector3(1, .65, .85), index % 2 ? palette.flowerWhite : palette.blush, root, details, 8);
  }

  contactShadow(scene, "art1j-park-fountain-shadow", new Vector3(offsetX + .55, .012, 2.65), .70, .55, palette, root, details);
  cylinder(scene, "art1j-park-fountain-basin", 1.12, .24, new Vector3(offsetX + .55, .18, 2.65), palette.stone, root, details, 28);
  cylinder(scene, "art1j-park-fountain-water-basin", .92, .10, new Vector3(offsetX + .55, .32, 2.65), palette.water, root, details, 28);
  cylinder(scene, "art1j-park-fountain-column", .36, .88, new Vector3(offsetX + .55, .74, 2.65), palette.stone, root, details, 20);
  cylinder(scene, "art1j-park-fountain-cup", .72, .14, new Vector3(offsetX + .55, 1.16, 2.65), palette.stone, root, details, 24);
  cylinder(scene, "art1j-park-fountain-cap", .18, .34, new Vector3(offsetX + .55, 1.38, 2.65), palette.mustard, root, details, 16);
  for (let index = 0; index < 10; index += 1) {
    const angle = index / 10 * Math.PI * 2;
    const drop = sphere(
      scene,
      `art1j-park-fountain-drop-${index}`,
      .12,
      new Vector3(offsetX + .55 + Math.cos(angle) * .42, 1.24 + (index % 3) * .10, 2.65 + Math.sin(angle) * .34),
      new Vector3(.66, 1.35, .66),
      palette.waterGlow,
      root,
      details,
      8,
    );
    waterDrops.push(drop);
  }
}

function addParkDetails(
  scene: Scene,
  offsetX: number,
  palette: ParkPalette,
  root: TransformNode,
  details: Mesh[],
  swayingSigns: Mesh[],
  flowers: Mesh[],
): void {
  // Signboard frame and friendly pictogram-style lines.
  contactShadow(scene, "art1j-park-sign-shadow", new Vector3(offsetX + 1.75, .012, -.65), .78, .42, palette, root, details);
  rounded(scene, "art1j-park-sign-frame", new Vector3(2.05, 1.34, .16), new Vector3(offsetX + 1.75, 1.58, -.65), .12, palette.wood, root, details);
  rounded(scene, "art1j-park-sign-inner", new Vector3(1.76, 1.06, .035), new Vector3(offsetX + 1.75, 1.58, -.76), .08, palette.teal, root, details);
  for (const [index, width] of [1.10, .82, 1.28, .62].entries()) {
    box(scene, `art1j-park-sign-line-${index}`, new Vector3(width, .055, .025), new Vector3(offsetX + 1.75, 1.88 - index * .20, -.79), index === 0 ? palette.mustard : palette.ceramic, root, details);
  }
  sphere(scene, "art1j-park-sign-flower", .22, new Vector3(offsetX + 1.12, 1.91, -.79), new Vector3(1, .68, .90), palette.coral, root, details, 9);

  // Waste station and bird feeder.
  rounded(scene, "art1j-park-bin-shell", new Vector3(.72, 1.00, .72), new Vector3(offsetX - 1.50, .52, -.80), .12, palette.teal, root, details);
  torus(scene, "art1j-park-bin-rim", .62, .055, new Vector3(offsetX - 1.50, 1.03, -.80), palette.navy, root, details).rotation.x = Math.PI / 2;
  rounded(scene, "art1j-park-bin-label", new Vector3(.34, .34, .025), new Vector3(offsetX - 1.50, .61, -1.18), .06, palette.ceramic, root, details);

  cylinder(scene, "art1j-park-bird-feeder-post", .10, 1.55, new Vector3(offsetX - .45, .78, 2.98), palette.wood, root, details, 10);
  rounded(scene, "art1j-park-bird-feeder-house", new Vector3(.58, .52, .48), new Vector3(offsetX - .45, 1.55, 2.98), .10, palette.mustard, root, details);
  const roof = MeshBuilder.CreateCylinder("art1j-park-bird-feeder-roof", { diameterTop: 0, diameterBottom: .74, height: .42, tessellation: 4 }, scene);
  roof.position.set(offsetX - .45, 1.96, 2.98);
  roof.rotation.y = Math.PI / 4;
  roof.material = palette.coral;
  decorate(roof, root, details);
  for (const [index, x] of [-.68, -.22].entries()) {
    const bird = sphere(scene, `art1j-park-bird-${index}`, .22, new Vector3(offsetX + x, 1.84 + index * .06, 2.78), new Vector3(1.12, .78, .70), index ? palette.teal : palette.navy, root, details, 9);
    swayingSigns.push(bird);
    sphere(scene, `art1j-park-bird-wing-${index}`, .14, new Vector3(offsetX + x - .08, 1.84 + index * .06, 2.72), new Vector3(.68, .36, 1.0), palette.mint, root, details, 8);
  }

  // Additional foreground planters.
  for (const [index, x, z, pot] of [
    [0, -5.10, -2.55, palette.coral],
    [1, 5.08, -2.65, palette.mustard],
    [2, -.10, -3.28, palette.teal],
  ] as const) {
    cylinder(scene, `art1j-park-planter-${index}`, .62, .42, new Vector3(offsetX + x, .24, z), pot, root, details, 18);
    addFlowerCluster(scene, `art1j-park-planter-flowers-${index}`, new Vector3(offsetX + x, .38, z), palette, root, details, flowers, 8);
  }
}

/**
 * Dedicated High-quality park layer. Existing benches, picnic, playground,
 * pond, fountain, hotspots, containers, NPCs, travel, and saves stay active.
 */
export function applyParkHighPolish(scene: Scene, offsetX: number): Mesh[] {
  const root = new TransformNode("art1j-park-high-polish", scene);
  const details: Mesh[] = [];
  const palette = createPalette(scene);
  const leaves: Mesh[] = [];
  const flowers: Mesh[] = [];
  const bunting: Mesh[] = [];
  const swings: Mesh[] = [];
  const waterDrops: Mesh[] = [];
  const lilyPads: Mesh[] = [];
  const swayingSigns: Mesh[] = [];

  addLandscapeFrame(scene, offsetX, palette, root, details, leaves, flowers);
  addPathsAndGroundDetail(scene, offsetX, palette, root, details);
  addSeatingAndPicnic(scene, offsetX, palette, root, details, bunting);
  addPlayground(scene, offsetX, palette, root, details, swings);
  addPondAndFountain(scene, offsetX, palette, root, details, waterDrops, lilyPads);
  addParkDetails(scene, offsetX, palette, root, details, swayingSigns, flowers);

  const leafRotation = leaves.map((mesh) => mesh.rotation.z);
  const leafPosition = leaves.map((mesh) => mesh.position.clone());
  const flowerRotation = flowers.map((mesh) => mesh.rotation.z);
  const buntingRotation = bunting.map((mesh) => mesh.rotation.z);
  const swingRotation = swings.map((mesh) => mesh.rotation.x);
  const dropPosition = waterDrops.map((mesh) => mesh.position.clone());
  const dropScale = waterDrops.map((mesh) => mesh.scaling.clone());
  const lilyRotation = lilyPads.map((mesh) => mesh.rotation.y);
  const signRotation = swayingSigns.map((mesh) => mesh.rotation.z);
  let elapsed = 0;

  scene.onBeforeRenderObservable.add(() => {
    const visible = details[0]?.isEnabled() ?? false;
    if (!visible) return;
    elapsed += Math.min(scene.getEngine().getDeltaTime(), 50) / 1000;

    for (const [index, leaf] of leaves.entries()) {
      leaf.rotation.z = leafRotation[index] + Math.sin(elapsed * .44 + index * .37) * .016;
      leaf.position.x = leafPosition[index].x + Math.sin(elapsed * .34 + index * .55) * .018;
    }
    for (const [index, flower] of flowers.entries()) {
      flower.rotation.z = flowerRotation[index] + Math.sin(elapsed * .58 + index * .61) * .022;
    }
    for (const [index, flag] of bunting.entries()) {
      flag.rotation.z = buntingRotation[index] + Math.sin(elapsed * .52 + index * .48) * .018;
    }
    for (const [index, swing] of swings.entries()) {
      swing.rotation.x = swingRotation[index] + Math.sin(elapsed * .55 + index * 1.4) * .045;
    }
    for (const [index, drop] of waterDrops.entries()) {
      const phase = (elapsed * .34 + index * .17) % 1;
      drop.position.y = dropPosition[index].y + Math.sin(phase * Math.PI) * .28;
      drop.position.x = dropPosition[index].x + Math.sin(elapsed * .90 + index) * .018;
      drop.scaling.copyFrom(dropScale[index]).scaleInPlace(.78 + Math.sin(phase * Math.PI) * .38);
      drop.visibility = .38 + Math.sin(phase * Math.PI) * .50;
    }
    for (const [index, pad] of lilyPads.entries()) {
      pad.rotation.y = lilyRotation[index] + Math.sin(elapsed * .30 + index) * .035;
    }
    for (const [index, sign] of swayingSigns.entries()) {
      sign.rotation.z = signRotation[index] + Math.sin(elapsed * .32 + index * .82) * .010;
    }
    palette.water.alpha = .56 + Math.sin(elapsed * .72) * .025;
    palette.waterGlow.alpha = .46 + Math.sin(elapsed * .94) * .035;
  });

  return details;
}
