import {
  Color3,
  Material,
  PBRMaterial,
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

const MATERIAL_FINISHES: Record<
  Exclude<MaterialFinish, "auto">,
  MaterialFinishSettings
> = {
  matte: {
    specular: 0.065,
    power: 48,
  },
  fabric: {
    specular: 0.11,
    power: 30,
  },
  skin: {
    specular: 0.13,
    power: 34,
  },
  hair: {
    specular: 0.16,
    power: 34,
  },
  wood: {
    specular: 0.14,
    power: 34,
  },
  "soft-toy": {
    specular: 0.18,
    power: 30,
  },
  ceramic: {
    specular: 0.24,
    power: 36,
  },
  metal: {
    specular: 0.36,
    power: 48,
  },
  glass: {
    specular: 0.48,
    power: 64,
  },
  shadow: {
    specular: 0,
    power: 64,
  },
};

function inferMaterialFinish(
  name: string,
): Exclude<MaterialFinish, "auto"> {
  const normalized = name.toLowerCase();

  if (
    normalized.includes("shadow")
    || normalized.includes("hotspot")
  ) {
    return "shadow";
  }

  if (
    normalized.includes("glass")
    || normalized.includes("mirror")
    || normalized.includes("eye")
    || normalized.includes("iris")
  ) {
    return "glass";
  }

  if (
    normalized.includes("metal")
    || normalized.includes("handle")
    || normalized.includes("hinge")
  ) {
    return "metal";
  }

  if (
    normalized.includes("ceramic")
    || normalized.includes("plate")
    || normalized.includes("bowl")
    || normalized.includes("cup")
  ) {
    return "ceramic";
  }

  if (
    normalized.includes("fabric")
    || normalized.includes("hoodie")
    || normalized.includes("denim")
    || normalized.includes("dress")
    || normalized.includes("trouser")
    || normalized.includes("curtain")
    || normalized.includes("rug")
  ) {
    return "fabric";
  }

  if (
    normalized.includes("skin")
    || normalized.includes("cheek")
    || normalized.includes("nose")
    || normalized.includes("ear")
  ) {
    return "skin";
  }

  if (
    normalized.includes("hair")
    || normalized.includes("brow")
    || normalized.includes("lash")
  ) {
    return "hair";
  }

  if (
    normalized.includes("wood")
    || normalized.includes("floor")
  ) {
    return "wood";
  }

  if (
    normalized.includes("wall")
    || normalized.includes("road")
    || normalized.includes("sidewalk")
    || normalized.includes("grass")
    || normalized.includes("sky")
  ) {
    return "matte";
  }

  return "soft-toy";
}

export function applyMaterialFinish(
  material: StandardMaterial,
  finish: MaterialFinish = "auto",
): StandardMaterial {
  const resolved =
    finish === "auto"
      ? inferMaterialFinish(material.name)
      : finish;

  const settings = MATERIAL_FINISHES[resolved];

  material.specularColor = new Color3(
    settings.specular,
    settings.specular,
    settings.specular,
  );

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
  const result = new StandardMaterial(
    name,
    scene,
  );

  result.diffuseColor = diffuse;
  result.ambientColor = diffuse.scale(0.1);

  applyMaterialFinish(result, finish);

  if (emissive) {
    result.emissiveColor = emissive;
  }

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
] as const satisfies readonly (
  keyof WorldMaterialRegistry
)[];

export function createWorldMaterials(
  scene: Scene,
): WorldMaterialRegistry {
  /*
   * Utility materials remain StandardMaterial. The GFX.2
   * promotion controller deliberately ignores hotspot,
   * marker and shadow materials.
   */
  const world3Hotspot =
    new StandardMaterial(
      "world3-hotspot-material",
      scene,
    );

  world3Hotspot.diffuseColor =
    new Color3(0.98, 0.76, 0.24);

  applyMaterialFinish(
    world3Hotspot,
    "shadow",
  );

  world3Hotspot.alpha = 0.025;

  const registry: WorldMaterialRegistry = {
    floor: createMaterial(
      scene,
      "floor-mat",
      WORLD_COLORS.floor,
      undefined,
      "wood",
    ),

    floorLight: createMaterial(
      scene,
      "floor-light",
      new Color3(0.73, 0.48, 0.29),
      undefined,
      "wood",
    ),

    lavender: createMaterial(
      scene,
      "lavender-wall",
      WORLD_COLORS.wallLavender,
      undefined,
      "matte",
    ),

    creamWall: createMaterial(
      scene,
      "cream-wall",
      WORLD_COLORS.wallCream,
      undefined,
      "matte",
    ),

    white: createMaterial(
      scene,
      "white",
      WORLD_COLORS.cream,
      undefined,
      "soft-toy",
    ),

    teal: createMaterial(
      scene,
      "teal",
      WORLD_COLORS.teal,
      undefined,
      "soft-toy",
    ),

    mint: createMaterial(
      scene,
      "mint",
      WORLD_COLORS.mint,
      undefined,
      "soft-toy",
    ),

    wood: createMaterial(
      scene,
      "wood",
      new Color3(0.49, 0.27, 0.13),
      undefined,
      "wood",
    ),

    dark: createMaterial(
      scene,
      "dark",
      WORLD_COLORS.dark,
      undefined,
      "soft-toy",
    ),

    pink: createMaterial(
      scene,
      "pink",
      WORLD_COLORS.pink,
      undefined,
      "soft-toy",
    ),

    yellow: createMaterial(
      scene,
      "yellow",
      WORLD_COLORS.yellow,
      undefined,
      "soft-toy",
    ),

    green: createMaterial(
      scene,
      "green",
      new Color3(0.18, 0.48, 0.22),
      undefined,
      "soft-toy",
    ),

    sky: createMaterial(
      scene,
      "sky",
      WORLD_COLORS.sky,
      new Color3(0.12, 0.18, 0.2),
      "matte",
    ),

    marker: createMaterial(
      scene,
      "snap-marker",
      WORLD_COLORS.yellow,
      new Color3(0.25, 0.13, 0.01),
      "shadow",
    ),

    road: createMaterial(
      scene,
      "road",
      new Color3(0.34, 0.37, 0.42),
      undefined,
      "matte",
    ),

    sidewalk: createMaterial(
      scene,
      "sidewalk",
      new Color3(0.72, 0.72, 0.68),
      undefined,
      "matte",
    ),

    grass: createMaterial(
      scene,
      "grass",
      new Color3(0.3, 0.58, 0.28),
      undefined,
      "matte",
    ),

    peach: createMaterial(
      scene,
      "peach",
      new Color3(0.94, 0.55, 0.44),
      undefined,
      "soft-toy",
    ),

    cafeBlue: createMaterial(
      scene,
      "cafe-blue",
      new Color3(0.27, 0.61, 0.72),
      undefined,
      "soft-toy",
    ),

    glass: createMaterial(
      scene,
      "glass",
      new Color3(0.58, 0.82, 0.9),
      new Color3(0.06, 0.12, 0.14),
      "glass",
    ),

    world3Hotspot,
  };

  registry.marker.alpha = 0.75;
  registry.glass.alpha = 0.48;

  return registry;
}

export interface ToyPBRMaterialOptions {
  roughness?: number;
  metallic?: number;

  clearCoatIntensity?: number;
  clearCoatRoughness?: number;

  translucent?: boolean;
  translucencyIntensity?: number;
  tintColor?: Color3;

  environmentIntensity?: number;

  refraction?: boolean;
  indexOfRefraction?: number;

  alpha?: number;
}

export function createToyPBRMaterial(
  scene: Scene,
  name: string,
  albedoColor: Color3,
  options: ToyPBRMaterialOptions = {},
): PBRMaterial {
  const material = new PBRMaterial(
    name,
    scene,
  );

  material.albedoColor =
    albedoColor.clone();

  material.metallic =
    options.metallic ?? 0;

  material.roughness =
    options.roughness ?? 0.32;

  material.environmentIntensity =
    options.environmentIntensity ?? 0.78;

  material.alpha =
    options.alpha ?? 1;

  const clearCoatIntensity =
    options.clearCoatIntensity ?? 0.28;

  material.clearCoat.isEnabled =
    clearCoatIntensity > 0;

  material.clearCoat.intensity =
    clearCoatIntensity;

  material.clearCoat.roughness =
    options.clearCoatRoughness ?? 0.16;

  const translucent =
    options.translucent ?? false;

  material.subSurface.isTranslucencyEnabled =
    translucent;

  material.subSurface.translucencyIntensity =
    options.translucencyIntensity ?? 0;

  if (translucent) {
    material.subSurface.tintColor =
      (
        options.tintColor
        ?? albedoColor
      ).clone();

    material.subSurface
      .useAlbedoToTintTranslucency = true;
  }

  if (options.refraction) {
    material.subSurface.isRefractionEnabled =
      true;

    material.subSurface
      .linkRefractionWithTransparency = true;

    material.subSurface
      .useAlbedoToTintRefraction = true;

    material.subSurface.indexOfRefraction =
      options.indexOfRefraction ?? 1.45;

    material.subSurface.refractionTexture =
      scene.environmentTexture;

    material.transparencyMode =
      Material.MATERIAL_ALPHABLEND;

    if (options.alpha === undefined) {
      material.alpha = 0.42;
    }
  }

  return material;
}
