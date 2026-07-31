import {
  type AbstractMesh,
  type Color3,
  type Material,
  MultiMaterial,
  PBRMaterial,
  type Scene,
  StandardMaterial,
} from "@babylonjs/core";
import {
  createToyPBRMaterial,
  type ToyPBRMaterialOptions,
} from "./createMaterials";

type ToyMaterialKind =
  | "skin"
  | "eye"
  | "hair"
  | "fabric"
  | "wood"
  | "glass"
  | "metal"
  | "matte"
  | "toy";

interface PbrMaterialSnapshot {
  metallic: number | null;
  roughness: number | null;
  environmentIntensity: number;

  clearCoatEnabled: boolean;
  clearCoatIntensity: number;
  clearCoatRoughness: number;

  translucencyEnabled: boolean;
  translucencyIntensity: number;
  translucencyTintColor: Color3;
  useAlbedoToTintTranslucency: boolean;
}

export interface ToyMaterialPromotionController {
  setEnabled(enabled: boolean): void;
  refresh(): void;
  dispose(): void;
}

const UTILITY_MATERIAL_MARKERS = [
  "hotspot",
  "shadow",
  "snap-",
  "marker",
  "target",
  "visible-slot",
  "interaction",
] as const;

function isUtilityMaterial(
  mesh: AbstractMesh,
  material: Material,
): boolean {
  const name = `${mesh.name} ${material.name}`.toLowerCase();

  return UTILITY_MATERIAL_MARKERS.some((marker) =>
    name.includes(marker)
  );
}

function classifyMaterialName(
  sourceName: string,
): ToyMaterialKind | null {
  const name = sourceName.toLowerCase();

  if (
    name.includes("eye")
    || name.includes("iris")
    || name.includes("pupil")
    || name.includes("cornea")
  ) {
    return "eye";
  }

  if (
    name.includes("skin")
    || name.includes("cheek")
    || name.includes("nose")
    || name.includes("ear")
    || name.includes("hand")
    || name.includes("face")
  ) {
    return "skin";
  }

  if (
    name.includes("hair")
    || name.includes("brow")
    || name.includes("lash")
  ) {
    return "hair";
  }

  if (
    name.includes("fabric")
    || name.includes("cloth")
    || name.includes("hoodie")
    || name.includes("dress")
    || name.includes("denim")
    || name.includes("trouser")
    || name.includes("curtain")
    || name.includes("rug")
    || name.includes("carpet")
    || name.includes("sofa")
    || name.includes("cushion")
    || name.includes("blanket")
    || name.includes("towel")
  ) {
    return "fabric";
  }

  if (
    name.includes("glass")
    || name.includes("mirror")
    || name.includes("window")
  ) {
    return "glass";
  }

  if (
    name.includes("metal")
    || name.includes("handle")
    || name.includes("hinge")
    || name.includes("rail")
  ) {
    return "metal";
  }

  if (
    name.includes("wood")
    || name.includes("floor")
    || name.includes("table")
    || name.includes("shelf")
    || name.includes("desk")
  ) {
    return "wood";
  }

  if (
    name.includes("wall")
    || name.includes("plaster")
    || name.includes("road")
    || name.includes("sidewalk")
    || name.includes("grass")
    || name.includes("sand")
    || name.includes("stone")
    || name.includes("paving")
    || name.includes("ceiling")
  ) {
    return "matte";
  }

  return null;
}

function classifyToyMaterial(
  mesh: AbstractMesh,
  material: Material,
  preferMaterialName = false,
): ToyMaterialKind {
  const materialClassification =
    classifyMaterialName(material.name);

  if (preferMaterialName && materialClassification) {
    return materialClassification;
  }

  return (
    classifyMaterialName(`${mesh.name} ${material.name}`)
    ?? materialClassification
    ?? "toy"
  );
}

function optionsForKind(
  kind: ToyMaterialKind,
): ToyPBRMaterialOptions {
  switch (kind) {
    case "skin":
      return {
        roughness: 0.42,
        metallic: 0,
        clearCoatIntensity: 0.1,
        clearCoatRoughness: 0.3,
        translucent: true,
        translucencyIntensity: 0.16,
        environmentIntensity: 0.68,
      };

    case "eye":
      return {
        roughness: 0.07,
        metallic: 0,
        clearCoatIntensity: 0.72,
        clearCoatRoughness: 0.045,
        environmentIntensity: 1,
      };

    case "hair":
      return {
        roughness: 0.46,
        metallic: 0,
        clearCoatIntensity: 0.08,
        clearCoatRoughness: 0.32,
        environmentIntensity: 0.72,
      };

    case "fabric":
      return {
        roughness: 0.86,
        metallic: 0,
        clearCoatIntensity: 0,
        environmentIntensity: 0.42,
      };

    case "wood":
      return {
        roughness: 0.5,
        metallic: 0,
        clearCoatIntensity: 0.12,
        clearCoatRoughness: 0.28,
        environmentIntensity: 0.7,
      };

    case "glass":
      return {
        roughness: 0.08,
        metallic: 0,
        clearCoatIntensity: 0.55,
        clearCoatRoughness: 0.04,
        refraction: true,
        indexOfRefraction: 1.45,
        environmentIntensity: 1,
      };

    case "metal":
      return {
        roughness: 0.28,
        metallic: 0.72,
        clearCoatIntensity: 0.04,
        clearCoatRoughness: 0.18,
        environmentIntensity: 0.9,
      };

    case "matte":
      return {
        roughness: 0.8,
        metallic: 0,
        clearCoatIntensity: 0,
        environmentIntensity: 0.42,
      };

    case "toy":
      return {
        roughness: 0.34,
        metallic: 0,
        clearCoatIntensity: 0.22,
        clearCoatRoughness: 0.16,
        environmentIntensity: 0.78,
      };
  }
}

function snapshotPbrMaterial(
  material: PBRMaterial,
): PbrMaterialSnapshot {
  return {
    metallic: material.metallic,
    roughness: material.roughness,
    environmentIntensity: material.environmentIntensity,

    clearCoatEnabled: material.clearCoat.isEnabled,
    clearCoatIntensity: material.clearCoat.intensity,
    clearCoatRoughness: material.clearCoat.roughness,

    translucencyEnabled:
      material.subSurface.isTranslucencyEnabled,
    translucencyIntensity:
      material.subSurface.translucencyIntensity,
    translucencyTintColor:
      material.subSurface.tintColor.clone(),
    useAlbedoToTintTranslucency:
      material.subSurface.useAlbedoToTintTranslucency,
  };
}

function restorePbrMaterial(
  material: PBRMaterial,
  snapshot: PbrMaterialSnapshot,
): void {
  material.metallic = snapshot.metallic;
  material.roughness = snapshot.roughness;
  material.environmentIntensity =
    snapshot.environmentIntensity;

  material.clearCoat.isEnabled =
    snapshot.clearCoatEnabled;
  material.clearCoat.intensity =
    snapshot.clearCoatIntensity;
  material.clearCoat.roughness =
    snapshot.clearCoatRoughness;

  material.subSurface.isTranslucencyEnabled =
    snapshot.translucencyEnabled;
  material.subSurface.translucencyIntensity =
    snapshot.translucencyIntensity;
  material.subSurface.tintColor.copyFrom(
    snapshot.translucencyTintColor,
  );
  material.subSurface.useAlbedoToTintTranslucency =
    snapshot.useAlbedoToTintTranslucency;
}

function tuneExistingPbrMaterial(
  material: PBRMaterial,
  kind: ToyMaterialKind,
): void {
  const options = optionsForKind(kind);

  material.metallic = options.metallic ?? 0;
  material.roughness = options.roughness ?? 0.34;
  material.environmentIntensity =
    options.environmentIntensity ?? 0.78;

  const clearCoatIntensity =
    options.clearCoatIntensity ?? 0;

  material.clearCoat.isEnabled =
    clearCoatIntensity > 0;
  material.clearCoat.intensity =
    clearCoatIntensity;
  material.clearCoat.roughness =
    options.clearCoatRoughness ?? 0.16;

  const translucent = options.translucent ?? false;

  material.subSurface.isTranslucencyEnabled =
    translucent;
  material.subSurface.translucencyIntensity =
    options.translucencyIntensity ?? 0;

  if (translucent) {
    material.subSurface.tintColor.copyFrom(
      options.tintColor ?? material.albedoColor,
    );

    material.subSurface.useAlbedoToTintTranslucency =
      true;
  }

  /*
   * Imported PBR refraction is deliberately preserved.
   *
   * GLB assets may already contain authored transparency or
   * transmission values. Generated StandardMaterial replacements
   * receive the GFX.2 glass preset through createToyPBRMaterial,
   * while imported PBR glass keeps its existing refraction setup.
   */
}

function copyStandardMaterialToPbr(
  scene: Scene,
  source: StandardMaterial,
  kind: ToyMaterialKind,
): PBRMaterial {
  const result = createToyPBRMaterial(
    scene,
    `${source.name}-gfx2-pbr-${kind}`,
    source.diffuseColor.clone(),
    optionsForKind(kind),
  );

  result.alpha = source.alpha;
  result.alphaMode = source.alphaMode;
  result.backFaceCulling = source.backFaceCulling;
  result.sideOrientation = source.sideOrientation;
  result.zOffset = source.zOffset;
  result.zOffsetUnits = source.zOffsetUnits;
  result.disableDepthWrite = source.disableDepthWrite;
  result.forceDepthWrite = source.forceDepthWrite;
  result.fogEnabled = source.fogEnabled;
  result.wireframe = source.wireframe;
  result.pointsCloud = source.pointsCloud;
  result.pointSize = source.pointSize;

  result.albedoTexture = source.diffuseTexture;
  result.bumpTexture = source.bumpTexture;
  result.opacityTexture = source.opacityTexture;
  result.emissiveTexture = source.emissiveTexture;
  result.ambientTexture = source.ambientTexture;
  result.lightmapTexture = source.lightmapTexture;
  result.reflectionTexture = source.reflectionTexture;

  result.emissiveColor.copyFrom(source.emissiveColor);
  result.useAlphaFromAlbedoTexture =
    source.useAlphaFromDiffuseTexture;

  return result;
}

export function createToyMaterialPromotionController(
  scene: Scene,
): ToyMaterialPromotionController {
  const originalMaterials =
    new Map<AbstractMesh, Material>();

  const generatedMaterials =
    new Map<
      StandardMaterial,
      Map<ToyMaterialKind, PBRMaterial>
    >();

  const generatedMultiMaterials =
    new Map<MultiMaterial, MultiMaterial>();

  const tunedImportedMaterials =
    new Map<PBRMaterial, PbrMaterialSnapshot>();

  let enabled = false;
  let disposed = false;
  let deferredRefreshTimer:
    ReturnType<typeof setTimeout> | null = null;

  const rememberAndTuneImportedPbr = (
    mesh: AbstractMesh,
    material: PBRMaterial,
  ): PBRMaterial => {
    if (!tunedImportedMaterials.has(material)) {
      tunedImportedMaterials.set(
        material,
        snapshotPbrMaterial(material),
      );
    }

    /*
     * Prefer the material name for shared imported materials.
     * The mesh name is used only when the material name does not
     * identify a semantic surface.
     */
    const kind = classifyToyMaterial(
      mesh,
      material,
      true,
    );

    tuneExistingPbrMaterial(material, kind);

    return material;
  };

  const pbrForStandardMaterial = (
    mesh: AbstractMesh,
    source: StandardMaterial,
  ): PBRMaterial => {
    const kind = classifyToyMaterial(mesh, source);

    let variants = generatedMaterials.get(source);

    if (!variants) {
      variants =
        new Map<ToyMaterialKind, PBRMaterial>();

      generatedMaterials.set(source, variants);
    }

    const existing = variants.get(kind);

    if (existing) {
      return existing;
    }

    const created = copyStandardMaterialToPbr(
      scene,
      source,
      kind,
    );

    variants.set(kind, created);

    return created;
  };

  const promoteMaterial = (
    mesh: AbstractMesh,
    material: Material,
  ): Material => {
    if (material instanceof StandardMaterial) {
      return pbrForStandardMaterial(mesh, material);
    }

    if (material instanceof PBRMaterial) {
      return rememberAndTuneImportedPbr(
        mesh,
        material,
      );
    }

    if (material instanceof MultiMaterial) {
      const existing =
        generatedMultiMaterials.get(material);

      if (existing) {
        /*
         * Existing imported PBR submaterials may have been restored
         * when quality was lowered. Tune them again before reusing
         * the generated MultiMaterial container.
         */
        for (const subMaterial of existing.subMaterials) {
          if (subMaterial instanceof PBRMaterial) {
            rememberAndTuneImportedPbr(
              mesh,
              subMaterial,
            );
          }
        }

        return existing;
      }

      const promotedMultiMaterial =
        new MultiMaterial(
          `${material.name}-gfx2-pbr`,
          scene,
        );

      promotedMultiMaterial.subMaterials =
        material.subMaterials.map((subMaterial) => {
          if (!subMaterial) {
            return null;
          }

          if (isUtilityMaterial(mesh, subMaterial)) {
            return subMaterial;
          }

          return promoteMaterial(mesh, subMaterial);
        });

      generatedMultiMaterials.set(
        material,
        promotedMultiMaterial,
      );

      return promotedMultiMaterial;
    }

    return material;
  };

  const promoteMesh = (mesh: AbstractMesh): void => {
    if (!enabled || disposed) {
      return;
    }

    const material = mesh.material;

    if (
      !material
      || isUtilityMaterial(mesh, material)
    ) {
      return;
    }

    const promotedMaterial =
      promoteMaterial(mesh, material);

    if (promotedMaterial === material) {
      return;
    }

    if (!originalMaterials.has(mesh)) {
      originalMaterials.set(mesh, material);
    }

    mesh.material = promotedMaterial;
  };

  const refresh = (): void => {
    if (!enabled || disposed) {
      return;
    }

    for (const mesh of scene.meshes) {
      promoteMesh(mesh);
    }
  };

  const scheduleDeferredRefresh = (): void => {
    if (
      !enabled
      || disposed
      || deferredRefreshTimer !== null
    ) {
      return;
    }

    /*
     * Imported meshes can be added to the scene before their
     * material is assigned. Waiting until the next task allows
     * loaders to finish attaching materials before promotion.
     */
    deferredRefreshTimer = setTimeout(() => {
      deferredRefreshTimer = null;

      if (enabled && !disposed) {
        refresh();
      }
    }, 0);
  };

  const disposeGeneratedMultiMaterials = (): void => {
    for (
      const multiMaterial
      of generatedMultiMaterials.values()
    ) {
      /*
       * Do not dispose child materials here. Generated PBR
       * children are cached and disposed independently.
       */
      multiMaterial.dispose(
        false,
        false,
        false,
      );
    }

    generatedMultiMaterials.clear();
  };

  const restore = (): void => {
    for (
      const [mesh, originalMaterial]
      of originalMaterials
    ) {
      mesh.material = originalMaterial;
    }

    originalMaterials.clear();

    disposeGeneratedMultiMaterials();

    for (
      const [material, snapshot]
      of tunedImportedMaterials
    ) {
      restorePbrMaterial(material, snapshot);
    }

    tunedImportedMaterials.clear();
  };

  const newMeshObserver =
    scene.onNewMeshAddedObservable.add(() => {
      scheduleDeferredRefresh();
    });

  const setEnabled = (
    nextEnabled: boolean,
  ): void => {
    if (
      disposed
      || enabled === nextEnabled
    ) {
      return;
    }

    enabled = nextEnabled;

    if (enabled) {
      refresh();
      scheduleDeferredRefresh();
      return;
    }

    if (deferredRefreshTimer !== null) {
      clearTimeout(deferredRefreshTimer);
      deferredRefreshTimer = null;
    }

    restore();
  };

  const dispose = (): void => {
    if (disposed) {
      return;
    }

    if (deferredRefreshTimer !== null) {
      clearTimeout(deferredRefreshTimer);
      deferredRefreshTimer = null;
    }

    restore();

    disposed = true;

    scene.onNewMeshAddedObservable.remove(
      newMeshObserver,
    );

    for (
      const variants
      of generatedMaterials.values()
    ) {
      for (const material of variants.values()) {
        material.dispose();
      }
    }

    generatedMaterials.clear();
  };

  return {
    setEnabled,
    refresh,
    dispose,
  };
}
