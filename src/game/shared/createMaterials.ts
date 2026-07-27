import {
  Color3,
  type Scene,
  StandardMaterial,
} from "@babylonjs/core";

export const WORLD_COLORS = {
  wallLavender: new Color3(0.72, 0.61, 0.82),
  wallCream: new Color3(0.94, 0.86, 0.73),
  floor: new Color3(0.63, 0.39, 0.22),
  teal: new Color3(0.16, 0.53, 0.49),
  mint: new Color3(0.47, 0.69, 0.59),
  pink: new Color3(0.91, 0.28, 0.47),
  yellow: new Color3(0.96, 0.67, 0.18),
  cream: new Color3(0.96, 0.91, 0.82),
  dark: new Color3(0.12, 0.09, 0.15),
  sky: new Color3(0.48, 0.75, 0.91),
} as const;

export type MaterialFinish =
  | "auto"
  | "matte"
  | "fabric"
  | "skin"
  | "hair"
  | "wood"
  | "soft-toy"
  | "ceramic"
  | "metal"
  | "glass"
  | "shadow";

interface MaterialFinishSettings {
  specular: number;
  power: number;
}

const MATERIAL_FINISHES: Record<Exclude<MaterialFinish, "auto">, MaterialFinishSettings> = {
  matte: { specular: .065, power: 48 },
  fabric: { specular: .11, power: 30 },
  skin: { specular: .13, power: 34 },
  hair: { specular: .16, power: 34 },
  wood: { specular: .14, power: 34 },
  "soft-toy": { specular: .18, power: 30 },
  ceramic: { specular: .24, power: 36 },
  metal: { specular: .36, power: 48 },
  glass: { specular: .48, power: 64 },
  shadow: { specular: 0, power: 64 },
};

function inferMaterialFinish(name: string): Exclude<MaterialFinish, "auto"> {
  const normalized = name.toLowerCase();
  if (normalized.includes("shadow") || normalized.includes("hotspot")) return "shadow";
  if (normalized.includes("glass") || normalized.includes("mirror") || normalized.includes("eye") || normalized.includes("iris")) return "glass";
  if (normalized.includes("metal") || normalized.includes("handle") || normalized.includes("hinge")) return "metal";
  if (normalized.includes("ceramic") || normalized.includes("plate") || normalized.includes("bowl") || normalized.includes("cup")) return "ceramic";
  if (normalized.includes("fabric") || normalized.includes("hoodie") || normalized.includes("denim") || normalized.includes("dress") || normalized.includes("trouser") || normalized.includes("curtain") || normalized.includes("rug")) return "fabric";
  if (normalized.includes("skin") || normalized.includes("cheek") || normalized.includes("nose") || normalized.includes("ear")) return "skin";
  if (normalized.includes("hair") || normalized.includes("brow") || normalized.includes("lash")) return "hair";
  if (normalized.includes("wood") || normalized.includes("floor")) return "wood";
  if (normalized.includes("wall") || normalized.includes("road") || normalized.includes("sidewalk") || normalized.includes("grass") || normalized.includes("sky")) return "matte";
  return "soft-toy";
}

export function applyMaterialFinish(
  material: StandardMaterial,
  finish: MaterialFinish = "auto",
): StandardMaterial {
  const resolved = finish === "auto" ? inferMaterialFinish(material.name) : finish;
  const settings = MATERIAL_FINISHES[resolved];
  material.specularColor = new Color3(settings.specular, settings.specular, settings.specular);
  material.specularPower = settings.power;
  if (resolved === "shadow") {
    material.disableLighting = true;
    material.backFaceCulling = false;
  }
  return material;
}

export function createMaterial(
  scene: Scene,
  name: string,
  diffuse: Color3,
  emissive?: Color3,
  finish: MaterialFinish = "auto",
): StandardMaterial {
  const result = new StandardMaterial(name, scene);
  result.diffuseColor = diffuse;
  result.ambientColor = diffuse.scale(.10);
  applyMaterialFinish(result, finish);
  if (emissive) result.emissiveColor = emissive;
  return result;
}

export interface WorldMaterialRegistry {
  floor: StandardMaterial;
  floorLight: StandardMaterial;
  lavender: StandardMaterial;
  creamWall: StandardMaterial;
  white: StandardMaterial;
  teal: StandardMaterial;
  mint: StandardMaterial;
  wood: StandardMaterial;
  dark: StandardMaterial;
  pink: StandardMaterial;
  yellow: StandardMaterial;
  green: StandardMaterial;
  sky: StandardMaterial;
  marker: StandardMaterial;
  road: StandardMaterial;
  sidewalk: StandardMaterial;
  grass: StandardMaterial;
  peach: StandardMaterial;
  cafeBlue: StandardMaterial;
  glass: StandardMaterial;
  world3Hotspot: StandardMaterial;
}

export const WORLD_MATERIAL_KEYS = [
  "floor",
  "floorLight",
  "lavender",
  "creamWall",
  "white",
  "teal",
  "mint",
  "wood",
  "dark",
  "pink",
  "yellow",
  "green",
  "sky",
  "marker",
  "road",
  "sidewalk",
  "grass",
  "peach",
  "cafeBlue",
  "glass",
  "world3Hotspot",
] as const satisfies readonly (keyof WorldMaterialRegistry)[];

export function createWorldMaterials(scene: Scene): WorldMaterialRegistry {
  const world3Hotspot = new StandardMaterial("world3-hotspot-material", scene);
  world3Hotspot.diffuseColor = new Color3(.98, .76, .24);
  applyMaterialFinish(world3Hotspot, "shadow");
  world3Hotspot.alpha = .025;
  const registry: WorldMaterialRegistry = {
    floor: createMaterial(scene, "floor-mat", WORLD_COLORS.floor),
    floorLight: createMaterial(scene, "floor-light", new Color3(0.73, 0.48, 0.29)),
    lavender: createMaterial(scene, "lavender-wall", WORLD_COLORS.wallLavender),
    creamWall: createMaterial(scene, "cream-wall", WORLD_COLORS.wallCream),
    white: createMaterial(scene, "white", WORLD_COLORS.cream),
    teal: createMaterial(scene, "teal", WORLD_COLORS.teal),
    mint: createMaterial(scene, "mint", WORLD_COLORS.mint),
    wood: createMaterial(scene, "wood", new Color3(0.49, 0.27, 0.13)),
    dark: createMaterial(scene, "dark", WORLD_COLORS.dark),
    pink: createMaterial(scene, "pink", WORLD_COLORS.pink),
    yellow: createMaterial(scene, "yellow", WORLD_COLORS.yellow),
    green: createMaterial(scene, "green", new Color3(0.18, 0.48, 0.22)),
    sky: createMaterial(
      scene,
      "sky",
      WORLD_COLORS.sky,
      new Color3(0.12, 0.18, 0.2),
    ),
    marker: createMaterial(
      scene,
      "snap-marker",
      WORLD_COLORS.yellow,
      new Color3(0.25, 0.13, 0.01),
    ),
    road: createMaterial(scene, "road", new Color3(0.34, 0.37, 0.42)),
    sidewalk: createMaterial(scene, "sidewalk", new Color3(0.72, 0.72, 0.68)),
    grass: createMaterial(scene, "grass", new Color3(0.30, 0.58, 0.28)),
    peach: createMaterial(scene, "peach", new Color3(0.94, 0.55, 0.44)),
    cafeBlue: createMaterial(scene, "cafe-blue", new Color3(0.27, 0.61, 0.72)),
    glass: createMaterial(
      scene,
      "glass",
      new Color3(0.58, 0.82, 0.90),
      new Color3(0.06, 0.12, 0.14),
    ),
    world3Hotspot,
  };
  registry.marker.alpha = 0.75;
  registry.glass.alpha = 0.48;
  return registry;
}
