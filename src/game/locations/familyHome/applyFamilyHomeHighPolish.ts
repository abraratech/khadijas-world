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
import { roundedFootprint } from "./homeVisualHelpers";

interface HomeHighPalette {
  plaster: StandardMaterial;
  trim: StandardMaterial;
  blush: StandardMaterial;
  coral: StandardMaterial;
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
  screen: StandardMaterial;
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

function createPalette(scene: Scene): HomeHighPalette {
  const shadow = createMaterial(scene, "art1g-home-shadow", new Color3(.05, .03, .05), undefined, "shadow");
  shadow.alpha = .12;
  const screen = createMaterial(
    scene,
    "art1g-home-screen",
    new Color3(.18, .38, .52),
    new Color3(.04, .10, .14),
    "glass",
  );
  const glow = translucent(
    scene,
    "art1g-home-glow",
    new Color3(1, .78, .42),
    .72,
    new Color3(.22, .12, .025),
  );
  return {
    plaster: createMaterial(scene, "art1g-home-plaster", new Color3(.965, .90, .80), undefined, "matte"),
    trim: createMaterial(scene, "art1g-home-trim", new Color3(.995, .965, .89), undefined, "ceramic"),
    blush: createMaterial(scene, "art1g-home-blush", new Color3(.96, .58, .65), undefined, "fabric"),
    coral: createMaterial(scene, "art1g-home-coral", new Color3(.91, .34, .44), undefined, "soft-toy"),
    teal: createMaterial(scene, "art1g-home-teal", new Color3(.10, .48, .47), undefined, "fabric"),
    mint: createMaterial(scene, "art1g-home-mint", new Color3(.52, .77, .66), undefined, "fabric"),
    mustard: createMaterial(scene, "art1g-home-mustard", new Color3(.95, .66, .18), undefined, "soft-toy"),
    navy: createMaterial(scene, "art1g-home-navy", new Color3(.10, .15, .24), undefined, "soft-toy"),
    sky: createMaterial(scene, "art1g-home-sky", new Color3(.48, .76, .91), new Color3(.06, .11, .14), "matte"),
    cloud: createMaterial(scene, "art1g-home-cloud", new Color3(.99, .98, .94), new Color3(.035, .035, .03), "matte"),
    leaf: createMaterial(scene, "art1g-home-leaf", new Color3(.20, .49, .25), undefined, "soft-toy"),
    leafLight: createMaterial(scene, "art1g-home-leaf-light", new Color3(.43, .67, .32), undefined, "soft-toy"),
    wood: createMaterial(scene, "art1g-home-wood", new Color3(.48, .25, .12), undefined, "wood"),
    woodLight: createMaterial(scene, "art1g-home-wood-light", new Color3(.75, .49, .26), undefined, "wood"),
    ceramic: createMaterial(scene, "art1g-home-ceramic", new Color3(.985, .95, .86), undefined, "ceramic"),
    glass: translucent(scene, "art1g-home-glass", new Color3(.62, .84, .92), .38, new Color3(.025, .06, .07)),
    metal: createMaterial(scene, "art1g-home-metal", new Color3(.64, .68, .68), undefined, "metal"),
    screen,
    glow,
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
    artPass: "art1g-home",
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
  const mesh = MeshBuilder.CreateBox(name, {
    width: size.x,
    height: size.y,
    depth: size.z,
  }, scene);
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

function addWallArchitecture(
  scene: Scene,
  palette: HomeHighPalette,
  root: TransformNode,
  details: Mesh[],
): void {
  // Crown moulding and a shallow wainscot make the room feel built rather than painted.
  box(scene, "art1g-home-crown-back", new Vector3(11.75, .18, .18), new Vector3(0, 4.0, 3.77), palette.trim, root, details);
  box(scene, "art1g-home-crown-left", new Vector3(.18, .18, 7.55), new Vector3(-5.77, 4.0, 0), palette.trim, root, details);
  box(scene, "art1g-home-chair-rail-back", new Vector3(11.72, .10, .12), new Vector3(0, 1.18, 3.78), palette.woodLight, root, details);
  box(scene, "art1g-home-chair-rail-left", new Vector3(.12, .10, 7.55), new Vector3(-5.78, 1.18, 0), palette.woodLight, root, details);

  for (const x of [-5.20, -4.05, -2.90, -1.75, -.60, .55]) {
    box(scene, `art1g-home-wall-panel-${x}`, new Vector3(.96, .76, .035), new Vector3(x, .66, 3.76), palette.plaster, root, details);
    box(scene, `art1g-home-wall-panel-top-${x}`, new Vector3(.96, .045, .055), new Vector3(x, 1.03, 3.73), palette.trim, root, details);
    box(scene, `art1g-home-wall-panel-bottom-${x}`, new Vector3(.96, .045, .055), new Vector3(x, .29, 3.73), palette.trim, root, details);
    box(scene, `art1g-home-wall-panel-left-${x}`, new Vector3(.045, .76, .055), new Vector3(x - .46, .66, 3.73), palette.trim, root, details);
    box(scene, `art1g-home-wall-panel-right-${x}`, new Vector3(.045, .76, .055), new Vector3(x + .46, .66, 3.73), palette.trim, root, details);
  }

  // A layered trim treatment visually separates the kitchen without adding a collision.
  box(scene, "art1g-home-divider-trim", new Vector3(.18, 3.42, 3.62), new Vector3(1.19, 1.62, 2.23), palette.trim, root, details);
  box(scene, "art1g-home-divider-inset", new Vector3(.205, 2.82, 3.05), new Vector3(1.18, 1.64, 2.20), palette.plaster, root, details);
  box(scene, "art1g-home-divider-cap", new Vector3(.25, .18, 3.70), new Vector3(1.18, 3.34, 2.22), palette.woodLight, root, details);
}

function addWindowStory(
  scene: Scene,
  palette: HomeHighPalette,
  root: TransformNode,
  details: Mesh[],
  animatedCurtains: Mesh[],
): void {
  // The existing window receives a miniature outside scene and deeper trim.
  box(scene, "art1g-home-window-sky", new Vector3(3.02, 1.62, .035), new Vector3(-3.05, 2.56, 3.81), palette.sky, root, details);
  sphere(scene, "art1g-home-window-sun", .43, new Vector3(-3.92, 3.00, 3.80), Vector3.One(), palette.mustard, root, details);
  for (const [index, x, y, scale] of [
    [0, -2.75, 3.03, .78],
    [1, -2.40, 2.87, .62],
    [2, -3.55, 2.36, .54],
  ] as const) {
    sphere(scene, `art1g-home-window-cloud-${index}`, .45, new Vector3(x, y, 3.79), new Vector3(scale * 1.5, scale * .58, .20), palette.cloud, root, details);
  }
  box(scene, "art1g-home-window-sill", new Vector3(3.46, .16, .34), new Vector3(-3.05, 1.54, 3.58), palette.trim, root, details);
  box(scene, "art1g-home-window-inner-top", new Vector3(3.50, .10, .30), new Vector3(-3.05, 3.55, 3.58), palette.trim, root, details);

  for (const [side, x, tilt] of [["left", -4.51, .035], ["right", -1.59, -.035]] as const) {
    for (let fold = 0; fold < 4; fold += 1) {
      const curtain = rounded(
        scene,
        `art1g-home-curtain-${side}-fold-${fold}`,
        new Vector3(.17, 2.03 - fold * .035, .20),
        new Vector3(x + (side === "left" ? fold : -fold) * .115, 2.50, 3.47 - fold * .015),
        .075,
        fold % 2 ? palette.mustard : palette.blush,
        root,
        details,
      );
      curtain.rotation.z = tilt + (side === "left" ? fold : -fold) * .006;
      animatedCurtains.push(curtain);
    }
  }

  // Tiny sill plants add a readable domestic silhouette.
  for (const [index, x] of [-3.48, -2.65].entries()) {
    cylinder(scene, `art1g-home-sill-pot-${index}`, .28, .24, new Vector3(x, 1.75, 3.45), index ? palette.teal : palette.coral, root, details, 14);
    for (let leaf = 0; leaf < 4; leaf += 1) {
      const angle = leaf / 4 * Math.PI * 2;
      const leafMesh = sphere(
        scene,
        `art1g-home-sill-leaf-${index}-${leaf}`,
        .20,
        new Vector3(x + Math.cos(angle) * .09, 1.95 + (leaf % 2) * .08, 3.44 + Math.sin(angle) * .06),
        new Vector3(.42, 1.10, .28),
        leaf % 2 ? palette.leafLight : palette.leaf,
        root,
        details,
        9,
      );
      leafMesh.rotation.z = Math.cos(angle) * .40;
    }
  }
}

function addLivingRoomLayering(
  scene: Scene,
  palette: HomeHighPalette,
  root: TransformNode,
  details: Mesh[],
): void {
  // Sofa piping, tufting and a draped throw keep the existing playable sofa readable.
  for (const [name, x] of [["left", -4.78], ["right", -1.72]] as const) {
    const piping = torus(scene, `art1g-home-sofa-arm-piping-${name}`, .84, .035, new Vector3(x, .92, .28), palette.mint, root, details);
    piping.rotation.x = Math.PI / 2;
    piping.scaling.set(.55, 1, 1.20);
  }
  for (const x of [-4.17, -3.25, -2.33]) {
    for (const y of [1.03, 1.30]) {
      sphere(scene, `art1g-home-sofa-tuft-${x}-${y}`, .10, new Vector3(x, y, .60), Vector3.One(), palette.mustard, root, details, 9);
    }
  }
  const throwBlanket = rounded(
    scene,
    "art1g-home-sofa-throw",
    new Vector3(.84, .055, 1.12),
    new Vector3(-3.30, .86, .28),
    .025,
    palette.blush,
    root,
    details,
  );
  throwBlanket.rotation.z = -.07;
  for (let stripe = 0; stripe < 4; stripe += 1) {
    box(scene, `art1g-home-throw-stripe-${stripe}`, new Vector3(.055, .022, .96), new Vector3(-3.56 + stripe * .18, .895, .27), palette.coral, root, details).rotation.z = -.07;
  }

  // Coffee-table shelf and curated story objects create a focal cluster.
  rounded(scene, "art1g-home-coffee-lower-shelf", new Vector3(1.88, .09, .92), new Vector3(-2.60, .32, -1.80), .07, palette.wood, root, details);
  rounded(scene, "art1g-home-coffee-tray", new Vector3(.92, .055, .56), new Vector3(-2.30, .82, -1.72), .08, palette.coral, root, details);
  for (const [index, y, material] of [
    [0, .79, palette.mustard],
    [1, .84, palette.teal],
    [2, .89, palette.blush],
  ] as const) {
    rounded(scene, `art1g-home-coffee-book-${index}`, new Vector3(.62, .07, .38), new Vector3(-3.05, y, -1.84), .025, material, root, details);
  }
  cylinder(scene, "art1g-home-coffee-vase", .28, .42, new Vector3(-2.22, 1.02, -1.72), palette.ceramic, root, details, 18);
  for (let index = 0; index < 5; index += 1) {
    const angle = index / 5 * Math.PI * 2;
    cylinder(scene, `art1g-home-flower-stem-${index}`, .025, .38, new Vector3(-2.22 + Math.cos(angle) * .08, 1.30, -1.72 + Math.sin(angle) * .08), palette.leaf, root, details, 8);
    sphere(scene, `art1g-home-flower-head-${index}`, .17, new Vector3(-2.22 + Math.cos(angle) * .15, 1.48 + (index % 2) * .05, -1.72 + Math.sin(angle) * .12), Vector3.One(), index % 2 ? palette.blush : palette.mustard, root, details, 9);
  }

  // Media console hardware and layered screen content.
  for (const x of [-4.93, -4.17]) {
    cylinder(scene, `art1g-home-console-knob-${x}`, .10, .07, new Vector3(x, .36, -2.78), palette.metal, root, details, 12).rotation.x = Math.PI / 2;
  }
  for (const x of [-5.32, -3.78]) {
    const speaker = rounded(scene, `art1g-home-tv-speaker-${x}`, new Vector3(.30, .72, .24), new Vector3(x, .91, -2.55), .07, palette.navy, root, details);
    for (const y of [.72, 1.03]) {
      const grille = torus(scene, `art1g-home-tv-speaker-ring-${x}-${y}`, .17, .022, new Vector3(x, y, -2.70), palette.metal, root, details);
      grille.rotation.x = Math.PI / 2;
    }
    void speaker;
  }
  rounded(scene, "art1g-home-tv-screen-inset", new Vector3(1.42, .72, .018), new Vector3(-4.55, 1.18, -2.755), .04, palette.screen, root, details);
  sphere(scene, "art1g-home-tv-story-sun", .22, new Vector3(-4.98, 1.44, -2.78), Vector3.One(), palette.mustard, root, details, 12);
  for (const [index, x, y, material] of [
    [0, -4.62, 1.04, palette.mint],
    [1, -4.28, 1.02, palette.blush],
    [2, -4.43, 1.34, palette.cloud],
  ] as const) {
    sphere(scene, `art1g-home-tv-story-shape-${index}`, .29, new Vector3(x, y, -2.79), new Vector3(1.18, .72, .12), material, root, details, 10);
  }
}

function addKitchenLayering(
  scene: Scene,
  palette: HomeHighPalette,
  root: TransformNode,
  details: Mesh[],
  steam: Mesh[],
): void {
  // Cabinet toe kicks and shaker-style rails add depth to broad flat faces.
  box(scene, "art1g-home-counter-toe-kick", new Vector3(3.82, .14, .12), new Vector3(4.12, .10, 2.58), palette.navy, root, details);
  box(scene, "art1g-home-island-toe-kick", new Vector3(2.80, .14, .10), new Vector3(3.50, .10, -.19), palette.navy, root, details);
  for (const x of [3.0, 3.75, 4.5, 5.25]) {
    for (const dx of [-.27, .27]) {
      box(scene, `art1g-home-cabinet-rail-${x}-${dx}`, new Vector3(.045, .58, .035), new Vector3(x + dx, .55, 2.575), palette.trim, root, details);
    }
    for (const y of [.29, .81]) {
      box(scene, `art1g-home-cabinet-stile-${x}-${y}`, new Vector3(.50, .045, .035), new Vector3(x, y, 2.575), palette.trim, root, details);
    }
  }

  // An integrated oven and hob introduce a darker focal break in the mint kitchen.
  rounded(scene, "art1g-home-oven", new Vector3(.92, .80, .08), new Vector3(5.24, .56, 2.56), .07, palette.navy, root, details);
  rounded(scene, "art1g-home-oven-window", new Vector3(.69, .43, .025), new Vector3(5.24, .51, 2.505), .05, palette.glass, root, details);
  box(scene, "art1g-home-oven-handle", new Vector3(.60, .055, .055), new Vector3(5.24, .82, 2.48), palette.metal, root, details);
  for (const x of [4.94, 5.14, 5.34, 5.54]) {
    cylinder(scene, `art1g-home-oven-knob-${x}`, .10, .05, new Vector3(x, .91, 2.48), palette.metal, root, details, 12).rotation.x = Math.PI / 2;
  }
  for (const x of [4.95, 5.48]) {
    for (const z of [2.91, 3.35]) {
      const burner = torus(scene, `art1g-home-hob-${x}-${z}`, .30, .035, new Vector3(x, 1.17, z), palette.navy, root, details);
      burner.rotation.x = Math.PI / 2;
    }
  }

  // Under-cabinet light strips are emissive geometry, not dynamic lights.
  for (const x of [2.72, 3.58, 4.44, 5.30]) {
    box(scene, `art1g-home-under-cabinet-glow-${x}`, new Vector3(.70, .035, .09), new Vector3(x, 1.59, 3.66), palette.glow, root, details);
  }

  // Kettle, board, fruit bowl and stacked crockery give the counter a lived-in story.
  sphere(scene, "art1g-home-kettle-body", .52, new Vector3(3.06, 1.37, 3.15), new Vector3(1, .80, .90), palette.coral, root, details, 16);
  cylinder(scene, "art1g-home-kettle-lid", .28, .08, new Vector3(3.06, 1.62, 3.15), palette.navy, root, details, 14);
  const kettleHandle = torus(scene, "art1g-home-kettle-handle", .56, .055, new Vector3(3.06, 1.48, 3.30), palette.navy, root, details);
  kettleHandle.rotation.x = Math.PI / 2;
  const spout = MeshBuilder.CreateCylinder("art1g-home-kettle-spout", { diameterTop: .11, diameterBottom: .22, height: .42, tessellation: 12 }, scene);
  spout.position.set(3.38, 1.43, 3.15);
  spout.rotation.z = -1.05;
  spout.material = palette.coral;
  decorate(spout, root, details);

  for (let index = 0; index < 3; index += 1) {
    const puffMaterial = translucent(scene, `art1g-home-steam-material-${index}`, new Color3(.98, .98, .94), .40 - index * .08);
    const puff = sphere(scene, `art1g-home-kettle-steam-${index}`, .22, new Vector3(3.45 + index * .035, 1.77 + index * .20, 3.15), new Vector3(.75, 1.20, .50), puffMaterial, root, details, 10);
    steam.push(puff);
  }

  rounded(scene, "art1g-home-chopping-board", new Vector3(.76, .055, .48), new Vector3(4.52, 1.19, 3.18), .06, palette.woodLight, root, details);
  cylinder(scene, "art1g-home-fruit-bowl", .62, .16, new Vector3(3.58, 1.26, .60), palette.ceramic, root, details, 20);
  for (const [index, x, z, material] of [
    [0, 3.42, .57, palette.coral],
    [1, 3.60, .50, palette.mustard],
    [2, 3.76, .63, palette.leafLight],
    [3, 3.56, .71, palette.blush],
  ] as const) {
    sphere(scene, `art1g-home-fruit-${index}`, .23, new Vector3(x, 1.42, z), Vector3.One(), material, root, details, 10);
  }
  for (let index = 0; index < 3; index += 1) {
    cylinder(scene, `art1g-home-plate-stack-${index}`, .44, .035, new Vector3(4.46, 1.22 + index * .04, .70), palette.ceramic, root, details, 18);
  }

  // Pendant ceiling roses and soft floor pools improve lighting composition at High.
  for (const x of [3.25, 4.25]) {
    cylinder(scene, `art1g-home-pendant-ceiling-${x}`, .24, .06, new Vector3(x, 3.74, .25), palette.navy, root, details, 16);
    const pool = MeshBuilder.CreateDisc(`art1g-home-light-pool-${x}`, { radius: 1, tessellation: 32 }, scene);
    pool.rotation.x = Math.PI / 2;
    pool.position.set(x, .018, .28);
    pool.scaling.set(.92, .62, 1);
    pool.material = palette.glow;
    decorate(pool, root, details);
  }
}

function addStyledDetails(
  scene: Scene,
  palette: HomeHighPalette,
  root: TransformNode,
  details: Mesh[],
  clockHands: Mesh[],
  plantLeaves: Mesh[],
): void {
  // A clock and picture ledge fill the previously empty central wall area.
  cylinder(scene, "art1g-home-clock-face", .74, .08, new Vector3(.15, 2.83, 3.68), palette.ceramic, root, details, 24).rotation.x = Math.PI / 2;
  const clockRim = torus(scene, "art1g-home-clock-rim", .78, .045, new Vector3(.15, 2.83, 3.62), palette.wood, root, details);
  clockRim.rotation.x = Math.PI / 2;
  for (let index = 0; index < 12; index += 1) {
    const angle = index / 12 * Math.PI * 2;
    sphere(scene, `art1g-home-clock-dot-${index}`, .055, new Vector3(.15 + Math.sin(angle) * .28, 2.83 + Math.cos(angle) * .28, 3.57), Vector3.One(), palette.navy, root, details, 8);
  }
  const hour = box(scene, "art1g-home-clock-hour", new Vector3(.035, .19, .025), new Vector3(.15, 2.92, 3.54), palette.navy, root, details);
  hour.setPivotPoint(new Vector3(0, -.095, 0));
  const minute = box(scene, "art1g-home-clock-minute", new Vector3(.025, .27, .02), new Vector3(.15, 2.96, 3.53), palette.coral, root, details);
  minute.setPivotPoint(new Vector3(0, -.135, 0));
  clockHands.push(hour, minute);

  box(scene, "art1g-home-picture-ledge", new Vector3(2.65, .10, .24), new Vector3(-.98, 2.03, 3.60), palette.woodLight, root, details);
  for (const [index, x, width, height, art] of [
    [0, -1.72, .55, .68, palette.blush],
    [1, -.98, .68, .52, palette.mint],
    [2, -.22, .48, .72, palette.mustard],
  ] as const) {
    rounded(scene, `art1g-home-photo-frame-${index}`, new Vector3(width, height, .07), new Vector3(x, 2.33 + (height - .52) * .40, 3.55), .04, palette.wood, root, details);
    rounded(scene, `art1g-home-photo-art-${index}`, new Vector3(width - .12, height - .12, .018), new Vector3(x, 2.33 + (height - .52) * .40, 3.50), .025, art, root, details);
  }

  // A woven basket and floor plant create foreground depth without blocking play.
  cylinder(scene, "art1g-home-basket", .62, .44, new Vector3(-5.18, .26, -.15), palette.woodLight, root, details, 18);
  for (let band = 0; band < 3; band += 1) {
    const weave = torus(scene, `art1g-home-basket-band-${band}`, .56 - band * .02, .025, new Vector3(-5.18, .12 + band * .13, -.15), palette.wood, root, details);
    weave.rotation.x = Math.PI / 2;
  }
  cylinder(scene, "art1g-home-plant-pot-high", .58, .52, new Vector3(-5.18, .30, 2.82), palette.ceramic, root, details, 18);
  for (let index = 0; index < 10; index += 1) {
    const angle = index / 10 * Math.PI * 2;
    const leaf = sphere(
      scene,
      `art1g-home-large-plant-leaf-${index}`,
      .46,
      new Vector3(-5.18 + Math.cos(angle) * .24, .78 + (index % 3) * .15, 2.82 + Math.sin(angle) * .18),
      new Vector3(.42, 1.35, .26),
      index % 2 ? palette.leafLight : palette.leaf,
      root,
      details,
      10,
    );
    leaf.rotation.z = Math.cos(angle) * .52;
    plantLeaves.push(leaf);
  }
}

/**
 * High-quality visual-only pass for the family home. All meshes are added to
 * the shared decorative detail collection, so Low and Adaptive can disable the
 * entire pass without touching collisions, seats, hotspots, items, or saves.
 */
export function applyFamilyHomeHighPolish(scene: Scene): Mesh[] {
  const root = new TransformNode("art1g-family-home-high-polish", scene);
  const details: Mesh[] = [];
  const palette = createPalette(scene);
  const animatedCurtains: Mesh[] = [];
  const steam: Mesh[] = [];
  const clockHands: Mesh[] = [];
  const plantLeaves: Mesh[] = [];

  addWallArchitecture(scene, palette, root, details);
  addWindowStory(scene, palette, root, details, animatedCurtains);
  addLivingRoomLayering(scene, palette, root, details);
  addKitchenLayering(scene, palette, root, details, steam);
  addStyledDetails(scene, palette, root, details, clockHands, plantLeaves);

  const curtainBaseRotations = animatedCurtains.map((mesh) => mesh.rotation.z);
  const leafBaseRotations = plantLeaves.map((mesh) => mesh.rotation.z);
  let elapsed = 0;
  scene.onBeforeRenderObservable.add(() => {
    const visible = details[0]?.isEnabled() ?? false;
    if (!visible) return;
    elapsed += Math.min(scene.getEngine().getDeltaTime(), 50) / 1000;

    for (const [index, curtain] of animatedCurtains.entries()) {
      curtain.rotation.z = curtainBaseRotations[index] + Math.sin(elapsed * .55 + index * .8) * .012;
    }
    for (const [index, puff] of steam.entries()) {
      const phase = (elapsed * .26 + index * .31) % 1;
      puff.position.y = 1.74 + phase * .72;
      puff.position.x = 3.43 + Math.sin(elapsed * 1.2 + index) * .045;
      puff.scaling.set(.62 + phase * .38, .85 + phase * .70, .45 + phase * .30);
      puff.visibility = Math.max(0, .68 - phase * .55);
    }
    if (clockHands.length === 2) {
      clockHands[0].rotation.z = -elapsed * .025;
      clockHands[1].rotation.z = -elapsed * .20;
    }
    for (const [index, leaf] of plantLeaves.entries()) {
      leaf.rotation.z = leafBaseRotations[index] + Math.sin(elapsed * .70 + index * .55) * .018;
    }
    palette.glow.alpha = .68 + Math.sin(elapsed * .85) * .035;
  });

  return details;
}
