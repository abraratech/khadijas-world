import {
  type AbstractMesh,
  type AnimationGroup,
  Axis,
  PBRMaterial,
  Quaternion,
  SceneLoader,
  type Scene,
  type Skeleton,
  Texture,
  TransformNode,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import type {
  CharacterActivity,
  CharacterExpression,
  CharacterInteraction,
} from "../characterState";
import type { OutfitId } from "../storage";
import type { CharacterRig } from "../characters/createCharacterVisual";
import {
  findAnimationName,
  resolvePublicAssetUrl,
  type ProductionCharacterAssetDefinition,
} from "./characterAssets";

export type ProductionVisualStatus = "idle" | "loading" | "ready" | "failed" | "disposed";

export interface ProductionCharacterVisualOptions {
  metadata?: Record<string, unknown>;
  logLabel?: string;
}

export interface ProductionCharacterVisual {
  readonly status: ProductionVisualStatus;
  readonly error: string | null;
  setQualityEnabled(enabled: boolean): void;
  setOutfit(outfit: OutfitId): void;
  setExpression(expression: CharacterExpression): void;
  update(
    moving: boolean,
    activity: CharacterActivity,
    interaction: CharacterInteraction,
    hasHeldItem?: boolean,
  ): void;
  dispose(): void;
}

const isFallbackUtilityMesh = (mesh: AbstractMesh): boolean => (
  mesh.name.endsWith("-blob-shadow")
  || mesh.name.endsWith("-hello")
);

export function createProductionCharacterVisual(
  scene: Scene,
  rig: CharacterRig,
  definition: ProductionCharacterAssetDefinition,
  initiallyQualityEnabled: boolean,
  options: ProductionCharacterVisualOptions = {},
): ProductionCharacterVisual {
  const fallbackMeshes = rig.root
    .getChildMeshes(false)
    .filter((mesh: AbstractMesh) => !isFallbackUtilityMesh(mesh));
  const productionRoot = new TransformNode(`char-${definition.id}-production-root`, scene);
  productionRoot.parent = rig.root;
  productionRoot.position.y = definition.verticalOffset;
  productionRoot.rotation.y = definition.rotationY;
  // targetHeight assets are normalized after import from their actual bounds.
  productionRoot.scaling.setAll(definition.targetHeight === undefined ? definition.scale : 1);
  productionRoot.setEnabled(false);

  let currentStatus: ProductionVisualStatus = "idle";
  let currentError: string | null = null;
  let qualityEnabled = initiallyQualityEnabled;
  let poseSupportsProduction = true;
  let visibleProduction = false;
  let disposed = false;
  let currentOutfit: OutfitId = "pink";
  let importedMeshes: AbstractMesh[] = [];
  let animationGroups: AnimationGroup[] = [];
  let importedSkeletons: Skeleton[] = [];
  let importedTransformNodes: TransformNode[] = [];
  let productionMaterials: PBRMaterial[] = [];
  const outfitTextureCache = new Map<OutfitId, Texture>();
  let idleAnimation: AnimationGroup | null = null;
  let walkAnimation: AnimationGroup | null = null;
  let runAnimation: AnimationGroup | null = null;
  let walkCarryAnimation: AnimationGroup | null = null;
  let pickUpAnimation: AnimationGroup | null = null;
  let sitDownAnimation: AnimationGroup | null = null;
  let standUpAnimation: AnimationGroup | null = null;
  let activeAnimation: AnimationGroup | null = null;
  let activeAnimationMode: "loop" | "pose" | null = null;

  const setFallbackVisible = (visible: boolean): void => {
    for (const mesh of fallbackMeshes) mesh.setEnabled(visible);
  };

  const stopAnimation = (): void => {
    if (!activeAnimation) return;
    activeAnimation.stop();
    activeAnimation.reset();
    activeAnimation = null;
    activeAnimationMode = null;
  };

  const refreshVisibility = (): void => {
    if (disposed) return;
    const shouldShowProduction = currentStatus === "ready"
      && qualityEnabled
      && poseSupportsProduction;
    if (visibleProduction === shouldShowProduction) return;
    visibleProduction = shouldShowProduction;
    productionRoot.setEnabled(shouldShowProduction);
    setFallbackVisible(!shouldShowProduction);
    if (!shouldShowProduction) stopAnimation();
  };

  const playLoop = (animation: AnimationGroup | null): void => {
    if (!animation) return;
    if (activeAnimation === animation && activeAnimationMode === "loop") return;
    stopAnimation();
    animation.reset();
    animation.start(true, 1, animation.from, animation.to, false);
    activeAnimation = animation;
    activeAnimationMode = "loop";
  };

  const axisVector = (axis: "x" | "y" | "z") => {
    if (axis === "x") return Axis.X;
    if (axis === "y") return Axis.Y;
    return Axis.Z;
  };

  const applyIdlePoseAdjustments = (): void => {
    for (const adjustment of definition.idlePoseAdjustments ?? []) {
      const node = importedTransformNodes.find(({ name }) => name === adjustment.nodeName)
        ?? importedMeshes.find(({ name }) => name === adjustment.nodeName);
      if (!node) continue;

      const baseRotation = node.rotationQuaternion?.clone()
        ?? Quaternion.FromEulerAngles(node.rotation.x, node.rotation.y, node.rotation.z);
      const correction = Quaternion.RotationAxis(
        axisVector(adjustment.axis),
        adjustment.radians,
      );
      node.rotationQuaternion = adjustment.multiply === "after"
        ? baseRotation.multiply(correction)
        : correction.multiply(baseRotation);
      node.rotation.set(0, 0, 0);
      node.computeWorldMatrix(true);
    }
  };

  const getImportedWorldYBounds = (): { minY: number; maxY: number } | null => {
    productionRoot.computeWorldMatrix(true);
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (const mesh of importedMeshes) {
      if (mesh.getTotalVertices() <= 0) continue;
      mesh.computeWorldMatrix(true);
      const box = mesh.getBoundingInfo().boundingBox;
      minY = Math.min(minY, box.minimumWorld.y);
      maxY = Math.max(maxY, box.maximumWorld.y);
    }
    return Number.isFinite(minY) && Number.isFinite(maxY) && maxY > minY
      ? { minY, maxY }
      : null;
  };

  const normalizeVisualHeightAndFloor = (): void => {
    if (definition.targetHeight === undefined) return;

    productionRoot.scaling.setAll(1);
    productionRoot.position.y = 0;
    let bounds = getImportedWorldYBounds();
    if (!bounds) {
      productionRoot.scaling.setAll(definition.scale);
      productionRoot.position.y = definition.verticalOffset;
      return;
    }

    const sourceHeight = bounds.maxY - bounds.minY;
    const normalizedScale = definition.targetHeight / sourceHeight;
    productionRoot.scaling.setAll(normalizedScale);

    bounds = getImportedWorldYBounds();
    if (!bounds) return;

    const parentScaleY = Math.abs(rig.root.scaling.y) || 1;
    const desiredFloorY = rig.root.getAbsolutePosition().y
      + (definition.verticalOffset * parentScaleY);
    productionRoot.position.y += (desiredFloorY - bounds.minY) / parentScaleY;
    productionRoot.computeWorldMatrix(true);
  };

  const showStaticPose = (animation: AnimationGroup | null): void => {
    if (!animation) {
      stopAnimation();
      return;
    }
    if (activeAnimation === animation && activeAnimationMode === "pose") return;
    stopAnimation();
    animation.reset();
    animation.start(true, 1, animation.from, animation.to, false);
    const fraction = Math.max(0, Math.min(1, definition.idlePoseFraction ?? 0));
    animation.goToFrame(animation.from + ((animation.to - animation.from) * fraction));
    animation.pause();
    applyIdlePoseAdjustments();
    activeAnimation = animation;
    activeAnimationMode = "pose";
  };

  const getOutfitTexture = (outfit: OutfitId): Texture | null => {
    const cached = outfitTextureCache.get(outfit);
    if (cached) return cached;
    const path = definition.outfitTextures?.[outfit]
      ?? definition.outfitTextures?.pink;
    if (!path) return null;

    const texture = new Texture(
      resolvePublicAssetUrl(path),
      scene,
      false,
      false,
      Texture.TRILINEAR_SAMPLINGMODE,
    );
    texture.name = `char-${definition.id}-outfit-${outfit}`;
    texture.gammaSpace = true;
    texture.hasAlpha = false;
    outfitTextureCache.set(outfit, texture);
    return texture;
  };

  const applyOutfit = (outfit: OutfitId): void => {
    const texture = getOutfitTexture(outfit);
    if (!texture) return;
    for (const material of productionMaterials) {
      material.albedoTexture = texture;
      // The source Meshy material uses the same image for albedo and emissive.
      // Keep that behavior so outfit variants match the original appearance.
      material.emissiveTexture = texture;
    }
  };

  const load = async (): Promise<void> => {
    if (currentStatus !== "idle" || disposed) return;
    currentStatus = "loading";
    try {
      const result = await SceneLoader.ImportMeshAsync(
        null,
        "",
        resolvePublicAssetUrl(definition.modelPath),
        scene,
        undefined,
        ".glb",
      );
      if (disposed) {
        for (const group of result.animationGroups) group.dispose();
        for (const skeleton of result.skeletons) skeleton.dispose();
        for (const mesh of result.meshes) mesh.dispose(false, true);
        return;
      }

      importedMeshes = result.meshes;
      animationGroups = result.animationGroups;
      importedSkeletons = result.skeletons;
      importedTransformNodes = result.transformNodes;
      const importedNodes = [...result.meshes, ...result.transformNodes];
      for (const node of importedNodes) {
        if (!node.parent) node.parent = productionRoot;
      }

      const uniqueMaterials = new Set<PBRMaterial>();
      for (const mesh of importedMeshes) {
        mesh.metadata = {
          ...mesh.metadata,
          productionAssetId: definition.id,
          productionAssetVersion: definition.assetVersion,
          ...options.metadata,
        };
        mesh.isPickable = mesh.getTotalVertices() > 0;
        mesh.receiveShadows = true;
        if (mesh.material instanceof PBRMaterial) {
          uniqueMaterials.add(mesh.material);
        }
      }
      productionMaterials = [...uniqueMaterials];
      applyOutfit(currentOutfit);

      const names = animationGroups.map(({ name }) => name);
      const idleName = findAnimationName(names, definition.animations.idle);
      const walkName = findAnimationName(names, definition.animations.walk);
      const runName = findAnimationName(names, definition.animations.run);
      const walkCarryName = findAnimationName(names, definition.animations.walkCarry);
      const pickUpName = findAnimationName(names, definition.animations.pickUp);
      const sitDownName = findAnimationName(names, definition.animations.sitDown);
      const standUpName = findAnimationName(names, definition.animations.standUp);
      idleAnimation = animationGroups.find(({ name }) => name === idleName) ?? null;
      walkAnimation = animationGroups.find(({ name }) => name === walkName) ?? null;
      runAnimation = animationGroups.find(({ name }) => name === runName) ?? null;
      walkCarryAnimation = animationGroups.find(({ name }) => name === walkCarryName) ?? null;
      pickUpAnimation = animationGroups.find(({ name }) => name === pickUpName) ?? null;
      sitDownAnimation = animationGroups.find(({ name }) => name === sitDownName) ?? null;
      standUpAnimation = animationGroups.find(({ name }) => name === standUpName) ?? null;
      // Keep these semantic mappings ready for the next seating-transition pass.
      void sitDownAnimation;
      void standUpAnimation;
      for (const group of animationGroups) {
        group.stop();
        group.reset();
      }
      if (definition.idlePoseFraction !== undefined) {
        showStaticPose(walkAnimation ?? runAnimation);
      }
      normalizeVisualHeightAndFloor();

      currentStatus = "ready";
      refreshVisibility();
    } catch (error) {
      currentStatus = "failed";
      currentError = error instanceof Error ? error.message : String(error);
      productionRoot.setEnabled(false);
      setFallbackVisible(true);
      console.warn(
        `[Khadija's World] ${options.logLabel ?? definition.id} production fallback: ${currentError}`,
      );
    }
  };

  if (qualityEnabled) void load();

  return {
    get status(): ProductionVisualStatus {
      return currentStatus;
    },
    get error(): string | null {
      return currentError;
    },
    setQualityEnabled(enabled: boolean): void {
      qualityEnabled = enabled;
      if (enabled && currentStatus === "idle") void load();
      refreshVisibility();
    },
    setOutfit(outfit): void {
      currentOutfit = outfit;
      if (currentStatus === "ready") applyOutfit(outfit);
      // Outfit changes no longer disable the production visual.
      refreshVisibility();
    },
    setExpression(_expression): void {
      // The Meshy asset has a fixed friendly face. Keep the production model
      // visible for all mood choices until facial morphs or bones are added.
      refreshVisibility();
    },
    update(moving, activity, interaction, hasHeldItem = false): void {
      poseSupportsProduction = activity === "standing"
        && (interaction === "idle" || interaction === "walking");
      refreshVisibility();
      if (!visibleProduction) return;
      if (moving) {
        playLoop(
          hasHeldItem
            ? (walkCarryAnimation ?? walkAnimation ?? runAnimation)
            : (walkAnimation ?? runAnimation),
        );
      } else if (interaction === "hugging" && pickUpAnimation) {
        showStaticPose(pickUpAnimation);
      } else if (idleAnimation) {
        playLoop(idleAnimation);
      } else if (definition.idlePoseFraction !== undefined) {
        showStaticPose(walkAnimation ?? runAnimation);
      } else {
        stopAnimation();
      }
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      currentStatus = "disposed";
      stopAnimation();
      for (const group of animationGroups) group.dispose();
      for (const skeleton of importedSkeletons) skeleton.dispose();
      for (const texture of outfitTextureCache.values()) texture.dispose();
      outfitTextureCache.clear();
      productionRoot.dispose(false, true);
      setFallbackVisible(true);
    },
  };
}
