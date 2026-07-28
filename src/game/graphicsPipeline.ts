import {
  type AbstractMesh,
  type Camera,
  CascadedShadowGenerator,
  CubeTexture,
  DefaultRenderingPipeline,
  type DirectionalLight,
  ImageProcessingConfiguration,
  type Scene,
  SSAO2RenderingPipeline,
} from "@babylonjs/core";
import type { QualitySettings } from "./quality";

export type GraphicsQualityTier = "low" | "adaptive" | "balanced";

export interface GraphicsQualityProfile {
  tier: GraphicsQualityTier;
  environmentIntensity: number;
  cascadedShadows: boolean;
  ssao: boolean;
  postProcessing: boolean;
  msaaSamples: number;
  bloom: boolean;
}

export interface NextGenGraphicsController {
  setQuality(settings: QualitySettings): void;
  dispose(): void;
}

export interface NextGenGraphicsOptions {
  environmentUrl?: string;
}

const LOW_PROFILE: Readonly<GraphicsQualityProfile> = {
  tier: "low",
  environmentIntensity: 0.3,
  cascadedShadows: false,
  ssao: false,
  postProcessing: false,
  msaaSamples: 1,
  bloom: false,
};

const ADAPTIVE_PROFILE: Readonly<GraphicsQualityProfile> = {
  tier: "adaptive",
  environmentIntensity: 0.48,
  cascadedShadows: false,
  ssao: false,
  postProcessing: false,
  msaaSamples: 1,
  bloom: false,
};

const BALANCED_PROFILE: Readonly<GraphicsQualityProfile> = {
  tier: "balanced",
  environmentIntensity: 0.78,
  cascadedShadows: true,
  ssao: true,
  postProcessing: true,
  msaaSamples: 4,
  bloom: true,
};

export function graphicsProfileForQuality(
  settings: QualitySettings,
): GraphicsQualityProfile {
  if (settings.adaptive) {
    return { ...ADAPTIVE_PROFILE };
  }

  if (
    settings.enhancedLighting
    && settings.decorativeDetails
    && settings.hardwareScalingLevel <= 1.1
  ) {
    return { ...BALANCED_PROFILE };
  }

  return { ...LOW_PROFILE };
}

type ShadowRole = "ignore" | "receiver" | "caster";

function shadowRoleForMesh(mesh: AbstractMesh): ShadowRole {
  const normalizedName = mesh.name.toLowerCase();

  if (
    normalizedName.includes("sky")
    || normalizedName.includes("hotspot")
    || normalizedName.includes("snap-")
    || normalizedName.includes("marker")
    || normalizedName.includes("visible-slot")
    || normalizedName.includes("interaction")
    || normalizedName.includes("soft-shadow")
    || normalizedName.includes("target")
  ) {
    return "ignore";
  }

  if (
    normalizedName.includes("floor")
    || normalizedName.includes("ground")
    || normalizedName.includes("road")
    || normalizedName.includes("sidewalk")
    || normalizedName.includes("grass")
    || normalizedName.includes("wall")
    || normalizedName.includes("ceiling")
    || normalizedName.includes("rug")
    || normalizedName.includes("mat")
  ) {
    return "receiver";
  }

  return "caster";
}

export function createNextGenGraphicsController(
  scene: Scene,
  camera: Camera,
  sunLight: DirectionalLight,
  options: NextGenGraphicsOptions = {},
): NextGenGraphicsController {
  const environmentUrl = options.environmentUrl
    ?? "./assets/environment/studio.env";

  const previousEnvironmentTexture = scene.environmentTexture;
  const previousEnvironmentIntensity = scene.environmentIntensity;

  const imageProcessing = scene.imageProcessingConfiguration;
  const originalImageProcessing = {
    toneMappingEnabled: imageProcessing.toneMappingEnabled,
    toneMappingType: imageProcessing.toneMappingType,
    exposure: imageProcessing.exposure,
    contrast: imageProcessing.contrast,
    vignetteEnabled: imageProcessing.vignetteEnabled,
  };

  const environmentTexture = CubeTexture.CreateFromPrefilteredData(
    environmentUrl,
    scene,
  );

  scene.environmentTexture = environmentTexture;
  scene.environmentIntensity = ADAPTIVE_PROFILE.environmentIntensity;

  let shadowGenerator: CascadedShadowGenerator | null = null;
  let ssaoPipeline: SSAO2RenderingPipeline | null = null;
  let defaultPipeline: DefaultRenderingPipeline | null = null;
  let disposed = false;

  const registerShadowMesh = (mesh: AbstractMesh): void => {
    if (!shadowGenerator) return;

    const role = shadowRoleForMesh(mesh);

    if (role === "ignore") {
      mesh.receiveShadows = false;
      return;
    }

    mesh.receiveShadows = true;

    if (role === "caster") {
      shadowGenerator.addShadowCaster(mesh, false);
    }
  };

  const newMeshObserver = scene.onNewMeshAddedObservable.add(
    registerShadowMesh,
  );

  const restoreImageProcessing = (): void => {
    imageProcessing.toneMappingEnabled =
      originalImageProcessing.toneMappingEnabled;
    imageProcessing.toneMappingType =
      originalImageProcessing.toneMappingType;
    imageProcessing.exposure =
      originalImageProcessing.exposure;
    imageProcessing.contrast =
      originalImageProcessing.contrast;
    imageProcessing.vignetteEnabled =
      originalImageProcessing.vignetteEnabled;
  };

  const disposeHighEffects = (): void => {
    if (ssaoPipeline) {
      ssaoPipeline.dispose();
      ssaoPipeline = null;
    }

    if (defaultPipeline) {
      defaultPipeline.dispose();
      defaultPipeline = null;
    }

    if (shadowGenerator) {
      shadowGenerator.dispose();
      shadowGenerator = null;
    }

    restoreImageProcessing();
  };

  const createHighEffects = (
    profile: GraphicsQualityProfile,
  ): void => {
    if (!shadowGenerator) {
      shadowGenerator = new CascadedShadowGenerator(
        1024,
        sunLight,
      );

      shadowGenerator.useContactHardeningShadow = true;
      shadowGenerator.contactHardeningLightSizeUVRatio = 0.035;
      shadowGenerator.bias = 0.0008;
      shadowGenerator.normalBias = 0.015;

      // The active dollhouse room is close to the fixed camera. Keeping this
      // depth range restrained improves CSM precision and avoids spending
      // shadow resolution on distant inactive room zones.
      shadowGenerator.shadowMaxZ = 40;

      for (const mesh of scene.meshes) {
        registerShadowMesh(mesh);
      }
    }

    if (!defaultPipeline) {
      defaultPipeline = new DefaultRenderingPipeline(
        "gfx1-default-pipeline",
        true,
        scene,
        [camera],
      );

      defaultPipeline.samples = profile.msaaSamples;
      defaultPipeline.fxaaEnabled = false;

      defaultPipeline.imageProcessingEnabled = true;
      imageProcessing.toneMappingEnabled = true;
      imageProcessing.toneMappingType =
        ImageProcessingConfiguration.TONEMAPPING_ACES;
      imageProcessing.exposure = 1.04;
      imageProcessing.contrast = 1.1;
      imageProcessing.vignetteEnabled = false;

      defaultPipeline.bloomEnabled = profile.bloom;
      defaultPipeline.bloomThreshold = 0.86;
      defaultPipeline.bloomWeight = 0.14;
      defaultPipeline.bloomKernel = 32;

      // Gameplay readability takes priority over a cinematic blur effect.
      // This can later become a separate optional visual setting.
      defaultPipeline.depthOfFieldEnabled = false;
    }

    if (!ssaoPipeline) {
      ssaoPipeline = new SSAO2RenderingPipeline(
        "gfx1-ssao2",
        scene,
        {
          ssaoRatio: 0.5,
          blurRatio: 0.5,
        },
      );

      ssaoPipeline.radius = 1.25;
      ssaoPipeline.totalStrength = 0.85;
      ssaoPipeline.expensiveBlur = false;

      scene.postProcessRenderPipelineManager
        .attachCamerasToRenderPipeline(
          "gfx1-ssao2",
          camera,
        );
    }
  };

  const setQuality = (settings: QualitySettings): void => {
    if (disposed) return;

    const profile = graphicsProfileForQuality(settings);
    scene.environmentIntensity = profile.environmentIntensity;

    if (profile.postProcessing) {
      createHighEffects(profile);
      return;
    }

    disposeHighEffects();
  };

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;

    scene.onNewMeshAddedObservable.remove(newMeshObserver);
    disposeHighEffects();

    if (scene.environmentTexture === environmentTexture) {
      scene.environmentTexture = previousEnvironmentTexture;
    }

    scene.environmentIntensity = previousEnvironmentIntensity;
    environmentTexture.dispose();
  };

  return {
    setQuality,
    dispose,
  };
}
