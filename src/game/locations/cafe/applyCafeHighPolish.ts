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

interface CafePalette {
  plaster: StandardMaterial;
  trim: StandardMaterial;
  coral: StandardMaterial;
  blush: StandardMaterial;
  teal: StandardMaterial;
  mint: StandardMaterial;
  mustard: StandardMaterial;
  navy: StandardMaterial;
  wood: StandardMaterial;
  woodLight: StandardMaterial;
  ceramic: StandardMaterial;
  metal: StandardMaterial;
  glass: StandardMaterial;
  leaf: StandardMaterial;
  glow: StandardMaterial;
  shadow: StandardMaterial;
  pastryCream: StandardMaterial;
  pastryBerry: StandardMaterial;
  pastryChocolate: StandardMaterial;
}

function translucent(
  scene: Scene,
  name: string,
  diffuse: Color3,
  alpha: number,
  emissive?: Color3,
): StandardMaterial {
  const material = createMaterial(scene, name, diffuse, emissive, "soft-toy");
  material.alpha = alpha;
  material.backFaceCulling = false;
  return material;
}

function createPalette(scene: Scene): CafePalette {
  const shadow = createMaterial(scene, "art1i-cafe-shadow", new Color3(.05, .03, .04), undefined, "shadow");
  shadow.alpha = .13;
  return {
    plaster: createMaterial(scene, "art1i-cafe-plaster", new Color3(.96, .89, .79), undefined, "matte"),
    trim: createMaterial(scene, "art1i-cafe-trim", new Color3(.995, .97, .91), undefined, "ceramic"),
    coral: createMaterial(scene, "art1i-cafe-coral", new Color3(.92, .38, .49), undefined, "soft-toy"),
    blush: createMaterial(scene, "art1i-cafe-blush", new Color3(.96, .63, .69), undefined, "fabric"),
    teal: createMaterial(scene, "art1i-cafe-teal", new Color3(.12, .52, .52), undefined, "soft-toy"),
    mint: createMaterial(scene, "art1i-cafe-mint", new Color3(.56, .79, .70), undefined, "soft-toy"),
    mustard: createMaterial(scene, "art1i-cafe-mustard", new Color3(.96, .69, .20), undefined, "soft-toy"),
    navy: createMaterial(scene, "art1i-cafe-navy", new Color3(.10, .15, .24), undefined, "soft-toy"),
    wood: createMaterial(scene, "art1i-cafe-wood", new Color3(.49, .27, .14), undefined, "wood"),
    woodLight: createMaterial(scene, "art1i-cafe-wood-light", new Color3(.76, .52, .29), undefined, "wood"),
    ceramic: createMaterial(scene, "art1i-cafe-ceramic", new Color3(.99, .96, .88), undefined, "ceramic"),
    metal: createMaterial(scene, "art1i-cafe-metal", new Color3(.67, .72, .74), undefined, "metal"),
    glass: translucent(scene, "art1i-cafe-glass", new Color3(.64, .87, .94), .29, new Color3(.02, .05, .06)),
    leaf: createMaterial(scene, "art1i-cafe-leaf", new Color3(.24, .55, .31), undefined, "soft-toy"),
    glow: translucent(scene, "art1i-cafe-glow", new Color3(1, .78, .39), .68, new Color3(.20, .11, .02)),
    shadow,
    pastryCream: createMaterial(scene, "art1i-cafe-pastry-cream", new Color3(.95, .77, .49), undefined, "fabric"),
    pastryBerry: createMaterial(scene, "art1i-cafe-pastry-berry", new Color3(.78, .18, .35), undefined, "soft-toy"),
    pastryChocolate: createMaterial(scene, "art1i-cafe-pastry-chocolate", new Color3(.29, .12, .07), undefined, "fabric"),
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
    artPass: "art1i-cafe",
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
  tessellation = 18,
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
  palette: CafePalette,
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
  palette: CafePalette,
  root: TransformNode,
  details: Mesh[],
): void {
  box(scene, "art1i-cafe-crown-back", new Vector3(11.72, .18, .18), new Vector3(offsetX, 4.0, 3.77), palette.trim, root, details);
  box(scene, "art1i-cafe-crown-left", new Vector3(.18, .18, 7.55), new Vector3(offsetX - 5.78, 4.0, 0), palette.trim, root, details);
  box(scene, "art1i-cafe-picture-rail", new Vector3(11.65, .08, .10), new Vector3(offsetX, 1.40, 3.77), palette.woodLight, root, details);

  for (const x of [-5.10, -4.05, -3.0, -1.95, -.90, .15]) {
    rounded(
      scene,
      `art1i-cafe-wall-panel-${x}`,
      new Vector3(.86, .72, .035),
      new Vector3(offsetX + x, .76, 3.75),
      .025,
      palette.plaster,
      root,
      details,
    );
    box(scene, `art1i-cafe-panel-cap-${x}`, new Vector3(.78, .035, .04), new Vector3(offsetX + x, 1.09, 3.72), palette.trim, root, details);
  }

  rounded(scene, "art1i-cafe-window-sill", new Vector3(3.48, .15, .42), new Vector3(offsetX - 3.45, 1.64, 3.48), .055, palette.trim, root, details);
  box(scene, "art1i-cafe-window-mullion-v", new Vector3(.08, 1.55, .07), new Vector3(offsetX - 3.45, 2.56, 3.60), palette.trim, root, details);
  box(scene, "art1i-cafe-window-mullion-h", new Vector3(2.70, .08, .07), new Vector3(offsetX - 3.45, 2.56, 3.60), palette.trim, root, details);

  rounded(scene, "art1i-cafe-sign-plaque", new Vector3(2.05, .58, .10), new Vector3(offsetX - .38, 3.25, 3.61), .08, palette.coral, root, details);
  cylinder(scene, "art1i-cafe-sign-cup", .34, .18, new Vector3(offsetX - .62, 3.24, 3.51), palette.ceramic, root, details, 18).rotation.x = Math.PI / 2;
  torus(scene, "art1i-cafe-sign-handle", .26, .045, new Vector3(offsetX - .42, 3.24, 3.51), palette.ceramic, root, details).rotation.y = Math.PI / 2;
  for (const [index, width] of [1.0, .72].entries()) {
    box(scene, `art1i-cafe-sign-line-${index}`, new Vector3(width, .055, .025), new Vector3(offsetX + .18, 3.34 - index * .18, 3.49), palette.ceramic, root, details);
  }
}

function addCounterAndWorkstation(
  scene: Scene,
  offsetX: number,
  palette: CafePalette,
  root: TransformNode,
  details: Mesh[],
  steamPuffs: Mesh[],
  glowMeshes: Mesh[],
): void {
  contactShadow(scene, "art1i-cafe-counter-shadow", new Vector3(offsetX + 3.42, .014, 1.95), 2.55, .88, palette, root, details);

  rounded(scene, "art1i-cafe-counter-fascia", new Vector3(4.22, .92, .16), new Vector3(offsetX + 3.40, .62, 1.31), .07, palette.teal, root, details);
  box(scene, "art1i-cafe-counter-kick", new Vector3(4.04, .16, .12), new Vector3(offsetX + 3.40, .16, 1.24), palette.navy, root, details);
  box(scene, "art1i-cafe-counter-lip", new Vector3(4.48, .12, 1.48), new Vector3(offsetX + 3.40, 1.25, 1.95), palette.ceramic, root, details);
  box(scene, "art1i-cafe-counter-gold-rail", new Vector3(3.70, .06, .08), new Vector3(offsetX + 3.40, .32, 1.18), palette.mustard, root, details);

  for (const x of [1.78, 2.58, 3.38, 4.18, 4.98]) {
    rounded(scene, `art1i-cafe-counter-panel-${x}`, new Vector3(.62, .56, .035), new Vector3(offsetX + x, .68, 1.20), .025, x === 3.38 ? palette.mint : palette.plaster, root, details);
    sphere(scene, `art1i-cafe-counter-knob-${x}`, .09, new Vector3(offsetX + x, .68, 1.16), Vector3.One(), palette.mustard, root, details, 10);
  }

  box(scene, "art1i-cafe-backsplash", new Vector3(4.0, 1.05, .08), new Vector3(offsetX + 3.50, 1.80, 3.60), palette.plaster, root, details);
  for (let column = 0; column < 8; column += 1) {
    for (let row = 0; row < 3; row += 1) {
      const tileMaterial = (column + row) % 3 === 0 ? palette.blush : (column + row) % 2 === 0 ? palette.mint : palette.trim;
      rounded(
        scene,
        `art1i-cafe-backsplash-tile-${column}-${row}`,
        new Vector3(.42, .24, .025),
        new Vector3(offsetX + 1.96 + column * .44, 1.50 + row * .27, 3.53),
        .018,
        tileMaterial,
        root,
        details,
      );
    }
  }

  rounded(scene, "art1i-cafe-machine-shell", new Vector3(1.34, 1.18, .82), new Vector3(offsetX + 2.10, 1.88, 3.20), .10, palette.navy, root, details);
  rounded(scene, "art1i-cafe-machine-face", new Vector3(1.05, .72, .055), new Vector3(offsetX + 2.10, 1.93, 2.76), .06, palette.metal, root, details);
  const machineScreen = rounded(scene, "art1i-cafe-machine-screen", new Vector3(.52, .28, .028), new Vector3(offsetX + 2.10, 2.18, 2.72), .04, palette.glow, root, details);
  glowMeshes.push(machineScreen);
  for (const x of [1.82, 2.38]) {
    cylinder(scene, `art1i-cafe-machine-spout-${x}`, .08, .25, new Vector3(offsetX + x, 1.74, 2.72), palette.metal, root, details, 10);
    cylinder(scene, `art1i-cafe-machine-cup-${x}`, .30, .34, new Vector3(offsetX + x, 1.47, 2.73), palette.ceramic, root, details, 18);
    torus(scene, `art1i-cafe-machine-cup-handle-${x}`, .24, .045, new Vector3(offsetX + x + .20, 1.49, 2.73), palette.ceramic, root, details).rotation.y = Math.PI / 2;
    const steam = sphere(
      scene,
      `art1i-cafe-steam-${x}`,
      .20,
      new Vector3(offsetX + x, 1.86, 2.72),
      new Vector3(.55, 1.25, .40),
      palette.glass,
      root,
      details,
      10,
    );
    steamPuffs.push(steam);
  }
  box(scene, "art1i-cafe-machine-drip-tray", new Vector3(.98, .08, .52), new Vector3(offsetX + 2.10, 1.31, 2.78), palette.metal, root, details);

  rounded(scene, "art1i-cafe-back-counter-front", new Vector3(3.56, .70, .16), new Vector3(offsetX + 3.50, .50, 2.94), .06, palette.coral, root, details);
  for (const x of [2.30, 3.10, 3.90, 4.70]) {
    rounded(scene, `art1i-cafe-back-cabinet-${x}`, new Vector3(.62, .52, .035), new Vector3(offsetX + x, .50, 2.84), .025, palette.plaster, root, details);
    sphere(scene, `art1i-cafe-back-knob-${x}`, .075, new Vector3(offsetX + x, .50, 2.79), Vector3.One(), palette.mustard, root, details, 8);
  }

  rounded(scene, "art1i-cafe-cup-shelf", new Vector3(2.05, .13, .40), new Vector3(offsetX + 4.25, 2.43, 3.40), .04, palette.woodLight, root, details);
  for (const [index, x] of [3.55, 3.92, 4.29, 4.66, 5.03].entries()) {
    cylinder(scene, `art1i-cafe-shelf-cup-${index}`, .25, .28, new Vector3(offsetX + x, 2.64, 3.35), index % 2 ? palette.blush : palette.ceramic, root, details, 16);
    torus(scene, `art1i-cafe-shelf-handle-${index}`, .18, .035, new Vector3(offsetX + x + .16, 2.64, 3.35), index % 2 ? palette.blush : palette.ceramic, root, details).rotation.y = Math.PI / 2;
  }
}

function addPastryDisplay(
  scene: Scene,
  offsetX: number,
  palette: CafePalette,
  root: TransformNode,
  details: Mesh[],
): void {
  contactShadow(scene, "art1i-cafe-display-shadow", new Vector3(offsetX + 4.70, .014, .55), 1.10, .72, palette, root, details);
  rounded(scene, "art1i-cafe-display-plinth", new Vector3(1.82, .68, 1.10), new Vector3(offsetX + 4.70, .45, .55), .08, palette.wood, root, details);
  box(scene, "art1i-cafe-display-kick", new Vector3(1.62, .13, .95), new Vector3(offsetX + 4.70, .13, .55), palette.navy, root, details);
  box(scene, "art1i-cafe-display-glass-front", new Vector3(1.63, 1.08, .045), new Vector3(offsetX + 4.70, 1.32, -.01), palette.glass, root, details);
  box(scene, "art1i-cafe-display-glass-top", new Vector3(1.63, .045, .95), new Vector3(offsetX + 4.70, 1.85, .55), palette.glass, root, details);
  for (const y of [1.02, 1.44]) {
    box(scene, `art1i-cafe-display-shelf-${y}`, new Vector3(1.45, .045, .80), new Vector3(offsetX + 4.70, y, .55), palette.glass, root, details);
  }

  const pastryMaterials = [palette.pastryCream, palette.pastryBerry, palette.pastryChocolate] as const;
  for (let shelf = 0; shelf < 2; shelf += 1) {
    for (let item = 0; item < 4; item += 1) {
      const x = offsetX + 4.18 + item * .35;
      const y = shelf === 0 ? 1.17 : 1.57;
      const base = cylinder(scene, `art1i-cafe-pastry-base-${shelf}-${item}`, .25, .13, new Vector3(x, y, .48), pastryMaterials[(shelf + item) % pastryMaterials.length], root, details, 16);
      base.rotation.y = item * .18;
      sphere(
        scene,
        `art1i-cafe-pastry-top-${shelf}-${item}`,
        .24,
        new Vector3(x, y + .12, .48),
        new Vector3(1, .55, 1),
        item % 2 ? palette.blush : palette.coral,
        root,
        details,
        10,
      );
      sphere(scene, `art1i-cafe-pastry-berry-${shelf}-${item}`, .075, new Vector3(x, y + .22, .48), Vector3.One(), palette.pastryBerry, root, details, 8);
    }
  }
}

function addSeatingAndStoryDetails(
  scene: Scene,
  offsetX: number,
  palette: CafePalette,
  root: TransformNode,
  details: Mesh[],
  swayingDecor: Mesh[],
): void {
  for (const [tableIndex, x] of [-3.50, -1.10].entries()) {
    contactShadow(scene, `art1i-cafe-table-shadow-${tableIndex}`, new Vector3(offsetX + x, .014, .95), .92, .74, palette, root, details);
    rounded(scene, `art1i-cafe-table-top-${tableIndex}`, new Vector3(1.42, .15, 1.08), new Vector3(offsetX + x, .95, .95), .16, palette.woodLight, root, details);
    cylinder(scene, `art1i-cafe-table-pedestal-${tableIndex}`, .18, .78, new Vector3(offsetX + x, .50, .95), palette.metal, root, details, 16);
    cylinder(scene, `art1i-cafe-table-base-${tableIndex}`, .68, .08, new Vector3(offsetX + x, .08, .95), palette.navy, root, details, 18);

    cylinder(scene, `art1i-cafe-vase-${tableIndex}`, .16, .28, new Vector3(offsetX + x, 1.13, .95), palette.teal, root, details, 14);
    for (const [flowerIndex, dx] of [-.10, .10].entries()) {
      cylinder(scene, `art1i-cafe-flower-stem-${tableIndex}-${flowerIndex}`, .025, .30, new Vector3(offsetX + x + dx, 1.34, .95), palette.leaf, root, details, 6);
      sphere(scene, `art1i-cafe-flower-${tableIndex}-${flowerIndex}`, .20, new Vector3(offsetX + x + dx, 1.51, .95), new Vector3(1, .72, 1), flowerIndex ? palette.mustard : palette.coral, root, details, 10);
    }

    for (const [chairIndex, z] of [0.0, 1.90].entries()) {
      contactShadow(scene, `art1i-cafe-chair-shadow-${tableIndex}-${chairIndex}`, new Vector3(offsetX + x, .014, z), .46, .40, palette, root, details);
      rounded(scene, `art1i-cafe-chair-seat-${tableIndex}-${chairIndex}`, new Vector3(.78, .18, .72), new Vector3(offsetX + x, .62, z), .14, palette.teal, root, details);
      rounded(scene, `art1i-cafe-chair-back-${tableIndex}-${chairIndex}`, new Vector3(.78, .88, .16), new Vector3(offsetX + x, 1.05, z + (z < 1 ? -.28 : .28)), .12, palette.mint, root, details);
      for (const dx of [-.27, .27]) {
        for (const dz of [-.25, .25]) {
          cylinder(scene, `art1i-cafe-chair-leg-${tableIndex}-${chairIndex}-${dx}-${dz}`, .07, .55, new Vector3(offsetX + x + dx, .30, z + dz), palette.navy, root, details, 8);
        }
      }
    }
  }

  rounded(scene, "art1i-cafe-community-board", new Vector3(1.62, 1.02, .10), new Vector3(offsetX - .30, 2.58, 3.60), .06, palette.wood, root, details);
  rounded(scene, "art1i-cafe-community-board-inner", new Vector3(1.42, .82, .025), new Vector3(offsetX - .30, 2.58, 3.52), .04, palette.plaster, root, details);
  for (const [index, x, y, note] of [
    [0, -.72, 2.76, palette.blush],
    [1, -.18, 2.62, palette.mustard],
    [2, .22, 2.84, palette.mint],
    [3, .46, 2.42, palette.coral],
  ] as const) {
    const card = rounded(scene, `art1i-cafe-note-${index}`, new Vector3(.38, .29, .018), new Vector3(offsetX + x, y, 3.48), .025, note, root, details);
    card.rotation.z = (index - 1.5) * .06;
    swayingDecor.push(card);
    sphere(scene, `art1i-cafe-note-pin-${index}`, .06, new Vector3(offsetX + x, y + .11, 3.46), Vector3.One(), palette.navy, root, details, 8);
  }

  rounded(scene, "art1i-cafe-toy-basket", new Vector3(1.18, .62, .74), new Vector3(offsetX - 4.70, .36, 2.85), .13, palette.woodLight, root, details);
  torus(scene, "art1i-cafe-toy-basket-rim", 1.02, .055, new Vector3(offsetX - 4.70, .69, 2.85), palette.wood, root, details).rotation.x = Math.PI / 2;
  sphere(scene, "art1i-cafe-toy-soft-ball", .42, new Vector3(offsetX - 4.92, .76, 2.75), Vector3.One(), palette.mustard, root, details, 10);
  rounded(scene, "art1i-cafe-toy-book", new Vector3(.56, .10, .42), new Vector3(offsetX - 4.42, .75, 2.90), .06, palette.coral, root, details).rotation.y = .18;
}

/**
 * Dedicated High-quality Sunny Cafe layer. The existing counter, pastry case,
 * coffee machine, seats, bell, menu, items, and hotspots remain authoritative.
 */
export function applyCafeHighPolish(scene: Scene, offsetX: number): Mesh[] {
  const root = new TransformNode("art1i-cafe-high-polish", scene);
  const details: Mesh[] = [];
  const palette = createPalette(scene);
  const steamPuffs: Mesh[] = [];
  const glowMeshes: Mesh[] = [];
  const swayingDecor: Mesh[] = [];

  addArchitecture(scene, offsetX, palette, root, details);
  addCounterAndWorkstation(scene, offsetX, palette, root, details, steamPuffs, glowMeshes);
  addPastryDisplay(scene, offsetX, palette, root, details);
  addSeatingAndStoryDetails(scene, offsetX, palette, root, details, swayingDecor);

  const steamBase = steamPuffs.map((mesh) => mesh.position.clone());
  const steamScaleBase = steamPuffs.map((mesh) => mesh.scaling.clone());
  const glowBase = glowMeshes.map((mesh) => mesh.scaling.clone());
  const swayBase = swayingDecor.map((mesh) => mesh.rotation.z);
  let elapsed = 0;

  scene.onBeforeRenderObservable.add(() => {
    const visible = details[0]?.isEnabled() ?? false;
    if (!visible) return;
    elapsed += Math.min(scene.getEngine().getDeltaTime(), 50) / 1000;

    for (const [index, steam] of steamPuffs.entries()) {
      const phase = (elapsed * .23 + index * .48) % 1;
      steam.position.y = steamBase[index].y + phase * .58;
      steam.position.x = steamBase[index].x + Math.sin(elapsed * 1.1 + index) * .035;
      const scale = .72 + phase * .58;
      steam.scaling.copyFrom(steamScaleBase[index]).scaleInPlace(scale);
      steam.visibility = 1 - phase * .78;
    }
    for (const [index, glow] of glowMeshes.entries()) {
      const pulse = 1 + Math.sin(elapsed * .9 + index) * .025;
      glow.scaling.copyFrom(glowBase[index]).scaleInPlace(pulse);
    }
    for (const [index, card] of swayingDecor.entries()) {
      card.rotation.z = swayBase[index] + Math.sin(elapsed * .34 + index * .8) * .008;
    }
    palette.glow.alpha = .65 + Math.sin(elapsed * .82) * .035;
  });

  return details;
}
