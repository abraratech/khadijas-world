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

interface GroceryPalette {
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
  green: StandardMaterial;
  leaf: StandardMaterial;
  ceramic: StandardMaterial;
  metal: StandardMaterial;
  glass: StandardMaterial;
  coolGlow: StandardMaterial;
  warmGlow: StandardMaterial;
  shadow: StandardMaterial;
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

function createPalette(scene: Scene): GroceryPalette {
  const shadow = createMaterial(scene, "art1i-grocery-shadow", new Color3(.04, .04, .05), undefined, "shadow");
  shadow.alpha = .13;
  return {
    plaster: createMaterial(scene, "art1i-grocery-plaster", new Color3(.94, .91, .82), undefined, "matte"),
    trim: createMaterial(scene, "art1i-grocery-trim", new Color3(.995, .97, .91), undefined, "ceramic"),
    coral: createMaterial(scene, "art1i-grocery-coral", new Color3(.91, .36, .47), undefined, "soft-toy"),
    blush: createMaterial(scene, "art1i-grocery-blush", new Color3(.96, .61, .69), undefined, "fabric"),
    teal: createMaterial(scene, "art1i-grocery-teal", new Color3(.11, .51, .52), undefined, "soft-toy"),
    mint: createMaterial(scene, "art1i-grocery-mint", new Color3(.55, .78, .68), undefined, "soft-toy"),
    mustard: createMaterial(scene, "art1i-grocery-mustard", new Color3(.95, .68, .18), undefined, "soft-toy"),
    navy: createMaterial(scene, "art1i-grocery-navy", new Color3(.09, .15, .24), undefined, "soft-toy"),
    wood: createMaterial(scene, "art1i-grocery-wood", new Color3(.48, .27, .14), undefined, "wood"),
    woodLight: createMaterial(scene, "art1i-grocery-wood-light", new Color3(.76, .52, .29), undefined, "wood"),
    green: createMaterial(scene, "art1i-grocery-green", new Color3(.28, .57, .30), undefined, "soft-toy"),
    leaf: createMaterial(scene, "art1i-grocery-leaf", new Color3(.18, .47, .26), undefined, "soft-toy"),
    ceramic: createMaterial(scene, "art1i-grocery-ceramic", new Color3(.99, .96, .88), undefined, "ceramic"),
    metal: createMaterial(scene, "art1i-grocery-metal", new Color3(.66, .72, .74), undefined, "metal"),
    glass: translucent(scene, "art1i-grocery-glass", new Color3(.62, .86, .94), .27, new Color3(.02, .055, .07)),
    coolGlow: translucent(scene, "art1i-grocery-cool-glow", new Color3(.66, .91, .98), .58, new Color3(.04, .11, .14)),
    warmGlow: translucent(scene, "art1i-grocery-warm-glow", new Color3(1, .79, .39), .64, new Color3(.18, .10, .02)),
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
    artPass: "art1i-grocery",
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
  palette: GroceryPalette,
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

function addArchitectureAndWayfinding(
  scene: Scene,
  offsetX: number,
  palette: GroceryPalette,
  root: TransformNode,
  details: Mesh[],
  swayingSigns: Mesh[],
): void {
  box(scene, "art1i-grocery-crown-back", new Vector3(11.72, .18, .18), new Vector3(offsetX, 4.0, 3.77), palette.trim, root, details);
  box(scene, "art1i-grocery-crown-left", new Vector3(.18, .18, 7.55), new Vector3(offsetX - 5.78, 4.0, 0), palette.trim, root, details);
  box(scene, "art1i-grocery-baseboard-back", new Vector3(11.72, .16, .14), new Vector3(offsetX, .08, 3.78), palette.trim, root, details);
  box(scene, "art1i-grocery-baseboard-left", new Vector3(.14, .16, 7.55), new Vector3(offsetX - 5.78, .08, 0), palette.trim, root, details);

  rounded(scene, "art1i-grocery-main-sign", new Vector3(3.82, .84, .12), new Vector3(offsetX, 3.38, 3.60), .10, palette.coral, root, details);
  for (const [index, x] of [-1.05, -.35, .35, 1.05].entries()) {
    sphere(scene, `art1i-grocery-sign-fruit-${index}`, .30, new Vector3(offsetX + x, 3.42, 3.49), new Vector3(1, .88, .90), [palette.mustard, palette.green, palette.blush, palette.teal][index], root, details, 12);
    if (index !== 3) {
      cylinder(scene, `art1i-grocery-sign-stem-${index}`, .035, .13, new Vector3(offsetX + x, 3.61, 3.49), palette.leaf, root, details, 6).rotation.z = .25;
    }
  }

  const headers = [
    { x: -2.60, z: 2.45, material: palette.coral, accent: palette.ceramic },
    { x: -2.60, z: 1.20, material: palette.teal, accent: palette.ceramic },
    { x: -2.60, z: -.05, material: palette.mustard, accent: palette.navy },
    { x: 3.55, z: -.25, material: palette.green, accent: palette.ceramic },
  ] as const;
  for (const [index, header] of headers.entries()) {
    cylinder(scene, `art1i-grocery-header-cable-${index}`, .025, .48, new Vector3(offsetX + header.x, 2.64, header.z), palette.metal, root, details, 6);
    const sign = rounded(scene, `art1i-grocery-header-${index}`, new Vector3(1.72, .42, .08), new Vector3(offsetX + header.x, 2.35, header.z), .07, header.material, root, details);
    box(scene, `art1i-grocery-header-line-${index}`, new Vector3(.86, .055, .025), new Vector3(offsetX + header.x, 2.35, header.z - .05), header.accent, root, details);
    swayingSigns.push(sign);
  }
}

function addAislesAndStock(
  scene: Scene,
  offsetX: number,
  palette: GroceryPalette,
  root: TransformNode,
  details: Mesh[],
): void {
  const stockColors = [palette.coral, palette.mustard, palette.teal, palette.mint, palette.blush, palette.ceramic] as const;
  for (const [aisleIndex, z] of [2.80, 1.55, .30].entries()) {
    contactShadow(scene, `art1i-grocery-aisle-shadow-${aisleIndex}`, new Vector3(offsetX - 2.60, .014, z), 2.0, .46, palette, root, details);
    rounded(scene, `art1i-grocery-aisle-endcap-${aisleIndex}`, new Vector3(3.48, 1.76, .64), new Vector3(offsetX - 2.60, .90, z), .08, palette.woodLight, root, details);
    box(scene, `art1i-grocery-aisle-back-${aisleIndex}`, new Vector3(3.16, 1.48, .08), new Vector3(offsetX - 2.60, .91, z - .33), palette.plaster, root, details);
    for (const y of [.43, .92, 1.41]) {
      rounded(scene, `art1i-grocery-aisle-shelf-${aisleIndex}-${y}`, new Vector3(3.24, .10, .58), new Vector3(offsetX - 2.60, y, z), .035, palette.trim, root, details);
      box(scene, `art1i-grocery-aisle-price-strip-${aisleIndex}-${y}`, new Vector3(3.05, .075, .025), new Vector3(offsetX - 2.60, y - .08, z - .34), palette.coral, root, details);
    }

    for (let row = 0; row < 3; row += 1) {
      for (let slot = 0; slot < 8; slot += 1) {
        const x = offsetX - 3.70 + slot * .31;
        const y = .62 + row * .49;
        const material = stockColors[(slot + row + aisleIndex) % stockColors.length];
        if ((slot + row + aisleIndex) % 3 === 0) {
          const can = cylinder(scene, `art1i-grocery-can-${aisleIndex}-${row}-${slot}`, .22, .29, new Vector3(x, y, z - .36), material, root, details, 14);
          box(scene, `art1i-grocery-can-label-${aisleIndex}-${row}-${slot}`, new Vector3(.15, .11, .018), new Vector3(x, y, z - .48), palette.ceramic, root, details);
          can.rotation.y = slot * .04;
        } else {
          const carton = rounded(scene, `art1i-grocery-carton-${aisleIndex}-${row}-${slot}`, new Vector3(.24, .31, .22), new Vector3(x, y, z - .36), .035, material, root, details);
          carton.rotation.y = (slot % 2 ? 1 : -1) * .025;
          box(scene, `art1i-grocery-carton-label-${aisleIndex}-${row}-${slot}`, new Vector3(.13, .12, .015), new Vector3(x, y, z - .48), palette.ceramic, root, details);
        }
      }
    }
  }
}

function addProduceAndBakery(
  scene: Scene,
  offsetX: number,
  palette: GroceryPalette,
  root: TransformNode,
  details: Mesh[],
  mistPuffs: Mesh[],
): void {
  contactShadow(scene, "art1i-grocery-produce-shadow", new Vector3(offsetX + 3.55, .014, .35), 1.76, .84, palette, root, details);
  rounded(scene, "art1i-grocery-produce-island", new Vector3(2.90, .86, 1.26), new Vector3(offsetX + 3.55, .48, .35), .12, palette.wood, root, details);
  box(scene, "art1i-grocery-produce-kick", new Vector3(2.58, .14, 1.02), new Vector3(offsetX + 3.55, .11, .35), palette.navy, root, details);

  const produceMaterials = [palette.coral, palette.mustard, palette.green, palette.teal] as const;
  for (let crate = 0; crate < 4; crate += 1) {
    const x = offsetX + 2.75 + (crate % 2) * 1.05;
    const z = -.02 + Math.floor(crate / 2) * .74;
    rounded(scene, `art1i-grocery-produce-crate-${crate}`, new Vector3(.88, .24, .58), new Vector3(x, .98, z), .055, palette.woodLight, root, details);
    for (let item = 0; item < 7; item += 1) {
      const produce = sphere(
        scene,
        `art1i-grocery-produce-${crate}-${item}`,
        .23,
        new Vector3(x - .27 + (item % 3) * .27, 1.15 + Math.floor(item / 3) * .13, z - .13 + (item % 2) * .22),
        new Vector3(1, .92, 1),
        produceMaterials[crate],
        root,
        details,
        10,
      );
      produce.rotation.z = item * .12;
      if (crate === 0 || crate === 2) {
        cylinder(scene, `art1i-grocery-produce-stem-${crate}-${item}`, .025, .11, new Vector3(produce.position.x, produce.position.y + .15, produce.position.z), palette.leaf, root, details, 6).rotation.z = .25;
      }
    }
  }

  for (const [index, x] of [3.12, 3.95].entries()) {
    const mist = sphere(
      scene,
      `art1i-grocery-produce-mist-${index}`,
      .22,
      new Vector3(offsetX + x, 1.42, .34),
      new Vector3(.70, 1.35, .48),
      palette.glass,
      root,
      details,
      9,
    );
    mistPuffs.push(mist);
  }

  contactShadow(scene, "art1i-grocery-bakery-shadow", new Vector3(offsetX - 4.50, .014, -2.70), 1.48, .60, palette, root, details);
  rounded(scene, "art1i-grocery-bakery-base", new Vector3(2.54, 1.46, .82), new Vector3(offsetX - 4.50, .76, -2.70), .09, palette.mustard, root, details);
  rounded(scene, "art1i-grocery-bakery-front", new Vector3(2.20, .96, .05), new Vector3(offsetX - 4.50, .80, -3.13), .05, palette.plaster, root, details);
  for (const y of [.66, 1.08]) {
    box(scene, `art1i-grocery-bakery-shelf-${y}`, new Vector3(2.05, .06, .65), new Vector3(offsetX - 4.50, y, -2.70), palette.trim, root, details);
  }
  for (let shelf = 0; shelf < 2; shelf += 1) {
    for (let item = 0; item < 5; item += 1) {
      const x = offsetX - 5.28 + item * .39;
      const y = .82 + shelf * .42;
      const loaf = rounded(scene, `art1i-grocery-loaf-${shelf}-${item}`, new Vector3(.31, .18, .36), new Vector3(x, y, -2.72), .08, item % 2 ? palette.woodLight : palette.mustard, root, details);
      loaf.rotation.y = (item - 2) * .05;
      for (const slash of [-.07, .07]) {
        box(scene, `art1i-grocery-loaf-mark-${shelf}-${item}-${slash}`, new Vector3(.025, .10, .18), new Vector3(x + slash, y + .10, -2.83), palette.ceramic, root, details).rotation.z = .55;
      }
    }
  }
  box(scene, "art1i-grocery-bakery-awning", new Vector3(2.78, .16, .55), new Vector3(offsetX - 4.50, 1.72, -2.72), palette.coral, root, details);
  for (const x of [-5.50, -5.10, -4.70, -4.30, -3.90, -3.50]) {
    box(scene, `art1i-grocery-bakery-awning-stripe-${x}`, new Vector3(.20, .18, .58), new Vector3(offsetX + x, 1.73, -2.72), (Math.round(x * 10) % 2 === 0) ? palette.ceramic : palette.coral, root, details);
  }
}

function addFridgeAndHousehold(
  scene: Scene,
  offsetX: number,
  palette: GroceryPalette,
  root: TransformNode,
  details: Mesh[],
  glowMeshes: Mesh[],
): void {
  contactShadow(scene, "art1i-grocery-fridge-shadow", new Vector3(offsetX + 4.45, .014, 2.90), 1.50, .62, palette, root, details);
  rounded(scene, "art1i-grocery-fridge-frame", new Vector3(2.62, 2.64, .82), new Vector3(offsetX + 4.45, 1.34, 2.90), .10, palette.navy, root, details);
  rounded(scene, "art1i-grocery-fridge-glass", new Vector3(2.30, 2.28, .045), new Vector3(offsetX + 4.45, 1.36, 2.45), .06, palette.glass, root, details);
  box(scene, "art1i-grocery-fridge-divider", new Vector3(.08, 2.18, .07), new Vector3(offsetX + 4.45, 1.36, 2.38), palette.metal, root, details);
  for (const y of [.70, 1.30, 1.90]) {
    box(scene, `art1i-grocery-fridge-shelf-${y}`, new Vector3(2.14, .05, .63), new Vector3(offsetX + 4.45, y, 2.72), palette.glass, root, details);
  }
  for (const x of [3.86, 5.04]) {
    rounded(scene, `art1i-grocery-fridge-handle-${x}`, new Vector3(.08, 1.32, .08), new Vector3(offsetX + x, 1.36, 2.36), .04, palette.metal, root, details);
  }
  const fridgeLight = box(scene, "art1i-grocery-fridge-light", new Vector3(2.04, .05, .36), new Vector3(offsetX + 4.45, 2.48, 2.72), palette.coolGlow, root, details);
  glowMeshes.push(fridgeLight);

  for (let shelf = 0; shelf < 3; shelf += 1) {
    for (let slot = 0; slot < 5; slot += 1) {
      const x = offsetX + 3.72 + slot * .36;
      const y = .88 + shelf * .60;
      const material = [palette.ceramic, palette.blush, palette.teal, palette.mustard][(slot + shelf) % 4];
      const bottle = cylinder(scene, `art1i-grocery-fridge-bottle-${shelf}-${slot}`, .20, .40, new Vector3(x, y, 2.66), material, root, details, 14);
      box(scene, `art1i-grocery-fridge-bottle-label-${shelf}-${slot}`, new Vector3(.13, .10, .018), new Vector3(x, y, 2.53), palette.ceramic, root, details);
      bottle.rotation.y = slot * .02;
    }
  }

  contactShadow(scene, "art1i-grocery-household-shadow", new Vector3(offsetX + 4.45, .014, -2.60), 1.45, .50, palette, root, details);
  rounded(scene, "art1i-grocery-household-frame", new Vector3(2.45, 1.84, .68), new Vector3(offsetX + 4.45, .94, -2.60), .08, palette.teal, root, details);
  for (const y of [.45, .94, 1.43]) {
    box(scene, `art1i-grocery-household-shelf-${y}`, new Vector3(2.18, .08, .61), new Vector3(offsetX + 4.45, y, -2.60), palette.trim, root, details);
  }
  for (let row = 0; row < 3; row += 1) {
    for (let slot = 0; slot < 6; slot += 1) {
      const x = offsetX + 3.62 + slot * .33;
      const y = .66 + row * .49;
      const material = [palette.blush, palette.ceramic, palette.mustard, palette.mint][(row + slot) % 4];
      if ((row + slot) % 2 === 0) {
        cylinder(scene, `art1i-grocery-household-bottle-${row}-${slot}`, .20, .33, new Vector3(x, y, -2.94), material, root, details, 12);
      } else {
        rounded(scene, `art1i-grocery-household-box-${row}-${slot}`, new Vector3(.23, .31, .20), new Vector3(x, y, -2.94), .035, material, root, details);
      }
    }
  }
}

function addCheckout(
  scene: Scene,
  offsetX: number,
  palette: GroceryPalette,
  root: TransformNode,
  details: Mesh[],
  glowMeshes: Mesh[],
): void {
  contactShadow(scene, "art1i-grocery-checkout-shadow", new Vector3(offsetX + .80, .014, -2.55), 2.10, .78, palette, root, details);
  rounded(scene, "art1i-grocery-checkout-body", new Vector3(3.50, 1.02, 1.14), new Vector3(offsetX + .80, .55, -2.55), .12, palette.mint, root, details);
  box(scene, "art1i-grocery-checkout-kick", new Vector3(3.15, .15, .98), new Vector3(offsetX + .80, .14, -2.55), palette.navy, root, details);
  rounded(scene, "art1i-grocery-checkout-top", new Vector3(3.64, .14, 1.25), new Vector3(offsetX + .80, 1.10, -2.55), .06, palette.ceramic, root, details);
  rounded(scene, "art1i-grocery-checkout-belt", new Vector3(1.58, .07, .76), new Vector3(offsetX + .05, 1.19, -2.55), .04, palette.navy, root, details);
  for (const x of [-.60, -.25, .10, .45, .80]) {
    box(scene, `art1i-grocery-belt-groove-${x}`, new Vector3(.025, .03, .66), new Vector3(offsetX + x, 1.23, -2.55), palette.metal, root, details);
  }

  rounded(scene, "art1i-grocery-register-shell", new Vector3(.78, .56, .56), new Vector3(offsetX + 1.68, 1.38, -2.50), .08, palette.navy, root, details);
  const registerScreen = rounded(scene, "art1i-grocery-register-screen", new Vector3(.52, .30, .035), new Vector3(offsetX + 1.68, 1.48, -2.20), .04, palette.coolGlow, root, details);
  registerScreen.rotation.x = -.10;
  glowMeshes.push(registerScreen);
  for (const [index, x] of [1.50, 1.67, 1.84].entries()) {
    sphere(scene, `art1i-grocery-register-button-${index}`, .085, new Vector3(offsetX + x, 1.25, -2.18), Vector3.One(), [palette.coral, palette.mustard, palette.teal][index], root, details, 8);
  }

  cylinder(scene, "art1i-grocery-receipt-roll", .20, .30, new Vector3(offsetX + 1.36, 1.32, -2.55), palette.ceramic, root, details, 14).rotation.z = Math.PI / 2;
  box(scene, "art1i-grocery-receipt-paper", new Vector3(.18, .28, .025), new Vector3(offsetX + 1.24, 1.42, -2.27), palette.ceramic, root, details).rotation.x = -.28;

  rounded(scene, "art1i-grocery-bag-rack", new Vector3(.72, .86, .42), new Vector3(offsetX + 2.42, .65, -2.72), .08, palette.woodLight, root, details);
  for (const [index, z] of [-2.88, -2.68, -2.48].entries()) {
    torus(scene, `art1i-grocery-bag-loop-${index}`, .28, .035, new Vector3(offsetX + 2.42, .88, z), palette.ceramic, root, details).rotation.x = Math.PI / 2;
  }

  rounded(scene, "art1i-grocery-lane-light-post", new Vector3(.08, 1.55, .08), new Vector3(offsetX + 2.20, 1.82, -2.55), .035, palette.metal, root, details);
  const laneLight = rounded(scene, "art1i-grocery-lane-light", new Vector3(.66, .28, .12), new Vector3(offsetX + 2.20, 2.55, -2.55), .06, palette.warmGlow, root, details);
  glowMeshes.push(laneLight);
  sphere(scene, "art1i-grocery-lane-check", .16, new Vector3(offsetX + 2.20, 2.55, -2.47), new Vector3(1, .70, 1), palette.green, root, details, 10);
}

/**
 * Dedicated High-quality Sunny Basket Grocery layer. Existing products,
 * baskets, checkout, exits, stock hotspots, and shopping state remain active.
 */
export function applyGroceryHighPolish(scene: Scene, offsetX: number): Mesh[] {
  const root = new TransformNode("art1i-grocery-high-polish", scene);
  const details: Mesh[] = [];
  const palette = createPalette(scene);
  const swayingSigns: Mesh[] = [];
  const mistPuffs: Mesh[] = [];
  const glowMeshes: Mesh[] = [];

  addArchitectureAndWayfinding(scene, offsetX, palette, root, details, swayingSigns);
  addAislesAndStock(scene, offsetX, palette, root, details);
  addProduceAndBakery(scene, offsetX, palette, root, details, mistPuffs);
  addFridgeAndHousehold(scene, offsetX, palette, root, details, glowMeshes);
  addCheckout(scene, offsetX, palette, root, details, glowMeshes);

  const swayBase = swayingSigns.map((mesh) => mesh.rotation.z);
  const mistBase = mistPuffs.map((mesh) => mesh.position.clone());
  const mistScale = mistPuffs.map((mesh) => mesh.scaling.clone());
  const glowBase = glowMeshes.map((mesh) => mesh.scaling.clone());
  let elapsed = 0;

  scene.onBeforeRenderObservable.add(() => {
    const visible = details[0]?.isEnabled() ?? false;
    if (!visible) return;
    elapsed += Math.min(scene.getEngine().getDeltaTime(), 50) / 1000;

    for (const [index, sign] of swayingSigns.entries()) {
      sign.rotation.z = swayBase[index] + Math.sin(elapsed * .28 + index * .65) * .009;
    }
    for (const [index, mist] of mistPuffs.entries()) {
      const phase = (elapsed * .16 + index * .55) % 1;
      mist.position.y = mistBase[index].y + phase * .46;
      mist.position.x = mistBase[index].x + Math.sin(elapsed * .7 + index) * .035;
      mist.scaling.copyFrom(mistScale[index]).scaleInPlace(.68 + phase * .55);
      mist.visibility = .60 - phase * .46;
    }
    for (const [index, glow] of glowMeshes.entries()) {
      const pulse = 1 + Math.sin(elapsed * (.72 + index * .07) + index) * .025;
      glow.scaling.copyFrom(glowBase[index]).scaleInPlace(pulse);
    }
    palette.coolGlow.alpha = .54 + Math.sin(elapsed * .75) * .025;
    palette.warmGlow.alpha = .61 + Math.sin(elapsed * 1.05) * .035;
  });

  return details;
}
