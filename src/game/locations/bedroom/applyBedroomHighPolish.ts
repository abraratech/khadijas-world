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

interface BedroomPalette {
  plaster: StandardMaterial;
  trim: StandardMaterial;
  blush: StandardMaterial;
  coral: StandardMaterial;
  lavender: StandardMaterial;
  teal: StandardMaterial;
  mint: StandardMaterial;
  mustard: StandardMaterial;
  navy: StandardMaterial;
  sky: StandardMaterial;
  cloud: StandardMaterial;
  leaf: StandardMaterial;
  leafLight: StandardMaterial;
  wood: StandardMaterial;
  woodLight: StandardMaterial;
  ceramic: StandardMaterial;
  glass: StandardMaterial;
  metal: StandardMaterial;
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

function createPalette(scene: Scene): BedroomPalette {
  const shadow = createMaterial(scene, "art1h-bedroom-shadow", new Color3(.05, .03, .06), undefined, "shadow");
  shadow.alpha = .12;
  return {
    plaster: createMaterial(scene, "art1h-bedroom-plaster", new Color3(.91, .84, .94), undefined, "matte"),
    trim: createMaterial(scene, "art1h-bedroom-trim", new Color3(.995, .97, .91), undefined, "ceramic"),
    blush: createMaterial(scene, "art1h-bedroom-blush", new Color3(.96, .59, .70), undefined, "fabric"),
    coral: createMaterial(scene, "art1h-bedroom-coral", new Color3(.92, .34, .48), undefined, "soft-toy"),
    lavender: createMaterial(scene, "art1h-bedroom-lavender", new Color3(.67, .54, .82), undefined, "fabric"),
    teal: createMaterial(scene, "art1h-bedroom-teal", new Color3(.12, .49, .51), undefined, "fabric"),
    mint: createMaterial(scene, "art1h-bedroom-mint", new Color3(.55, .79, .69), undefined, "fabric"),
    mustard: createMaterial(scene, "art1h-bedroom-mustard", new Color3(.96, .68, .20), undefined, "soft-toy"),
    navy: createMaterial(scene, "art1h-bedroom-navy", new Color3(.10, .15, .25), undefined, "soft-toy"),
    sky: createMaterial(scene, "art1h-bedroom-sky", new Color3(.46, .77, .92), new Color3(.05, .10, .13), "matte"),
    cloud: createMaterial(scene, "art1h-bedroom-cloud", new Color3(.99, .98, .95), new Color3(.025, .025, .02), "matte"),
    leaf: createMaterial(scene, "art1h-bedroom-leaf", new Color3(.20, .50, .29), undefined, "soft-toy"),
    leafLight: createMaterial(scene, "art1h-bedroom-leaf-light", new Color3(.46, .69, .36), undefined, "soft-toy"),
    wood: createMaterial(scene, "art1h-bedroom-wood", new Color3(.48, .26, .14), undefined, "wood"),
    woodLight: createMaterial(scene, "art1h-bedroom-wood-light", new Color3(.77, .53, .30), undefined, "wood"),
    ceramic: createMaterial(scene, "art1h-bedroom-ceramic", new Color3(.985, .95, .88), undefined, "ceramic"),
    glass: translucent(scene, "art1h-bedroom-glass", new Color3(.62, .86, .94), .34, new Color3(.02, .055, .07)),
    metal: createMaterial(scene, "art1h-bedroom-metal", new Color3(.67, .71, .73), undefined, "metal"),
    glow: translucent(scene, "art1h-bedroom-glow", new Color3(1, .77, .38), .70, new Color3(.20, .11, .02)),
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
    artPass: "art1h-bedroom",
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
  const mesh = MeshBuilder.CreateTorus(name, { diameter, thickness, tessellation: 22 }, scene);
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
  palette: BedroomPalette,
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

function addArchitecture(
  scene: Scene,
  offsetX: number,
  palette: BedroomPalette,
  root: TransformNode,
  details: Mesh[],
): void {
  box(scene, "art1h-bedroom-crown-back", new Vector3(11.72, .18, .18), new Vector3(offsetX, 4.0, 3.77), palette.trim, root, details);
  box(scene, "art1h-bedroom-crown-left", new Vector3(.18, .18, 7.55), new Vector3(offsetX - 5.77, 4.0, 0), palette.trim, root, details);
  box(scene, "art1h-bedroom-baseboard-back", new Vector3(11.72, .16, .14), new Vector3(offsetX, .08, 3.78), palette.trim, root, details);
  box(scene, "art1h-bedroom-baseboard-left", new Vector3(.14, .16, 7.55), new Vector3(offsetX - 5.78, .08, 0), palette.trim, root, details);
  box(scene, "art1h-bedroom-picture-rail", new Vector3(11.70, .08, .10), new Vector3(offsetX, 1.30, 3.78), palette.woodLight, root, details);

  for (const x of [-5.1, -4.0, -2.9, -1.8, -.7, .4, 1.5, 2.6, 3.7, 4.8]) {
    rounded(
      scene,
      `art1h-bedroom-wall-panel-${x}`,
      new Vector3(.92, .73, .035),
      new Vector3(offsetX + x, .70, 3.755),
      .025,
      palette.plaster,
      root,
      details,
    );
    box(scene, `art1h-bedroom-panel-top-${x}`, new Vector3(.84, .035, .04), new Vector3(offsetX + x, 1.04, 3.72), palette.trim, root, details);
    box(scene, `art1h-bedroom-panel-bottom-${x}`, new Vector3(.84, .035, .04), new Vector3(offsetX + x, .36, 3.72), palette.trim, root, details);
  }
}

function addWindowAndCurtains(
  scene: Scene,
  offsetX: number,
  palette: BedroomPalette,
  root: TransformNode,
  details: Mesh[],
  curtains: Mesh[],
): void {
  box(scene, "art1h-bedroom-window-sky", new Vector3(3.02, 1.62, .035), new Vector3(offsetX - 2.8, 2.55, 3.81), palette.sky, root, details);
  sphere(scene, "art1h-bedroom-window-moon", .42, new Vector3(offsetX - 3.72, 3.01, 3.80), Vector3.One(), palette.mustard, root, details);
  for (const [index, x, y, scale] of [
    [0, -2.45, 3.02, .62],
    [1, -2.07, 2.82, .48],
    [2, -3.42, 2.35, .44],
  ] as const) {
    sphere(scene, `art1h-bedroom-window-cloud-${index}`, .45, new Vector3(offsetX + x, y, 3.79), new Vector3(scale * 1.55, scale * .56, .18), palette.cloud, root, details);
  }
  box(scene, "art1h-bedroom-window-sill", new Vector3(3.48, .16, .34), new Vector3(offsetX - 2.8, 1.55, 3.58), palette.trim, root, details);
  box(scene, "art1h-bedroom-window-inner-top", new Vector3(3.46, .10, .30), new Vector3(offsetX - 2.8, 3.52, 3.58), palette.trim, root, details);

  for (const [side, x, direction] of [["left", -4.28, 1], ["right", -1.32, -1]] as const) {
    for (let fold = 0; fold < 4; fold += 1) {
      const curtain = rounded(
        scene,
        `art1h-bedroom-curtain-${side}-${fold}`,
        new Vector3(.16, 2.04 - fold * .025, .22),
        new Vector3(offsetX + x + direction * fold * .11, 2.50, 3.47 - fold * .012),
        .07,
        fold % 2 ? palette.coral : palette.blush,
        root,
        details,
      );
      curtain.rotation.z = direction * (.025 + fold * .006);
      curtains.push(curtain);
    }
  }
  for (const [index, x] of [-3.30, -2.42].entries()) {
    cylinder(scene, `art1h-bedroom-sill-pot-${index}`, .28, .24, new Vector3(offsetX + x, 1.75, 3.45), index ? palette.teal : palette.coral, root, details, 14);
    for (let leaf = 0; leaf < 4; leaf += 1) {
      const angle = leaf / 4 * Math.PI * 2;
      const leafMesh = sphere(
        scene,
        `art1h-bedroom-sill-leaf-${index}-${leaf}`,
        .20,
        new Vector3(offsetX + x + Math.cos(angle) * .09, 1.94 + (leaf % 2) * .07, 3.44 + Math.sin(angle) * .06),
        new Vector3(.43, 1.10, .28),
        leaf % 2 ? palette.leafLight : palette.leaf,
        root,
        details,
        9,
      );
      leafMesh.rotation.z = Math.cos(angle) * .45;
    }
  }
}

function addBedSuite(
  scene: Scene,
  offsetX: number,
  palette: BedroomPalette,
  root: TransformNode,
  details: Mesh[],
): void {
  contactShadow(scene, "art1h-bedroom-bed-shadow", new Vector3(offsetX - 3.55, .014, .55), 1.92, 1.24, palette, root, details);
  rounded(scene, "art1h-bedroom-bed-base", new Vector3(3.34, .50, 2.22), new Vector3(offsetX - 3.55, .34, .54), .18, palette.woodLight, root, details);
  for (const x of [-4.82, -2.28]) {
    for (const z of [-.29, 1.35]) {
      cylinder(scene, `art1h-bedroom-bed-leg-${x}-${z}`, .16, .24, new Vector3(offsetX + x, .14, z), palette.wood, root, details, 10);
    }
  }
  rounded(scene, "art1h-bedroom-mattress", new Vector3(3.08, .42, 1.96), new Vector3(offsetX - 3.55, .78, .52), .17, palette.ceramic, root, details);
  rounded(scene, "art1h-bedroom-headboard", new Vector3(3.35, 1.62, .32), new Vector3(offsetX - 3.55, 1.30, 1.55), .18, palette.blush, root, details);
  for (const x of [-4.45, -3.85, -3.25, -2.65]) {
    for (const y of [1.06, 1.48, 1.88]) {
      sphere(scene, `art1h-bedroom-headboard-button-${x}-${y}`, .085, new Vector3(offsetX + x, y, 1.36), Vector3.One(), palette.mustard, root, details, 8);
    }
  }
  const duvet = rounded(scene, "art1h-bedroom-duvet", new Vector3(2.20, .28, 1.90), new Vector3(offsetX - 3.00, 1.02, .50), .16, palette.lavender, root, details);
  duvet.rotation.z = -.012;
  for (const x of [-3.85, -3.35, -2.85, -2.35]) {
    box(scene, `art1h-bedroom-duvet-stripe-${x}`, new Vector3(.045, .018, 1.62), new Vector3(offsetX + x, 1.17, .49), palette.blush, root, details);
  }
  sphere(scene, "art1h-bedroom-pillow-left", .82, new Vector3(offsetX - 4.20, 1.12, .91), new Vector3(1.18, .48, .76), palette.ceramic, root, details);
  sphere(scene, "art1h-bedroom-pillow-right", .74, new Vector3(offsetX - 3.55, 1.10, .91), new Vector3(1.12, .46, .73), palette.mint, root, details);
  sphere(scene, "art1h-bedroom-star-cushion", .52, new Vector3(offsetX - 2.90, 1.14, .86), new Vector3(1, .76, .48), palette.mustard, root, details, 10);

  contactShadow(scene, "art1h-bedroom-nightstand-shadow", new Vector3(offsetX - 1.18, .014, 1.34), .55, .45, palette, root, details);
  rounded(scene, "art1h-bedroom-nightstand", new Vector3(1.00, .88, .82), new Vector3(offsetX - 1.18, .46, 1.34), .12, palette.woodLight, root, details);
  rounded(scene, "art1h-bedroom-nightstand-drawer", new Vector3(.78, .34, .055), new Vector3(offsetX - 1.18, .57, .90), .05, palette.mint, root, details);
  sphere(scene, "art1h-bedroom-nightstand-knob", .10, new Vector3(offsetX - 1.18, .57, .84), Vector3.One(), palette.metal, root, details, 8);
  box(scene, "art1h-bedroom-bedtime-book", new Vector3(.52, .08, .36), new Vector3(offsetX - 1.12, .96, 1.35), palette.coral, root, details);
}

function addRugAndReadingCorner(
  scene: Scene,
  offsetX: number,
  palette: BedroomPalette,
  root: TransformNode,
  details: Mesh[],
  mobilePieces: Mesh[],
): void {
  rounded(scene, "art1h-bedroom-rug-base", new Vector3(4.75, .045, 3.12), new Vector3(offsetX + .10, .046, -.35), .30, palette.mint, root, details);
  rounded(scene, "art1h-bedroom-rug-inset", new Vector3(4.27, .022, 2.64), new Vector3(offsetX + .10, .074, -.35), .26, palette.blush, root, details);
  for (const x of [-1.35, -.60, .15, .90, 1.65]) {
    const motif = torus(scene, `art1h-bedroom-rug-motif-${x}`, .36, .035, new Vector3(offsetX + x, .102, -.35), palette.ceramic, root, details);
    motif.rotation.x = Math.PI / 2;
    motif.scaling.z = .70;
  }

  contactShadow(scene, "art1h-bedroom-reading-chair-shadow", new Vector3(offsetX + 1.45, .014, -2.45), .68, .58, palette, root, details);
  rounded(scene, "art1h-bedroom-reading-chair-seat", new Vector3(1.10, .44, 1.02), new Vector3(offsetX + 1.45, .52, -2.45), .22, palette.teal, root, details);
  rounded(scene, "art1h-bedroom-reading-chair-back", new Vector3(1.10, 1.05, .34), new Vector3(offsetX + 1.45, 1.12, -2.78), .18, palette.teal, root, details);
  rounded(scene, "art1h-bedroom-reading-chair-cushion", new Vector3(.82, .22, .74), new Vector3(offsetX + 1.45, .82, -2.43), .17, palette.mustard, root, details);
  for (const x of [1.10, 1.80]) {
    for (const z of [-2.77, -2.12]) {
      cylinder(scene, `art1h-bedroom-reading-chair-leg-${x}-${z}`, .10, .34, new Vector3(offsetX + x, .20, z), palette.wood, root, details, 9);
    }
  }

  cylinder(scene, "art1h-bedroom-mobile-ceiling", .20, .05, new Vector3(offsetX + .20, 3.75, -.65), palette.navy, root, details, 14);
  cylinder(scene, "art1h-bedroom-mobile-string", .025, .78, new Vector3(offsetX + .20, 3.35, -.65), palette.metal, root, details, 8);
  const ring = torus(scene, "art1h-bedroom-mobile-ring", .72, .035, new Vector3(offsetX + .20, 2.95, -.65), palette.woodLight, root, details);
  ring.rotation.x = Math.PI / 2;
  mobilePieces.push(ring);
  for (let index = 0; index < 5; index += 1) {
    const angle = index / 5 * Math.PI * 2;
    const star = MeshBuilder.CreatePolyhedron(`art1h-bedroom-mobile-star-${index}`, { type: 1, size: .14 }, scene);
    star.position.set(offsetX + .20 + Math.cos(angle) * .30, 2.70 - (index % 2) * .13, -.65 + Math.sin(angle) * .30);
    star.material = index % 2 ? palette.mustard : palette.coral;
    decorate(star, root, details);
    mobilePieces.push(star);
  }
}

function addDeskWardrobeAndStorage(
  scene: Scene,
  offsetX: number,
  palette: BedroomPalette,
  root: TransformNode,
  details: Mesh[],
  plantLeaves: Mesh[],
): void {
  contactShadow(scene, "art1h-bedroom-desk-shadow", new Vector3(offsetX + 3.80, .014, 2.84), 1.30, .62, palette, root, details);
  rounded(scene, "art1h-bedroom-desk-top", new Vector3(2.34, .18, .96), new Vector3(offsetX + 3.80, 1.08, 2.84), .12, palette.woodLight, root, details);
  rounded(scene, "art1h-bedroom-desk-left-pedestal", new Vector3(.58, .98, .78), new Vector3(offsetX + 3.05, .52, 2.84), .10, palette.wood, root, details);
  for (const y of [.28, .58, .86]) {
    rounded(scene, `art1h-bedroom-desk-drawer-${y}`, new Vector3(.44, .22, .055), new Vector3(offsetX + 3.05, y, 2.42), .04, palette.mint, root, details);
    sphere(scene, `art1h-bedroom-desk-drawer-knob-${y}`, .075, new Vector3(offsetX + 3.05, y, 2.37), Vector3.One(), palette.metal, root, details, 8);
  }
  for (const x of [4.35, 4.72]) {
    cylinder(scene, `art1h-bedroom-desk-leg-${x}`, .12, 1.0, new Vector3(offsetX + x, .52, 2.84), palette.wood, root, details, 10);
  }
  rounded(scene, "art1h-bedroom-chair-seat", new Vector3(.92, .22, .82), new Vector3(offsetX + 3.80, .62, 1.93), .16, palette.teal, root, details);
  rounded(scene, "art1h-bedroom-chair-back", new Vector3(.92, .92, .22), new Vector3(offsetX + 3.80, 1.11, 2.24), .16, palette.teal, root, details);
  sphere(scene, "art1h-bedroom-chair-cushion", .58, new Vector3(offsetX + 3.80, .79, 1.92), new Vector3(1.15, .36, .95), palette.blush, root, details);
  rounded(scene, "art1h-bedroom-notebook", new Vector3(.78, .08, .56), new Vector3(offsetX + 3.55, 1.20, 2.80), .04, palette.coral, root, details);
  box(scene, "art1h-bedroom-pencil", new Vector3(.06, .06, .64), new Vector3(offsetX + 4.08, 1.23, 2.78), palette.mustard, root, details).rotation.y = .25;

  const lampStem = cylinder(scene, "art1h-bedroom-desk-lamp-stem", .07, .56, new Vector3(offsetX + 4.45, 1.47, 2.88), palette.metal, root, details, 10);
  lampStem.rotation.z = -.34;
  const lampShade = MeshBuilder.CreateCylinder(
    "art1h-bedroom-desk-lamp-shade",
    { diameterTop: .25, diameterBottom: .48, height: .36, tessellation: 16 },
    scene,
  );
  lampShade.position.set(offsetX + 4.30, 1.74, 2.88);
  lampShade.rotation.z = -.34;
  lampShade.material = palette.mustard;
  decorate(lampShade, root, details);

  contactShadow(scene, "art1h-bedroom-wardrobe-shadow", new Vector3(offsetX + 4.85, .014, -2.72), 1.06, .55, palette, root, details);
  rounded(scene, "art1h-bedroom-wardrobe-body", new Vector3(1.96, 2.98, .82), new Vector3(offsetX + 4.85, 1.50, -2.72), .14, palette.wood, root, details);
  rounded(scene, "art1h-bedroom-wardrobe-left-door", new Vector3(.84, 2.62, .07), new Vector3(offsetX + 4.39, 1.50, -3.16), .06, palette.mint, root, details);
  rounded(scene, "art1h-bedroom-wardrobe-right-door", new Vector3(.84, 2.62, .07), new Vector3(offsetX + 5.31, 1.50, -3.16), .06, palette.mint, root, details);
  for (const x of [4.39, 5.31]) {
    box(scene, `art1h-bedroom-wardrobe-door-inset-${x}`, new Vector3(.62, 2.12, .025), new Vector3(offsetX + x, 1.50, -3.205), palette.plaster, root, details);
    cylinder(scene, `art1h-bedroom-wardrobe-handle-${x}`, .07, .50, new Vector3(offsetX + x + (x < 4.85 ? .25 : -.25), 1.48, -3.25), palette.metal, root, details, 10);
  }
  box(scene, "art1h-bedroom-wardrobe-crown", new Vector3(2.10, .16, .92), new Vector3(offsetX + 4.85, 3.04, -2.72), palette.woodLight, root, details);

  rounded(scene, "art1h-bedroom-storage-body", new Vector3(2.42, 1.42, .80), new Vector3(offsetX + 1.00, .72, 3.14), .12, palette.woodLight, root, details);
  for (const x of [.46, 1.54]) {
    for (const y of [.39, 1.02]) {
      rounded(scene, `art1h-bedroom-storage-cubby-${x}-${y}`, new Vector3(.86, .46, .055), new Vector3(offsetX + x, y, 2.70), .05, (x + y) % 2 > 1 ? palette.blush : palette.teal, root, details);
    }
  }
  for (let index = 0; index < 5; index += 1) {
    box(scene, `art1h-bedroom-storage-book-${index}`, new Vector3(.12, .48 + index * .025, .32), new Vector3(offsetX + .58 + index * .15, 1.62 + index * .012, 3.12), index % 2 ? palette.mustard : palette.coral, root, details);
  }

  cylinder(scene, "art1h-bedroom-floor-plant-pot", .58, .48, new Vector3(offsetX + 5.25, .28, 2.65), palette.ceramic, root, details, 18);
  for (let index = 0; index < 9; index += 1) {
    const angle = index / 9 * Math.PI * 2;
    const leaf = sphere(
      scene,
      `art1h-bedroom-floor-plant-leaf-${index}`,
      .42,
      new Vector3(offsetX + 5.25 + Math.cos(angle) * .22, .72 + (index % 3) * .13, 2.65 + Math.sin(angle) * .16),
      new Vector3(.42, 1.28, .27),
      index % 2 ? palette.leafLight : palette.leaf,
      root,
      details,
      10,
    );
    leaf.rotation.z = Math.cos(angle) * .50;
    plantLeaves.push(leaf);
  }
}

function addPersonalDetails(
  scene: Scene,
  offsetX: number,
  palette: BedroomPalette,
  root: TransformNode,
  details: Mesh[],
  glowMeshes: Mesh[],
): void {
  box(scene, "art1h-bedroom-picture-ledge", new Vector3(2.40, .10, .24), new Vector3(offsetX + .90, 2.20, 3.58), palette.woodLight, root, details);
  for (const [index, x, width, height, art] of [
    [0, .15, .56, .70, palette.blush],
    [1, .90, .68, .54, palette.teal],
    [2, 1.68, .52, .74, palette.mustard],
  ] as const) {
    rounded(scene, `art1h-bedroom-frame-${index}`, new Vector3(width, height, .07), new Vector3(offsetX + x, 2.53 + (height - .54) * .35, 3.53), .04, palette.wood, root, details);
    rounded(scene, `art1h-bedroom-frame-art-${index}`, new Vector3(width - .12, height - .12, .018), new Vector3(offsetX + x, 2.53 + (height - .54) * .35, 3.48), .025, art, root, details);
  }

  box(scene, "art1h-bedroom-fairy-wire", new Vector3(4.25, .025, .025), new Vector3(offsetX - .10, 3.46, 3.67), palette.navy, root, details);
  for (let index = 0; index < 10; index += 1) {
    const light = sphere(
      scene,
      `art1h-bedroom-fairy-light-${index}`,
      .11,
      new Vector3(offsetX - 2.15 + index * .46, 3.37 - (index % 2) * .08, 3.63),
      Vector3.One(),
      index % 2 ? palette.blush : palette.glow,
      root,
      details,
      9,
    );
    glowMeshes.push(light);
  }

  cylinder(scene, "art1h-bedroom-laundry-basket", .68, .58, new Vector3(offsetX - 5.05, .32, -2.40), palette.woodLight, root, details, 18);
  for (let band = 0; band < 3; band += 1) {
    const weave = torus(scene, `art1h-bedroom-laundry-band-${band}`, .62 - band * .015, .022, new Vector3(offsetX - 5.05, .13 + band * .16, -2.40), palette.wood, root, details);
    weave.rotation.x = Math.PI / 2;
  }
  rounded(scene, "art1h-bedroom-slipper-left", new Vector3(.58, .14, .32), new Vector3(offsetX - 4.65, .10, -1.25), .11, palette.blush, root, details).rotation.y = -.22;
  rounded(scene, "art1h-bedroom-slipper-right", new Vector3(.58, .14, .32), new Vector3(offsetX - 4.05, .10, -1.15), .11, palette.blush, root, details).rotation.y = .12;

  const nightLight = sphere(scene, "art1h-bedroom-night-light", .34, new Vector3(offsetX - 1.42, 1.18, 1.34), new Vector3(1, 1.18, .88), palette.glow, root, details, 14);
  glowMeshes.push(nightLight);
  const lightPool = MeshBuilder.CreateDisc("art1h-bedroom-night-light-pool", { radius: 1, tessellation: 30 }, scene);
  lightPool.rotation.x = Math.PI / 2;
  lightPool.position.set(offsetX - 1.25, .018, 1.25);
  lightPool.scaling.set(.82, .56, 1);
  lightPool.material = palette.glow;
  decorate(lightPool, root, details);
  glowMeshes.push(lightPool);
}

/**
 * High-quality visual-only bedroom pass. Existing bed, lamp, music-box,
 * wardrobe, storage, seat, and walkable meshes remain the gameplay authority.
 */
export function applyBedroomHighPolish(scene: Scene, offsetX: number): Mesh[] {
  const root = new TransformNode("art1h-bedroom-high-polish", scene);
  const details: Mesh[] = [];
  const palette = createPalette(scene);
  const curtains: Mesh[] = [];
  const plantLeaves: Mesh[] = [];
  const mobilePieces: Mesh[] = [];
  const glowMeshes: Mesh[] = [];

  addArchitecture(scene, offsetX, palette, root, details);
  addWindowAndCurtains(scene, offsetX, palette, root, details, curtains);
  addBedSuite(scene, offsetX, palette, root, details);
  addRugAndReadingCorner(scene, offsetX, palette, root, details, mobilePieces);
  addDeskWardrobeAndStorage(scene, offsetX, palette, root, details, plantLeaves);
  addPersonalDetails(scene, offsetX, palette, root, details, glowMeshes);

  const curtainBase = curtains.map((mesh) => mesh.rotation.z);
  const leafBase = plantLeaves.map((mesh) => mesh.rotation.z);
  const mobileBase = mobilePieces.map((mesh) => mesh.rotation.y);
  const glowBase = glowMeshes.map((mesh) => mesh.scaling.clone());
  let elapsed = 0;
  scene.onBeforeRenderObservable.add(() => {
    const visible = details[0]?.isEnabled() ?? false;
    if (!visible) return;
    elapsed += Math.min(scene.getEngine().getDeltaTime(), 50) / 1000;

    for (const [index, curtain] of curtains.entries()) {
      curtain.rotation.z = curtainBase[index] + Math.sin(elapsed * .52 + index * .72) * .011;
    }
    for (const [index, leaf] of plantLeaves.entries()) {
      leaf.rotation.z = leafBase[index] + Math.sin(elapsed * .66 + index * .55) * .018;
    }
    for (const [index, piece] of mobilePieces.entries()) {
      piece.rotation.y = mobileBase[index] + elapsed * (.09 + index * .003);
    }
    for (const [index, glow] of glowMeshes.entries()) {
      const pulse = 1 + Math.sin(elapsed * .85 + index * .55) * .035;
      glow.scaling.copyFrom(glowBase[index]).scaleInPlace(pulse);
    }
    palette.glow.alpha = .68 + Math.sin(elapsed * .82) * .035;
  });

  return details;
}
