import {
  type AbstractMesh,
  Color3,
  type Material,
  type Mesh,
  PBRMaterial,
  type Scene,
  StandardMaterial,
} from "@babylonjs/core";

type HomeSurfaceRole =
  | "wall"
  | "floor"
  | "sofa"
  | "rug"
  | "wood"
  | "kitchen"
  | "ceramic"
  | "dark"
  | "accent"
  | "neutral";

interface SurfaceTreatment {
  target: Color3;
  blend: number;
  ambient: number;
  emissive: number;
  specular: number;
  power: number;
  roughness: number;
  metallic: number;
}

const treatments: Record<
  HomeSurfaceRole,
  SurfaceTreatment
> = {
  wall: {
    target: new Color3(.94, .87, .76),
    blend: .24,
    ambient: .24,
    emissive: .025,
    specular: .045,
    power: 48,
    roughness: .88,
    metallic: 0,
  },
  floor: {
    target: new Color3(.67, .39, .20),
    blend: .18,
    ambient: .20,
    emissive: .018,
    specular: .10,
    power: 40,
    roughness: .72,
    metallic: 0,
  },
  sofa: {
    target: new Color3(.24, .62, .59),
    blend: .58,
    ambient: .34,
    emissive: .045,
    specular: .085,
    power: 30,
    roughness: .82,
    metallic: 0,
  },
  rug: {
    target: new Color3(.26, .48, .47),
    blend: .50,
    ambient: .30,
    emissive: .035,
    specular: .055,
    power: 28,
    roughness: .90,
    metallic: 0,
  },
  wood: {
    target: new Color3(.58, .34, .17),
    blend: .24,
    ambient: .20,
    emissive: .018,
    specular: .12,
    power: 38,
    roughness: .68,
    metallic: 0,
  },
  kitchen: {
    target: new Color3(.27, .59, .55),
    blend: .25,
    ambient: .25,
    emissive: .026,
    specular: .10,
    power: 36,
    roughness: .72,
    metallic: 0,
  },
  ceramic: {
    target: new Color3(.94, .91, .83),
    blend: .28,
    ambient: .22,
    emissive: .020,
    specular: .18,
    power: 44,
    roughness: .52,
    metallic: 0,
  },
  dark: {
    target: new Color3(.18, .28, .31),
    blend: .58,
    ambient: .30,
    emissive: .040,
    specular: .09,
    power: 38,
    roughness: .74,
    metallic: .02,
  },
  accent: {
    target: new Color3(.79, .40, .48),
    blend: .12,
    ambient: .21,
    emissive: .020,
    specular: .12,
    power: 34,
    roughness: .66,
    metallic: 0,
  },
  neutral: {
    target: new Color3(.72, .66, .57),
    blend: .08,
    ambient: .18,
    emissive: .012,
    specular: .10,
    power: 36,
    roughness: .72,
    metallic: 0,
  },
};

const homeRootNames = new Set([
  "location-home-root",
  "art1g-family-home-high-polish",
]);

function belongsToFamilyHome(
  mesh: AbstractMesh,
): boolean {
  let node = mesh.parent;

  while (node) {
    if (homeRootNames.has(node.name)) {
      return true;
    }

    node = node.parent;
  }

  return homeRootNames.has(mesh.name);
}

function roleForHomeMesh(
  mesh: AbstractMesh,
): HomeSurfaceRole {
  const name = mesh.name.toLowerCase();
  const materialName =
    mesh.material?.name.toLowerCase() ?? "";

  if (
    name.includes("wall")
    || name.includes("divider")
    || name.includes("wainscot")
    || name.includes("crown")
    || name.includes("chair-rail")
    || name.includes("panel")
    || materialName.includes("plaster")
    || materialName.includes("wall")
  ) {
    return "wall";
  }

  if (
    name === "floor"
    || name.includes("floor-plank")
    || name.includes("kitchen-floor")
    || name.includes("tile-line")
  ) {
    return "floor";
  }

  if (
    name.startsWith("sofa-")
    || name.startsWith("cushion-")
    || name.includes("sofa-throw")
  ) {
    return "sofa";
  }

  if (
    name === "rug"
    || name.startsWith("rug-")
  ) {
    return "rug";
  }

  if (
    name.includes("screen")
    || name.includes("oven-window")
    || name.includes("toe-kick")
    || name.includes("hob-")
    || name.includes("tv")
    || materialName.includes("navy")
    || materialName.includes("screen")
  ) {
    return "dark";
  }

  if (
    name.includes("counter")
    || name.includes("island")
    || name.includes("cabinet")
    || name.includes("cupboard")
    || name.includes("fridge")
  ) {
    return "kitchen";
  }

  if (
    name.includes("plate")
    || name.includes("bowl")
    || name.includes("sink")
    || name.includes("ceramic")
    || materialName.includes("ceramic")
  ) {
    return "ceramic";
  }

  if (
    name.includes("table")
    || name.includes("console")
    || name.includes("shelf")
    || name.includes("wood")
    || name.includes("frame")
    || name.includes("baseboard")
    || materialName.includes("wood")
  ) {
    return "wood";
  }

  if (
    name.includes("pink")
    || name.includes("coral")
    || name.includes("blush")
    || name.includes("curtain")
    || name.includes("cushion")
  ) {
    return "accent";
  }

  return "neutral";
}

function treatmentKey(
  material: Material,
  role: HomeSurfaceRole,
): string {
  return `${material.uniqueId}:${role}`;
}

function tuneStandardMaterial(
  source: StandardMaterial,
  role: HomeSurfaceRole,
  treatment: SurfaceTreatment,
): StandardMaterial {
  const clone =
    source.clone(
      `${source.name}-scene1b-${role}`,
    );

  const diffuse =
    Color3.Lerp(
      source.diffuseColor,
      treatment.target,
      treatment.blend,
    );

  clone.diffuseColor = diffuse;
  clone.ambientColor =
    diffuse.scale(treatment.ambient);
  clone.emissiveColor =
    diffuse.scale(treatment.emissive);
  clone.specularColor = new Color3(
    treatment.specular,
    treatment.specular,
    treatment.specular,
  );
  clone.specularPower = treatment.power;

  return clone;
}

function tunePbrMaterial(
  source: PBRMaterial,
  role: HomeSurfaceRole,
  treatment: SurfaceTreatment,
): PBRMaterial {
  const clone =
    source.clone(
      `${source.name}-scene1b-${role}`,
    );

  const albedo =
    Color3.Lerp(
      source.albedoColor,
      treatment.target,
      treatment.blend,
    );

  clone.albedoColor = albedo;
  clone.emissiveColor =
    albedo.scale(treatment.emissive);
  clone.roughness = treatment.roughness;
  clone.metallic = treatment.metallic;

  return clone;
}

function tunedMaterial(
  source: Material,
  role: HomeSurfaceRole,
  cache: Map<string, Material>,
): Material {
  const key = treatmentKey(source, role);
  const existing = cache.get(key);

  if (existing) {
    return existing;
  }

  const treatment = treatments[role];
  let result: Material = source;

  if (source instanceof StandardMaterial) {
    result = tuneStandardMaterial(
      source,
      role,
      treatment,
    );
  }
  else if (source instanceof PBRMaterial) {
    result = tunePbrMaterial(
      source,
      role,
      treatment,
    );
  }

  cache.set(key, result);
  return result;
}

/**
 * Tunes only meshes owned by the Family Home.
 *
 * Shared world materials are cloned before adjustment, so the Bedroom, Cafe,
 * Park, Grocery, characters, and UI keep their existing appearance.
 */
export function applyFamilyHomeLightingAndMaterials(
  scene: Scene,
  homeDetails: readonly Mesh[],
): Mesh[] {
  const metadata =
    (scene.metadata ?? {}) as Record<string, unknown>;

  if (
    metadata.familyHomeLightingAndMaterials
    === "SCENE.1B"
  ) {
    return homeDetails.filter(
      (mesh) => !mesh.isDisposed(),
    );
  }

  const materialCache =
    new Map<string, Material>();

  for (const mesh of scene.meshes) {
    if (
      mesh.isDisposed()
      || !mesh.material
      || !belongsToFamilyHome(mesh)
    ) {
      continue;
    }

    const role = roleForHomeMesh(mesh);

    mesh.material = tunedMaterial(
      mesh.material,
      role,
      materialCache,
    );

    mesh.metadata = {
      ...mesh.metadata,
      sceneLightingPass: "SCENE.1B",
      homeSurfaceRole: role,
    };

    if (
      mesh.name.startsWith(
        "art1g-home-under-cabinet-glow-",
      )
    ) {
      mesh.visibility = Math.min(
        mesh.visibility,
        .58,
      );
    }

    if (
      mesh.name.startsWith(
        "art1g-home-light-pool-",
      )
    ) {
      mesh.visibility = Math.min(
        mesh.visibility,
        .34,
      );
    }
  }

  scene.metadata = {
    ...metadata,
    familyHomeLightingAndMaterials:
      "SCENE.1B",
  };

  return homeDetails.filter(
    (mesh) => !mesh.isDisposed(),
  );
}
