import {
  Color3,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  type Scene,
  Vector3,
} from "@babylonjs/core";
import { createWorldPlaque } from "./createWorldPlaque";

export interface ReadabilityOffsets {
  bedroom: number;
  street: number;
  cafe: number;
  park: number;
  grocery: number;
}

function material(scene: Scene, name: string, color: Color3, emissive = Color3.Black()): StandardMaterial {
  const result = new StandardMaterial(name, scene);
  result.diffuseColor = color;
  result.emissiveColor = emissive;
  result.specularColor = new Color3(.18, .18, .18);
  result.specularPower = 30;
  return result;
}

function addApplianceBadge(
  scene: Scene,
  name: string,
  position: Vector3,
  color: StandardMaterial,
): Mesh {
  const badge = MeshBuilder.CreateCylinder(
    name,
    { diameter: .19, height: .035, tessellation: 18 },
    scene,
  );
  badge.position.copyFrom(position);
  badge.rotation.x = Math.PI / 2;
  badge.material = color;
  badge.isPickable = false;
  return badge;
}

/**
 * Adds the toy-box/store-display labels and high-contrast micro-details that
 * make small procedural objects readable from the fixed dollhouse camera.
 * All returned meshes are decorative and are disabled with Low detail.
 */
export function applyWorldReadabilityPass(
  scene: Scene,
  offsets: ReadabilityOffsets,
): Mesh[] {
  const meshes: Mesh[] = [];
  const { bedroom, cafe, grocery } = offsets;

  const cream = "#fff5df";
  const purple = "#694b7c";
  const teal = "#287f82";
  const coral = "#c9536f";
  const green = "#39795b";

  const plaque = (
    name: string,
    text: string,
    position: Vector3,
    width: number,
    border = purple,
  ): void => {
    meshes.push(createWorldPlaque(scene, name, text, position, {
      width,
      height: .31,
      background: cream,
      border,
      foreground: "#493653",
      fontSize: 44,
    }));
  };

  // Family home: labels are styled as play-set plaques rather than debug text.
  plaque("readability-home-kitchen", "Kitchen", new Vector3(3.82, 3.15, 3.73), 1.55, teal);
  plaque("readability-home-oven", "Oven", new Vector3(5.15, 1.02, 2.29), .82, coral);
  plaque("readability-home-fridge", "Fridge", new Vector3(2.3, 2.62, 2.08), 1.0, teal);
  plaque("readability-home-toy", "Toy Box", new Vector3(.9, .83, -.96), 1.12, coral);

  // Bedroom: large category labels help children decode storage and hygiene props.
  plaque("readability-bedroom-sleep", "Sleep", new Vector3(bedroom - 3.35, 2.82, 3.72), 1.05, coral);
  plaque("readability-bedroom-wardrobe", "Wardrobe", new Vector3(bedroom + 4.85, 2.9, -3.48), 1.45, purple);
  plaque("readability-bedroom-wash", "Wash", new Vector3(bedroom + 2.8, 2.82, -1.32), .92, teal);
  plaque("readability-bedroom-toys", "Toys", new Vector3(bedroom + .9, 1.02, -.98), .84, coral);

  // Sunny Cafe: service zones read clearly before the player discovers hotspots.
  plaque("readability-cafe-menu", "Menu", new Vector3(cafe + 2.5, 3.38, 3.67), .95, purple);
  plaque("readability-cafe-drinks", "Drinks", new Vector3(cafe + 2.1, 2.66, 2.87), 1.05, teal);
  plaque("readability-cafe-pastries", "Pastries", new Vector3(cafe + 4.7, 2.12, .0), 1.35, coral);
  plaque("readability-cafe-toys", "Toy Corner", new Vector3(cafe - 4.7, 1.62, 2.44), 1.45, green);

  // Grocery: category signs are the main readability tool for dense shelves.
  plaque("readability-grocery-produce", "Produce", new Vector3(grocery + 3.55, 1.72, -.28), 1.28, green);
  plaque("readability-grocery-bakery", "Bakery", new Vector3(grocery - 4.5, 1.83, -3.08), 1.18, coral);
  plaque("readability-grocery-drinks", "Cold Drinks", new Vector3(grocery + 4.45, 2.82, 2.45), 1.55, teal);
  plaque("readability-grocery-home", "Home Care", new Vector3(grocery + 4.45, 2.13, -2.93), 1.5, purple);
  plaque("readability-grocery-checkout", "Checkout", new Vector3(grocery + .8, 1.78, -3.12), 1.35, teal);

  // Appliance symbols and controls: tiny layered details create a modern toy feel.
  const controlDark = material(scene, "readability-control-dark", new Color3(.13, .10, .16));
  const controlGlow = material(
    scene,
    "readability-control-glow",
    new Color3(.35, .82, .88),
    new Color3(.10, .24, .27),
  );
  const controlWarm = material(
    scene,
    "readability-control-warm",
    new Color3(.96, .53, .29),
    new Color3(.18, .06, .02),
  );

  for (const [index, position] of [
    new Vector3(5.02, 1.55, 2.76),
    new Vector3(5.28, 1.55, 2.76),
    new Vector3(4.22, 1.53, 2.80),
    new Vector3(4.48, 1.53, 2.80),
  ].entries()) {
    meshes.push(addApplianceBadge(
      scene,
      `readability-appliance-control-${index}`,
      position,
      index % 2 === 0 ? controlGlow : controlWarm,
    ));
  }

  const ovenHandle = MeshBuilder.CreateBox(
    "readability-oven-handle",
    { width: .58, height: .07, depth: .08 },
    scene,
  );
  ovenHandle.position.set(5.15, 1.32, 2.28);
  ovenHandle.material = controlDark;
  ovenHandle.isPickable = false;
  meshes.push(ovenHandle);

  for (const mesh of meshes) {
    mesh.isPickable = false;
    mesh.metadata = { ...mesh.metadata, readabilityDetail: true };
  }
  return meshes;
}
