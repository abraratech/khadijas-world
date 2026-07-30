import {
  type AbstractMesh,
  ActionManager,
  Animation,
  ArcRotateCamera,
  Camera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  ExecuteCodeAction,
  HemisphericLight,
  KeyboardEventTypes,
  type KeyboardInfo,
  Mesh,
  MeshBuilder,
  type Node,
  PointerEventTypes,
  type PointerInfo,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import type { QualitySettings } from "../quality";
import { createNextGenGraphicsController } from "../graphicsPipeline";
import { isTextEntryElement } from "../ui/focusManagement";
import {
  CHARACTER_DEFINITIONS,
  CHARACTER_IDS,
  COMPANION_CHARACTER_IDS,
  type CharacterExpression,
  type CharacterId,
  type CharacterInteraction,
  type CharacterState,
} from "../characterState";
import {
  createCharacterVisual as createCharacter,
  type CharacterRig,
  type UseGesture,
} from "../characters/createCharacterVisual";
import {
  PRODUCTION_CHARACTER_ASSETS,
  PRODUCTION_NPC_ASSETS,
  isProductionAssetAllowed,
} from "../assets/characterAssets";
import { createProductionCharacterVisual, type ProductionCharacterVisual } from "../assets/productionCharacterVisual";
import { applyHeroCharacterPolish } from "../characters/applyHeroCharacterPolish";
import { applyNpcToyOverhaul, applyToyCharacterOverhaul } from "../characters/applyNpcToyOverhaul";
import { companionSceneScale, npcSceneScale } from "../characters/castScaleNormalization";
import { applyKhadijaSculptedHero } from "../characters/applyKhadijaSculptedHero";
import { COMPANION_HERO_PROFILES, NPC_HERO_PROFILES } from "../characters/heroCharacterProfiles";
import {
  findAvailableSeat,
  findNearbyAvailableSeat,
  getSeatById,
  type SeatKind,
  type SeatSlot,
} from "../seatRegistry";
import {
  chooseLivingAction,
  createLivingController,
  NPC_DEFINITIONS,
  NPC_IDS,
  scheduleNextDecision,
  type LivingAction,
  type LivingController,
  type LivingSettings,
  type NpcId,
  type StoredNpcState,
} from "../livingCharacters";
import {
  loadSave,
  restoreProp,
  saveCharacterState,
  saveEverydayState,
  saveNpcState,
  saveProp,
  saveRoomState,
  saveWorld3State,
  type OutfitId,
  type RoomId,
} from "../storage";
import {
  ContainerController,
  EverydayStorageController,
  RecipeSystem,
  friendlyName,
  isStorageId,
} from "../everydayControllers";
import {
  STATION_IDS,
  type ContainerId,
  type StationId,
} from "../everydayState";
import type { CombinationSound } from "../combinationRegistry";
import {
  createWorld3Locations,
} from "../world3Locations";
import { recordWorld3Event } from "../world3State";
import {
  createMaterial as material,
  createWorldMaterials,
  WORLD_COLORS as colors,
} from "../shared/createMaterials";
import {
  animateRotation,
  box,
  cylinder,
} from "../shared/meshHelpers";
import {
  createSnapMarker,
  makeDraggable,
  type SnapTarget,
} from "../shared/placementHelpers";
import { buildFamilyHome } from "../locations/familyHome/buildFamilyHome";
import { buildBedroom } from "../locations/bedroom/buildBedroom";
import { buildStreet } from "../locations/street/buildStreet";
import { buildCafe } from "../locations/cafe/buildCafe";
import { applyWorldArtPolish } from "../locations/shared/applyWorldArtPolish";
import { WorldRegistry } from "./WorldRegistry";
import type { LocationBuildResult } from "./LocationBuildResult";
import {
  DisposableBag,
  registerPickInteraction,
} from "../shared/interactionHelpers";
import type {
  InteractionSound,
  PlayState,
  PrototypeRoom,
  RoomDialogueContext,
  RoomOptions,
} from "./WorldContext";
import {
  createProductionApple,
  createProductionBook,
  createProductionBowl,
  createProductionCup,
  createProductionPlate,
  createProductionTeddy,
  createProductionTray,
  presentationFor,
  type HoldablePresentation,
  type ItemMaterialPalette,
} from "../items/productionItemVisuals";
import { resolvePresentationForHolder } from "../items/holdablePresentation";
import {
  calculateDollhouseOrthoFrame,
  calculateDollhouseViewportMask,
} from "./cameraFraming";
import { applyWorldReadabilityPass } from "../readability/applyWorldReadabilityPass";
import { createInteriorFurniturePlacements } from "../assets/interiorFurnitureAssets";
import { createSelectiveInteriorFurnitureManager } from "../assets/productionFurnitureVisual";
import {
  descriptorFromMetadata,
  humanizeInteractionId,
  interactionMetadata,
  type InteractionDescriptor,
} from "../readability/interactionReadability";

export function createWorldRuntime(engine: Engine, options: RoomOptions): PrototypeRoom {
  const save = loadSave();
  const contentState = save.content;
  const everydayState = save.everyday;
  const world3State = save.world3;
  const storageController = new EverydayStorageController(everydayState);
  const containerController = new ContainerController(everydayState);
  const recipeSystem = new RecipeSystem(everydayState);
  const livingSettings: LivingSettings = { ...save.livingSettings };
  const bedroomOffsetX = 22;
  const streetOffsetX = 44;
  const cafeOffsetX = 66;
  const parkOffsetX = 88;
  const groceryOffsetX = 110;
  const roomDefinitions: Record<RoomId, {
    center: Vector3;
    spawn: Vector3;
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  }> = {
    home: {
      center: new Vector3(0, 0.8, 0.3),
      spawn: new Vector3(4.9, 0, -2.65),
      bounds: { minX: -5.25, maxX: 5.15, minZ: -3.35, maxZ: 3.45 },
    },
    bedroom: {
      center: new Vector3(bedroomOffsetX, 0.8, 0.3),
      spawn: new Vector3(bedroomOffsetX - 4.9, 0, -2.65),
      bounds: {
        minX: bedroomOffsetX - 5.15,
        maxX: bedroomOffsetX + 5.25,
        minZ: -3.35,
        maxZ: 3.45,
      },
    },
    street: {
      center: new Vector3(streetOffsetX, 0.8, 0.3),
      spawn: new Vector3(streetOffsetX - 4.65, 0, -2.55),
      bounds: {
        minX: streetOffsetX - 5.25,
        maxX: streetOffsetX + 5.25,
        minZ: -3.35,
        maxZ: 3.45,
      },
    },
    cafe: {
      center: new Vector3(cafeOffsetX, 0.8, 0.3),
      spawn: new Vector3(cafeOffsetX - 4.8, 0, -2.55),
      bounds: {
        minX: cafeOffsetX - 5.15,
        maxX: cafeOffsetX + 5.25,
        minZ: -3.35,
        maxZ: 3.45,
      },
    },
    park: {
      center: new Vector3(parkOffsetX, 0.8, 0.3),
      spawn: new Vector3(parkOffsetX - 4.8, 0, -2.55),
      bounds: {
        minX: parkOffsetX - 5.15,
        maxX: parkOffsetX + 5.25,
        minZ: -3.35,
        maxZ: 3.45,
      },
    },
    grocery: {
      center: new Vector3(groceryOffsetX, 0.8, 0.3),
      spawn: new Vector3(groceryOffsetX - 4.8, 0, -2.55),
      bounds: {
        minX: groceryOffsetX - 5.15,
        maxX: groceryOffsetX + 5.25,
        minZ: -3.35,
        maxZ: 3.45,
      },
    },
  };
  let activeRoom: RoomId = save.activeRoom;

  const setInteraction = (mesh: AbstractMesh, descriptor: InteractionDescriptor): void => {
    mesh.metadata = interactionMetadata(mesh.metadata, descriptor);
  };

  const interactionFromNode = (node: Node | null): InteractionDescriptor | null => {
    let current: Node | null = node;
    while (current) {
      const descriptor = descriptorFromMetadata((current as AbstractMesh).metadata);
      if (descriptor) return descriptor;
      current = current.parent;
    }
    return null;
  };

  const scene = new Scene(engine);
  const disposables = new DisposableBag();
  scene.clearColor = new Color4(0.78, 0.87, 0.91, 1);
  scene.ambientColor = new Color3(0.27, 0.28, 0.31);
  scene.imageProcessingConfiguration.contrast = 1.11;
  scene.imageProcessingConfiguration.exposure = 1.03;

  const camera = new ArcRotateCamera(
    "dollhouse-camera",
    -Math.PI / 2,
    1.08,
    15,
    roomDefinitions[activeRoom].center.clone(),
    scene,
  );
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  camera.lowerBetaLimit = 1.08;
  camera.upperBetaLimit = 1.08;
  camera.lowerAlphaLimit = -Math.PI / 2;
  camera.upperAlphaLimit = -Math.PI / 2;
  // The dollhouse camera is intentionally fixed. Clearing every input avoids
  // accidental orbiting, panning, or wheel zoom and also prevents a middle
  // mouse press from leaving the orthographic view in an invalid orientation.
  camera.inputs.clear();

  const renderingCanvas = engine.getRenderingCanvas();
  if (renderingCanvas) {
    const preventMiddleMouse = (event: MouseEvent): void => {
      if (event.button !== 1) return;
      event.preventDefault();
      event.stopPropagation();
    };
    renderingCanvas.addEventListener("mousedown", preventMiddleMouse);
    renderingCanvas.addEventListener("auxclick", preventMiddleMouse);
    disposables.add(() => {
      renderingCanvas.removeEventListener("mousedown", preventMiddleMouse);
      renderingCanvas.removeEventListener("auxclick", preventMiddleMouse);
    });
  }

  const updateOrtho = (): void => {
    const aspect = engine.getRenderWidth() / Math.max(engine.getRenderHeight(), 1);
    const frame = calculateDollhouseOrthoFrame(aspect);
    const mask = calculateDollhouseViewportMask(aspect);
    camera.orthoTop = frame.verticalHalfSpan;
    camera.orthoBottom = -frame.verticalHalfSpan;
    camera.orthoLeft = -frame.horizontalHalfSpan;
    camera.orthoRight = frame.horizontalHalfSpan;

    // The canvas remains full-screen for reliable rendering and pointer math,
    // while CSS clips only its visible pixels to the dollhouse shell. DOM UI
    // stays outside this mask and every Babylon interaction remains unchanged.
    if (renderingCanvas) {
      renderingCanvas.style.setProperty("--dollhouse-mask-top", `${mask.topPercent}%`);
      renderingCanvas.style.setProperty("--dollhouse-mask-right", `${mask.rightPercent}%`);
      renderingCanvas.style.setProperty("--dollhouse-mask-bottom", `${mask.bottomPercent}%`);
      renderingCanvas.style.setProperty("--dollhouse-mask-left", `${mask.leftPercent}%`);
    }
  };
  updateOrtho();
  engine.onResizeObservable.add(updateOrtho);
  disposables.add(() => engine.onResizeObservable.removeCallback(updateOrtho));

  const hemi = new HemisphericLight("soft-fill", new Vector3(0, 1, -0.4), scene);
  hemi.intensity = 0.9;
  hemi.diffuse = new Color3(.84, .91, 1.0);
  hemi.specular = new Color3(.72, .82, 1.0);
  hemi.groundColor = new Color3(.20, .24, .34);

  const sun = new DirectionalLight("window-sun", new Vector3(-0.45, -1, 0.55), scene);
  sun.position.set(4, 8, -6);
  sun.intensity = 0.42;
  sun.diffuse = new Color3(1.0, .89, .74);
  sun.specular = new Color3(1.0, .94, .84);

  const graphics = createNextGenGraphicsController(
    scene,
    camera,
    sun,
    {
      environmentUrl: "./assets/environment/studio.env",
    },
  );

  const materials = createWorldMaterials(scene);
  const {
    floorLight,
    white,
    teal,
    mint,
    wood,
    dark,
    pink,
    yellow,
    green,
    sky,
    marker: markerMaterial,
    sidewalk,
    grass,
    cafeBlue,
    glass,
  } = materials;

  const itemMaterials: ItemMaterialPalette = {
    wood,
    dark,
    pink,
    yellow,
    teal,
    sky,
    white,
    green,
  };

  const detailMeshes: Mesh[] = [];
  const world3Build = createWorld3Locations(scene, parkOffsetX, groceryOffsetX, {
    cream: floorLight,
    white,
    wood,
    dark,
    pink,
    yellow,
    green,
    teal,
    mint,
    blue: cafeBlue,
    glass,
    grass,
    sidewalk,
    hotspot: materials.world3Hotspot,
  });
  detailMeshes.push(...world3Build.detailMeshes);

  const homeBuild = buildFamilyHome({
    scene,
    materials,
    detailMeshes,
    contentState,
    onAction: options.onAction,
  });
  const { doorPivot, cupboardDoor } = homeBuild;
  let cupboardOpen = save.cupboardOpen;
  let lampOn = save.lampOn;
  let bedroomLampOn = save.bedroomLampOn;
  let enhancedLighting = false;

  const applyActiveRoomLighting = (): void => {
    if (activeRoom === "street" || activeRoom === "park") {
      hemi.intensity = enhancedLighting ? 0.96 : 1.02;
      sun.intensity = enhancedLighting ? 0.72 : 0.52;
      scene.clearColor = new Color4(0.66, 0.84, 0.94, 1);
      return;
    }

    if (activeRoom === "cafe" || activeRoom === "grocery") {
      hemi.intensity = enhancedLighting ? 0.88 : 0.96;
      sun.intensity = enhancedLighting ? 0.48 : 0.34;
      scene.clearColor = new Color4(0.86, 0.78, 0.70, 1);
      return;
    }

    const activeLampOn = activeRoom === "home" ? lampOn : bedroomLampOn;
    hemi.intensity = activeLampOn
      ? (enhancedLighting ? 0.82 : 0.94)
      : (enhancedLighting ? 0.64 : 0.74);
    sun.intensity = enhancedLighting ? 0.58 : 0.35;
    scene.clearColor = new Color4(0.78, 0.87, 0.91, 1);
  };
  doorPivot.rotation.y = cupboardOpen ? -1.65 : 0;
  cupboardDoor.actionManager = new ActionManager(scene);
  cupboardDoor.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    cupboardOpen = !cupboardOpen;
    animateRotation(scene, doorPivot, cupboardOpen ? -1.65 : 0);
    saveRoomState({ cupboardOpen, lampOn, bedroomLampOn });
    options.onAction(cupboardOpen ? "Let's see what's in the cupboard!" : "Cupboard all tidied up.");
  }));

  // Floor lamp with cheap emissive toggle rather than a dynamic point light.
  box(scene, "lamp-stand", new Vector3(0.1, 1.85, 0.1), new Vector3(-5.2, 0.92, -1.3), wood);
  const lampShadeMat = material(scene, "lamp-shade-mat", colors.yellow, lampOn ? new Color3(0.35, 0.22, 0.05) : Color3.Black());
  const lampShade = MeshBuilder.CreateCylinder("lamp-shade", { diameterTop: 0.45, diameterBottom: 0.75, height: 0.65, tessellation: 18 }, scene);
  lampShade.position.set(-5.2, 1.95, -1.3);
  lampShade.material = lampShadeMat;
  lampShade.actionManager = new ActionManager(scene);
  lampShade.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    lampOn = !lampOn;
    lampShadeMat.emissiveColor = lampOn ? new Color3(0.35, 0.22, 0.05) : Color3.Black();
    applyActiveRoomLighting();
    saveRoomState({ cupboardOpen, lampOn, bedroomLampOn });
    options.onAction(lampOn ? "The room feels warm and cozy!" : "The lamp is off for now.");
  }));

  // WORLD.1 bedroom zone. It shares one Babylon scene with the home so transitions
  // are instant and held props can travel between locations without asset reloads.
  const bedroomPosition = (x: number, y: number, z: number): Vector3 => new Vector3(
    x + bedroomOffsetX,
    y,
    z,
  );
  const streetPosition = (x: number, y: number, z: number): Vector3 => new Vector3(
    x + streetOffsetX,
    y,
    z,
  );
  const cafePosition = (x: number, y: number, z: number): Vector3 => new Vector3(
    x + cafeOffsetX,
    y,
    z,
  );
  const parkPosition = (x: number, y: number, z: number): Vector3 => new Vector3(
    x + parkOffsetX,
    y,
    z,
  );
  const groceryPosition = (x: number, y: number, z: number): Vector3 => new Vector3(
    x + groceryOffsetX,
    y,
    z,
  );

  const bedroomBuild = buildBedroom({
    scene,
    materials,
    detailMeshes,
    contentState,
    position: bedroomPosition,
    initialLampOn: bedroomLampOn,
    onLampChanged: (next) => {
      bedroomLampOn = next;
      applyActiveRoomLighting();
      saveRoomState({ cupboardOpen, lampOn, bedroomLampOn });
    },
    onAction: options.onAction,
  });
  const { bedHotspot } = bedroomBuild;

  // WORLD.2 neighborhood street. The road, garden and storefronts stay deliberately
  // mid-poly so the active-mesh budget remains suitable for older Intel integrated graphics.
  const streetBuild = buildStreet({
    scene, materials, detailMeshes, contentState,
    position: streetPosition,
    onAction: options.onAction,
  });
  const {
    benchHotspot: streetBenchHotspot,
    scooterHotspot: streetScooterHotspot,
  } = streetBuild;
  // WORLD.2 Sunny CafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© interior.
  const cafeBuild = buildCafe({
    scene, materials, detailMeshes, contentState,
    position: cafePosition,
    onAction: options.onAction,
  });
  const {
    pastryDisplayHotspot,
    seatHotspot: cafeSeatHotspot,
    drinkHotspot: cafeDrinkHotspot,
    cupcake,
    sandwich,
  } = cafeBuild;

  detailMeshes.push(...applyWorldArtPolish(scene, {
    bedroom: bedroomOffsetX,
    street: streetOffsetX,
    cafe: cafeOffsetX,
    park: parkOffsetX,
    grocery: groceryOffsetX,
  }));
  detailMeshes.push(...applyWorldReadabilityPass(scene, {
    bedroom: bedroomOffsetX,
    street: streetOffsetX,
    cafe: cafeOffsetX,
    park: parkOffsetX,
    grocery: groceryOffsetX,
  }));

  const interiorFurniture = createSelectiveInteriorFurnitureManager(
    scene,
    createInteriorFurniturePlacements({
      bedroom: bedroomOffsetX,
      cafe: cafeOffsetX,
      grocery: groceryOffsetX,
    }),
    activeRoom,
  );

  const locationRegistry = new WorldRegistry<LocationBuildResult>();
  const locationBuilds: LocationBuildResult[] = [
    homeBuild,
    bedroomBuild,
    streetBuild,
    cafeBuild,
    world3Build.locations.park,
    world3Build.locations.grocery,
  ];
  for (const location of locationBuilds) {
    locationRegistry.register(location);
  }
  locationRegistry.activate(activeRoom);
  // Door meshes are wired to the room switcher after Khadija is created.
  const doorMaterial = material(scene, "room-door-mat", colors.teal, new Color3(0.05, 0.12, 0.11));
  const homeToBedroomDoor = box(
    scene,
    "home-to-bedroom-door",
    new Vector3(1.35, 2.75, 0.24),
    new Vector3(5.72, 1.37, -2.45),
    doorMaterial,
  );
  const homeToStreetDoor = box(
    scene,
    "home-to-street-door",
    new Vector3(1.35, 2.75, 0.24),
    new Vector3(-5.72, 1.37, -2.45),
    doorMaterial,
  );
  const bedroomToHomeDoor = box(
    scene,
    "bedroom-to-home-door",
    new Vector3(1.35, 2.75, 0.24),
    bedroomPosition(-5.72, 1.37, -2.45),
    doorMaterial,
  );
  const streetToHomeDoor = box(
    scene,
    "street-to-home-door",
    new Vector3(1.3, 2.55, 0.24),
    streetPosition(-3.35, 1.28, 3.25),
    doorMaterial,
  );
  const streetToCafeDoor = box(
    scene,
    "street-to-cafe-door",
    new Vector3(1.3, 2.55, 0.24),
    streetPosition(3.45, 1.28, 3.25),
    doorMaterial,
  );
  const cafeToStreetDoor = box(
    scene,
    "cafe-to-street-door",
    new Vector3(1.35, 2.75, 0.24),
    cafePosition(-5.72, 1.37, -2.45),
    doorMaterial,
  );
  const streetToParkDoor = box(
    scene,
    "street-to-park-gate",
    new Vector3(.72, 2.2, .24),
    streetPosition(-5.55, 1.1, -.25),
    green,
  );
  const streetToGroceryDoor = box(
    scene,
    "street-to-grocery-door",
    new Vector3(.72, 2.2, .24),
    streetPosition(5.55, 1.1, -.25),
    yellow,
  );

  const homeBedroomSign = box(scene, "home-bedroom-sign", new Vector3(0.72, 0.34, 0.08), new Vector3(5.72, 2.15, -2.6), pink);
  const homeStreetSign = box(scene, "home-street-sign", new Vector3(0.72, 0.34, 0.08), new Vector3(-5.72, 2.15, -2.6), yellow);
  const bedroomHomeSign = box(scene, "bedroom-home-sign", new Vector3(0.72, 0.34, 0.08), bedroomPosition(-5.72, 2.15, -2.6), teal);
  const streetHomeSign = box(scene, "street-home-sign", new Vector3(0.72, 0.34, 0.08), streetPosition(-3.35, 2.08, 3.08), yellow);
  const streetCafeSign = box(scene, "street-cafe-sign", new Vector3(0.72, 0.34, 0.08), streetPosition(3.45, 2.08, 3.08), pink);
  const cafeStreetSign = box(scene, "cafe-street-sign", new Vector3(0.72, 0.34, 0.08), cafePosition(-5.72, 2.15, -2.6), yellow);
  for (const sign of [
    homeBedroomSign,
    homeStreetSign,
    bedroomHomeSign,
    streetHomeSign,
    streetCafeSign,
    cafeStreetSign,
  ]) {
    sign.isPickable = false;
  }

  // Snap targets strengthen object placement without physics cost.
  const makeTargets = (definitions: Array<[string, Vector3]>): SnapTarget[] => definitions.map(([name, position], index) => ({
    name,
    position,
    marker: createSnapMarker(scene, `snap-${name}-${index}`, position, markerMaterial),
    occupiedBy: null,
  }));

  const plantTargets = makeTargets([
    ["coffee table", new Vector3(-2.6, 0.98, -1.8)],
    ["TV console", new Vector3(-4.15, 0.82, -2.35)],
    ["kitchen island", new Vector3(3.05, 1.48, 0.55)],
    ["window corner", new Vector3(-5.15, 0.22, 2.8)],
    ["bedroom desk", bedroomPosition(4.2, 1.24, 2.82)],
    ["bedroom window", bedroomPosition(-0.9, 0.22, 2.95)],
    ["street bench", streetPosition(-2.75, 0.82, 1.12)],
    ["cafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© window", cafePosition(-4.85, 0.22, 2.75)],
  ]);
  const teddyTargets = makeTargets([
    ["rug", new Vector3(-1.2, 0.38, -0.6)],
    ["sofa", new Vector3(-2.3, 1.02, 0.18)],
    ["coffee table", new Vector3(-3.0, 1.02, -1.8)],
    ["kitchen floor", new Vector3(1.8, 0.38, 1.0)],
    ["bed", bedroomPosition(-3.25, 1.28, 0.35)],
    ["bedroom rug", bedroomPosition(0.4, 0.38, -0.45)],
    ["toy shelf", bedroomPosition(0.45, 1.45, 3.0)],
    ["street bench", streetPosition(-1.8, 0.92, 1.12)],
    ["cafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© toy shelf", cafePosition(-4.7, 1.35, 2.82)],
    ["cafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© rug", cafePosition(-2.6, 0.38, -0.55)],
  ]);
  const bookTargets = makeTargets([
    ["coffee table", new Vector3(-3.1, 0.86, -1.72)],
    ["sofa", new Vector3(-4.0, 0.88, 0.2)],
    ["TV console", new Vector3(-4.8, 0.68, -2.35)],
    ["kitchen island", new Vector3(3.9, 1.27, 0.55)],
    ["bedroom desk", bedroomPosition(3.55, 1.18, 2.8)],
    ["bed", bedroomPosition(-3.7, 1.2, 0.2)],
    ["street bench", streetPosition(-2.25, 0.85, 1.12)],
    ["cafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© table", cafePosition(-3.5, 1.08, 0.95)],
    ["cafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© counter", cafePosition(2.85, 1.36, 1.92)],
  ]);
  const foodTargets = makeTargets([
    ["kitchen island", new Vector3(3.2, 1.42, 0.55)],
    ["coffee table", new Vector3(-2.25, 0.88, -1.75)],
    ["sofa", new Vector3(-2.65, 0.93, 0.15)],
    ["kitchen floor", new Vector3(2.15, 0.22, -0.25)],
    ["bedroom desk", bedroomPosition(4.05, 1.24, 2.8)],
    ["bedside", bedroomPosition(-1.2, 0.25, 0.95)],
    ["street bench", streetPosition(-2.15, 0.88, 1.12)],
    ["cafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© table", cafePosition(-3.25, 1.08, 0.92)],
    ["pastry counter", cafePosition(4.2, 1.28, 0.55)],
  ]);
  const cupTargets = makeTargets([
    ["kitchen island", new Vector3(4.15, 1.42, 0.55)],
    ["coffee table", new Vector3(-2.0, 0.91, -1.75)],
    ["TV console", new Vector3(-4.45, 0.75, -2.35)],
    ["kitchen counter", new Vector3(5.1, 1.28, 3.15)],
    ["bedroom desk", bedroomPosition(4.45, 1.28, 2.8)],
    ["bedside", bedroomPosition(-1.45, 0.26, 1.05)],
    ["street bench", streetPosition(-1.85, 0.9, 1.12)],
    ["cafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© table", cafePosition(-3.75, 1.12, 0.98)],
    ["cafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© counter", cafePosition(3.0, 1.38, 1.9)],
  ]);

  const placementTargets = [
    ...plantTargets,
    ...teddyTargets,
    ...bookTargets,
    ...foodTargets,
    ...cupTargets,
  ];
  for (const location of locationBuilds) {
    const bounds = roomDefinitions[location.id].bounds;
    location.placementSlots.push(...placementTargets.filter(({ position }) => (
      position.x >= bounds.minX
      && position.x <= bounds.maxX
      && position.z >= bounds.minZ
      && position.z <= bounds.maxZ
    )));
  }

  restoreProp(cupcake);
  makeDraggable(cupcake, 0.22, foodTargets, options.onAction);
  restoreProp(sandwich);
  makeDraggable(sandwich, 0.18, foodTargets, options.onAction);

  const plantPot = MeshBuilder.CreateCylinder("draggable-plant", { diameterTop: 0.35, diameterBottom: 0.48, height: 0.42, tessellation: 14 }, scene);
  plantPot.position.set(-2.6, 0.98, -1.8);
  plantPot.material = pink;
  const foliage = MeshBuilder.CreateSphere("plant-foliage", { diameter: 0.7, segments: 10 }, scene);
  foliage.scaling.set(0.7, 1.0, 0.7);
  foliage.position.y = 0.48;
  foliage.material = green;
  foliage.parent = plantPot;
  foliage.isPickable = false;
  restoreProp(plantPot);
  makeDraggable(plantPot, 0.22, plantTargets, options.onAction);

  const teddy = createProductionTeddy(
    scene,
    new Vector3(-1.2, .42, -.6),
    itemMaterials,
  );
  restoreProp(teddy);
  makeDraggable(teddy, .42, teddyTargets, options.onAction);

  const book = createProductionBook(
    scene,
    new Vector3(-3.1, .86, -1.72),
    itemMaterials,
  );
  restoreProp(book);
  makeDraggable(book, .09, bookTargets, options.onAction);

  // Wardrobe benchmark: three low-cost outfit choices, usable in-world or from the HUD.
  box(scene, "wardrobe-body", new Vector3(1.75, 2.7, 0.72), new Vector3(4.95, 1.35, -2.95), wood);
  box(scene, "wardrobe-inside", new Vector3(1.5, 2.42, 0.12), new Vector3(4.95, 1.38, -3.34), dark);
  box(scene, "wardrobe-rail", new Vector3(1.3, 0.07, 0.08), new Vector3(4.95, 2.3, -3.43), white);
  const wardrobeOutfits: Array<[OutfitId, Color3, number]> = [
    ["pink", colors.pink, 4.5],
    ["teal", colors.teal, 4.95],
    ["yellow", colors.yellow, 5.4],
  ];
  const wardrobeButtons = wardrobeOutfits.map(([outfit, outfitColor, x]) => {
    const shirt = box(scene, `wardrobe-${outfit}`, new Vector3(0.34, 0.72, 0.18), new Vector3(x, 1.72, -3.47), material(scene, `wardrobe-${outfit}-mat`, outfitColor));
    shirt.metadata = { outfit };
    return shirt;
  });
  box(scene, "wardrobe-drawer", new Vector3(1.35, 0.48, 0.42), new Vector3(4.95, 0.45, -3.38), mint);

  // ART.1A keeps the family state records for save compatibility, but Khadija
  // is now the only player-controlled character. Her siblings remain living
  // companion NPCs with their existing autonomous behavior and saved state.
  const characters: Record<CharacterId, CharacterState> = save.characters;
  const selectedCharacterId: CharacterId = "khadija";
  activeRoom = save.activeRoom;
  characters.khadija.room = activeRoom;
  const characterRigs = {} as Record<CharacterId, CharacterRig>;
  const outfitColors: Record<OutfitId, Color3> = {
    pink: colors.pink,
    teal: colors.teal,
    yellow: colors.yellow,
  };

  for (const characterId of CHARACTER_IDS) {
    const state = characters[characterId];
    const characterDefinition = CHARACTER_DEFINITIONS[characterId];
    const roomDefinition = roomDefinitions[state.room];
    const savedPosition = new Vector3(state.position.x, 0, state.position.z);
    const positionIsValid = savedPosition.x >= roomDefinition.bounds.minX
      && savedPosition.x <= roomDefinition.bounds.maxX
      && savedPosition.z >= roomDefinition.bounds.minZ
      && savedPosition.z <= roomDefinition.bounds.maxZ;
    const rig = createCharacter(
      scene,
      characterId,
      positionIsValid ? savedPosition : roomDefinition.spawn.clone(),
      outfitColors[state.outfit],
      characterDefinition.scale,
      true,
      characterId,
    );
    rig.root.rotation.y = state.rotationY;
    rig.setBounds(
      roomDefinition.bounds.minX,
      roomDefinition.bounds.maxX,
      roomDefinition.bounds.minZ,
      roomDefinition.bounds.maxZ,
    );
    if (characterId === "khadija") {
      applyKhadijaSculptedHero(scene, rig);
    }

    rig.setExpression(state.expression);
    rig.setSelected(characterId === selectedCharacterId);
    const companionHeroProfile = COMPANION_HERO_PROFILES[characterId];
    if (companionHeroProfile) {
      applyHeroCharacterPolish(scene, rig, companionHeroProfile);
      applyToyCharacterOverhaul(scene, rig, companionHeroProfile);
      rig.root.scaling.scaleInPlace(
        companionSceneScale(characterId),
      );
      rig.root.scaling.scaleInPlace(
        companionSceneScale(characterId),
      );
    }
    characterRigs[characterId] = rig;
  }

  let mediumHighProductionEnabled = save.qualityPreset !== "low";
  const characterProductionVisuals: Partial<
    Record<CharacterId, ProductionCharacterVisual>
  > = {};

  for (const characterId of CHARACTER_IDS) {
    const productionDefinition = PRODUCTION_CHARACTER_ASSETS[characterId];
    if (!productionDefinition) continue;
    const eagerOrCurrent = characterId === "khadija"
      || characters[characterId].room === activeRoom;
    const productionVisual = createProductionCharacterVisual(
      scene,
      characterRigs[characterId],
      productionDefinition,
      eagerOrCurrent
        && isProductionAssetAllowed(productionDefinition, mediumHighProductionEnabled),
      {
        metadata: {
          characterId,
        },
        logLabel: CHARACTER_DEFINITIONS[characterId].shortName,
      },
    );
    productionVisual.setOutfit(characters[characterId].outfit);
    productionVisual.setExpression(characters[characterId].expression);
    characterProductionVisuals[characterId] = productionVisual;
  }

  const khadijaProductionVisual: ProductionCharacterVisual = {
    status: "idle",
    error: null,

    setQualityEnabled(): void {
      // CHAR.1 keeps procedural Khadija active on every quality level.
    },

    setOutfit(): void {
      // CharacterRig applies procedural outfit changes.
    },

    setExpression(): void {
      // CharacterRig applies procedural facial expressions.
    },

    update(): void {
      // CharacterRig handles movement, activity, and interaction poses.
    },

    dispose(): void {
      // No imported Khadija resources were created.
    },
  };

  const npcStates: Record<NpcId, StoredNpcState> = save.npcs;
  const npcRigs = {} as Record<NpcId, CharacterRig>;
  const npcOutfitColors = {
    pink: new Color3(.62, .28, .48),
    teal: new Color3(.12, .48, .43),
    yellow: new Color3(.76, .52, .16),
  };
  const npcHelloMaterials = {
    pink: material(scene, "npc-hello-pink-mat", colors.pink, new Color3(.22, .08, .12)),
    yellow: material(scene, "npc-hello-yellow-mat", colors.yellow, new Color3(.22, .12, .04)),
  };
  const npcProductionVisuals: Partial<
    Record<NpcId, ProductionCharacterVisual>
  > = {};
  const npcBounds: Record<NpcId, {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  }> = {
    parent: { minX: 1.25, maxX: 2.25, minZ: .8, maxZ: 1.9 },
    neighbor: { minX: 39.1, maxX: 41.05, minZ: -1.55, maxZ: .35 },
    "cafe-worker": { minX: 68.6, maxX: 70.35, minZ: 2.25, maxZ: 3.25 },
    "park-keeper": { minX: 83.4, maxX: 86.15, minZ: .55, maxZ: 2.2 },
    "park-parent": { minX: 90.3, maxX: 92.0, minZ: -.7, maxZ: .65 },
    shopkeeper: { minX: 110.8, maxX: 112.6, minZ: -2.65, maxZ: -1.25 },
    "grocery-shopper": { minX: 106.15, maxX: 108.2, minZ: -.75, maxZ: 1.0 },
  };

  for (const npcId of NPC_IDS) {
    const definition = NPC_DEFINITIONS[npcId];
    const state = npcStates[npcId];
    const rig = createCharacter(
      scene,
      `npc-${npcId}`,
      new Vector3(state.position.x, 0, state.position.z),
      npcOutfitColors[definition.outfit],
      definition.scale,
      true,
    );
    // Hero-style procedural profiles provide a cohesive, fully animated cast.
    // Mama now remains procedural on every quality tier because her archived
    // Meshy GLB has no true idle/talk animation and reads as static in play.
    applyHeroCharacterPolish(scene, rig, NPC_HERO_PROFILES[npcId]);
    applyNpcToyOverhaul(scene, rig, NPC_HERO_PROFILES[npcId]);
    rig.root.scaling.scaleInPlace(
      npcSceneScale(npcId),
    );
    rig.root.scaling.scaleInPlace(
      npcSceneScale(npcId),
    );
    const bounds = npcBounds[npcId];
    rig.setBounds(bounds.minX, bounds.maxX, bounds.minZ, bounds.maxZ);
    rig.root.rotation.y = state.rotationY;
    if (npcId === "cafe-worker") {
      state.rotationY = 0;
      rig.root.rotation.y = 0;
    }
    rig.setExpression(
      npcId === "cafe-worker" || npcId === "shopkeeper" || npcId === "park-keeper"
        ? "happy"
        : "neutral",
    );
    for (const childMesh of rig.root.getChildMeshes()) {
      childMesh.metadata = {
        ...childMesh.metadata,
        npcId,
        interactionPrompt: definition.interactionPrompt,
      };
    }
    const helloIcon = MeshBuilder.CreateSphere(
      `npc-${npcId}-hello`,
      { diameter: .2, segments: 8 },
      scene,
    );
    helloIcon.position.set(0, 2.42, 0);
    helloIcon.scaling.set(1, 1.25, .5);
    helloIcon.material = npcId === "cafe-worker"
      ? npcHelloMaterials.yellow
      : npcHelloMaterials.pink;
    helloIcon.parent = rig.root;
    helloIcon.metadata = { npcId, interactionPrompt: definition.interactionPrompt };
    const productionDefinition = PRODUCTION_NPC_ASSETS[npcId];
    if (productionDefinition) {
      // Imported NPC visuals are optional and location-aware. The active
      // registry is currently empty because every world NPC, including Mama,
      // uses the cohesive hero-procedural system.
      const eagerOrCurrent = npcId === "parent" || state.room === activeRoom;
      npcProductionVisuals[npcId] = createProductionCharacterVisual(
        scene,
        rig,
        productionDefinition,
        eagerOrCurrent
          && isProductionAssetAllowed(productionDefinition, mediumHighProductionEnabled),
        {
          metadata: {
            npcId,
            interactionPrompt: definition.interactionPrompt,
          },
          logLabel: definition.displayName,
        },
      );
    }
    npcRigs[npcId] = rig;
  }

  const playableControllers = {} as Record<CharacterId, LivingController>;
  const playableAnchors = {} as Record<CharacterId, Vector3>;
  CHARACTER_IDS.forEach((characterId, index) => {
    playableControllers[characterId] = createLivingController(index + 1);
    playableAnchors[characterId] = characterRigs[characterId].root.position.clone();
  });
  const npcControllers = {} as Record<NpcId, LivingController>;
  NPC_IDS.forEach((npcId, index) => {
    npcControllers[npcId] = createLivingController(index + 7);
  });

  interface HoldableItem {
    id: string;
    label: string;
    mesh: Mesh;
    floorY: number;
    holdScale: Vector3;
    holdOffset?: Vector3;
    holdRotation?: Vector3;
    presentation?: HoldablePresentation;
    useMessage: string;
    gesture: UseGesture;
    consumable: boolean;
    respawnPosition?: Vector3;
    respawnMessage?: string;
    recipeIngredientId?: string;
  }

  const holdables = new Map<string, HoldableItem>();
  const registerWorld3Holdable = (
    id: string,
    label: string,
    mesh: Mesh,
    gesture: UseGesture,
    consumable = false,
  ): void => {
    holdables.set(id, {
      id,
      label,
      mesh,
      floorY: .24,
      holdScale: new Vector3(.78, .78, .78),
      useMessage: gesture === "drink"
        ? `sips the ${label}`
        : gesture === "eat"
          ? `tastes the ${label}`
          : `plays with the ${label}`,
      gesture,
      consumable,
      respawnPosition: mesh.position.clone(),
      respawnMessage: `Another ${label} is waiting on the grocery shelf`,
      recipeIngredientId: ({
        "shop-bread": "bread",
        "shop-cheese": "cheese",
        "shop-apple": "apple",
        "shop-banana": "banana",
        "shop-berries": "berries",
        "shop-cake-mix": "cake-mix",
        "shop-tea-leaves": "tea-leaves",
      } as Record<string, string>)[id],
    });
  };
  registerWorld3Holdable(
    "shopping-basket",
    "shopping basket",
    world3Build.containerMeshes.shoppingBasket,
    "hug",
  );
  registerWorld3Holdable(
    "shopping-bag",
    "shopping bag",
    world3Build.containerMeshes.shoppingBag,
    "hug",
  );
  registerWorld3Holdable(
    "picnic-basket",
    "picnic basket",
    world3Build.containerMeshes.picnicBasket,
    "hug",
  );
  registerWorld3Holdable(
    "watering-can",
    "watering can",
    world3Build.containerMeshes.wateringCan,
    "hug",
  );
  registerWorld3Holdable(
    "camera",
    "pretend camera",
    world3Build.containerMeshes.camera,
    "hug",
  );
  for (const [id, productMesh] of Object.entries(world3Build.productHotspots)) {
    const gesture: UseGesture = id === "shop-juice" || id === "shop-milk"
      ? "drink"
      : id === "shop-cupcake"
        ? "eat"
        : "hug";
    registerWorld3Holdable(
      id,
      friendlyName(id.replace(/^shop-/, "")),
      productMesh,
      gesture,
      gesture === "eat" || gesture === "drink",
    );
  }
  for (const id of ["shopping-basket", "shopping-bag", "picnic-basket"] as const) {
    const item = holdables.get(id);
    if (!item) continue;
    for (let slot = 0; slot < 3; slot += 1) {
      const dot = MeshBuilder.CreateSphere(`${id}-visible-slot-${slot}`, { diameter: .13, segments: 6 }, scene);
      dot.position.set((slot - 1) * .18, .37, 0);
      dot.material = [pink, yellow, sky][slot];
      dot.parent = item.mesh;
      dot.isPickable = false;
    }
  }
  const everydayTargets = new Map<string, Mesh>();
  const everydayTargetMaterial = material(scene, "everyday-target-mat", colors.yellow);
  everydayTargetMaterial.alpha = 0.035;

  const everydayTarget = (
    id: string,
    room: RoomId,
    position: Vector3,
    size = new Vector3(.85, .8, .65),
  ): Mesh => {
    const target = box(scene, `everyday-${id}`, size, position, everydayTargetMaterial);
    target.metadata = { everydayTarget: id, room };
    everydayTargets.set(id, target);
    return target;
  };

  // Small, visible kitchen tools make the recipes discoverable without a recipe screen.
  const toasterBody = box(scene, "home-toaster", new Vector3(.7, .48, .5), new Vector3(5.05, 1.39, 3.08), pink);
  box(scene, "home-toaster-slot", new Vector3(.42, .04, .18), new Vector3(0, .26, 0), dark, toasterBody).isPickable = false;
  const blenderBody = cylinder(scene, "home-blender", .52, .65, new Vector3(4.35, 1.47, 3.08), glass, 14);
  box(scene, "home-blender-base", new Vector3(.56, .22, .48), new Vector3(4.35, 1.18, 3.08), teal).isPickable = false;
  const kettleBody = MeshBuilder.CreateSphere("home-kettle", { diameter: .58, segments: 10 }, scene);
  kettleBody.position.set(3.5, 1.43, 3.08);
  kettleBody.material = sky;
  const ovenBody = box(scene, "home-oven", new Vector3(.95, 1.0, .5), new Vector3(5.15, .55, 2.58), dark);
  const ovenWindow = box(scene, "home-oven-window", new Vector3(.62, .42, .04), new Vector3(0, .05, -.27), glass, ovenBody);
  ovenWindow.isPickable = false;
  box(scene, "home-bin", new Vector3(.58, .72, .52), new Vector3(5.05, .36, .72), teal);
  createProductionPlate(
    scene,
    "home-prep-plate",
    new Vector3(4.28, 1.43, .55),
    itemMaterials,
  );
  createProductionBowl(
    scene,
    "home-mixing-bowl",
    new Vector3(2.52, 1.47, .55),
    itemMaterials,
  );
  const applianceVisuals: Record<string, TransformNode> = {
    toaster: toasterBody,
    blender: blenderBody,
    kettle: kettleBody,
    oven: ovenBody,
  };

  everydayTarget("toaster", "home", new Vector3(5.05, 1.48, 3.02));
  everydayTarget("blender", "home", new Vector3(4.35, 1.52, 3.02));
  everydayTarget("kettle", "home", new Vector3(3.5, 1.48, 3.02));
  everydayTarget("oven", "home", new Vector3(5.15, .72, 2.48), new Vector3(1.0, 1.25, .7));
  everydayTarget("prep-plate", "home", new Vector3(4.28, 1.57, .55), new Vector3(.78, .35, .72));
  everydayTarget("mixing-bowl", "home", new Vector3(2.52, 1.62, .55), new Vector3(.78, .45, .72));
  everydayTarget("fridge-shelves", "home", new Vector3(2.3, 1.45, 2.32), new Vector3(1.55, 2.9, .45));
  everydayTarget("kitchen-drawer", "home", new Vector3(4.45, .62, 2.55), new Vector3(.85, .55, .35));
  everydayTarget("kitchen-cupboard", "home", new Vector3(4.85, 1.9, 3.34), new Vector3(1.8, 1.7, .5));
  everydayTarget("cafe-display", "cafe", cafePosition(4.55, 1.35, .45), new Vector3(1.8, 1.45, .7));
  everydayTarget("return-tray", "cafe", cafePosition(2.45, 1.42, 1.75), new Vector3(1.0, .35, .7));

  // Bedroom hygiene nook: characters stay fully clothed and use bubbles and towels.
  const bathroomFloor = box(scene, "bedroom-bath-mat", new Vector3(2.75, .06, 1.55), bedroomPosition(2.55, .03, -1.82), sky);
  bathroomFloor.isPickable = false;
  cylinder(scene, "bedroom-bath-sink", .92, .22, bedroomPosition(3.55, 1.02, -1.55), white, 18);
  box(scene, "bedroom-bath", new Vector3(1.65, .68, .9), bedroomPosition(2.2, .36, -1.95), white);
  const bathroomMirror = box(scene, "bedroom-bath-mirror", new Vector3(.9, 1.15, .06), bedroomPosition(3.55, 1.92, -1.25), glass);
  bathroomMirror.isPickable = false;
  box(scene, "bedroom-toy-box", new Vector3(1.35, .62, .82), bedroomPosition(.9, .31, -.55), pink);
  for (let index = 0; index < 5; index += 1) {
    const bubble = MeshBuilder.CreateSphere(`bath-bubble-${index}`, { diameter: .22 + (index % 2) * .08, segments: 7 }, scene);
    bubble.position.copyFrom(bedroomPosition(1.7 + index * .25, .72 + (index % 2) * .12, -1.95));
    bubble.material = white;
    bubble.isPickable = false;
  }
  everydayTarget("wash-hands", "bedroom", bedroomPosition(3.55, 1.15, -1.55), new Vector3(1.0, 1.1, .8));
  everydayTarget("brush-teeth", "bedroom", bedroomPosition(3.82, 1.72, -1.28), new Vector3(.5, .8, .38));
  everydayTarget("bath-time", "bedroom", bedroomPosition(2.2, .65, -1.95), new Vector3(1.8, 1.1, 1.1));
  everydayTarget("use-towel", "bedroom", bedroomPosition(1.2, 1.35, -1.62), new Vector3(.55, 1.5, .5));
  everydayTarget("mirror-smile", "bedroom", bedroomPosition(3.55, 2.0, -1.28), new Vector3(1.0, 1.3, .35));
  everydayTarget("wardrobe-shelves", "bedroom", bedroomPosition(4.85, 1.45, -3.12), new Vector3(1.9, 2.9, .45));
  everydayTarget("toy-box", "bedroom", bedroomPosition(.9, .55, -.55), new Vector3(1.5, .9, 1.0));

  everydayTarget("clean-table", "home", new Vector3(-2.6, .86, -1.8), new Vector3(2.4, .5, 1.35));
  everydayTarget("clean-counter", "home", new Vector3(4.15, 1.25, 3.0), new Vector3(4.25, .38, 1.2));
  everydayTarget("wash-dish", "home", new Vector3(4.0, 1.28, 3.05), new Vector3(.9, .65, .8));
  everydayTarget("bin-rubbish", "home", new Vector3(5.05, .45, .72), new Vector3(.75, .9, .7));
  everydayTarget("tidy-books", "bedroom", bedroomPosition(1.0, 1.05, 2.72), new Vector3(2.4, 1.5, .8));
  everydayTarget("tidy-clothes", "bedroom", bedroomPosition(4.85, 1.45, -3.2), new Vector3(2.0, 2.9, .5));

  const ingredientDefinitions: Array<[string, string, Vector3, StandardMaterial, number]> = [
    ["bread", "bread", new Vector3(2.05, 1.65, 2.28), white, .16],
    ["cheese", "cheese", new Vector3(2.35, 1.65, 2.28), yellow, .14],
    ["berries", "berries", new Vector3(2.65, 1.65, 2.28), pink, .15],
    ["cake-mix", "cake mix", new Vector3(2.05, 1.95, 2.28), cafeBlue, .18],
    ["banana", "banana", new Vector3(2.35, 1.95, 2.28), yellow, .16],
    ["tea-leaves", "tea leaves", new Vector3(4.7, 2.08, 3.3), green, .15],
    ["sponge", "sponge", new Vector3(4.45, .68, 2.38), yellow, .14],
    ["towel", "towel", bedroomPosition(1.2, 1.35, -1.62), pink, .12],
    ["rubbish", "wrapper", new Vector3(-2.2, .12, -1.45), white, .12],
    ["clothes", "folded clothes", bedroomPosition(3.75, .16, -1.45), teal, .14],
    ["toy-block", "toy block", bedroomPosition(.2, .22, -.45), yellow, .18],
  ];
  for (const [id, label, position, itemMaterial, radius] of ingredientDefinitions) {
    const mesh = id === "bread" || id === "towel"
      ? box(scene, `draggable-${id}`, new Vector3(.45, .14, .35), position, itemMaterial)
      : MeshBuilder.CreateSphere(`draggable-${id}`, { diameter: radius * 2, segments: 8 }, scene);
    if (!(id === "bread" || id === "towel")) {
      mesh.position.copyFrom(position);
      mesh.material = itemMaterial;
    }
    holdables.set(id, {
      id,
      label,
      mesh,
      floorY: radius,
      holdScale: new Vector3(.8, .8, .8),
      useMessage: `looks at the ${label}`,
      gesture: "hug",
      consumable: false,
    });
  }

  const preparedDefinitions: Array<[string, string, Vector3, StandardMaterial, UseGesture]> = [
    ["prepared-fruit-bowl", "fruit bowl", new Vector3(2.52, 1.58, .55), pink, "eat"],
    ["toast", "toast", new Vector3(5.05, 1.68, 3.02), white, "eat"],
    ["juice", "fruit juice", new Vector3(4.35, 1.68, 3.02), pink, "drink"],
    ["tea", "warm tea", new Vector3(3.5, 1.68, 3.02), wood, "drink"],
  ];
  for (const [id, label, position, itemMaterial, gesture] of preparedDefinitions) {
    const mesh = gesture === "drink"
      ? cylinder(scene, `draggable-${id}`, .34, .46, position, itemMaterial, 12)
      : box(scene, `draggable-${id}`, new Vector3(.5, .18, .38), position, itemMaterial);
    mesh.setEnabled((everydayState.preparedCounts[id] ?? 0) > 0);
    holdables.set(id, {
      id,
      label,
      mesh,
      floorY: .2,
      holdScale: new Vector3(.75, .75, .75),
      useMessage: gesture === "drink" ? `sips the ${label}` : `tastes the ${label}`,
      gesture,
      consumable: true,
      respawnPosition: position.clone(),
      respawnMessage: `The ${label} is ready again`,
    });
  }

  const portableDefinitions: Array<[ContainerId, string, Vector3, StandardMaterial]> = [
    ["backpack", "backpack", bedroomPosition(1.8, .42, 2.65), cafeBlue],
    ["basket", "basket", streetPosition(-4.35, .42, -1.85), wood],
    ["serving-tray", "serving tray", cafePosition(2.4, 1.35, 1.75), teal],
  ];
  for (const [id, label, position, itemMaterial] of portableDefinitions) {
    const mesh = id === "serving-tray"
      ? createProductionTray(scene, position, itemMaterials)
      : box(scene, `draggable-${id}`, new Vector3(.68, .48, .38), position, itemMaterial);
    for (let slot = 0; slot < 3; slot += 1) {
      const dot = MeshBuilder.CreateSphere(`${id}-visible-slot-${slot}`, { diameter: .13, segments: 6 }, scene);
      dot.position.set((slot - 1) * .18, .31, 0);
      dot.material = [pink, yellow, sky][slot];
      dot.parent = mesh;
      dot.isPickable = false;
      dot.setEnabled(slot < everydayState.containerContents[id].length);
    }
    holdables.set(id, {
      id,
      label,
      mesh,
      floorY: .24,
      holdScale: new Vector3(.78, .78, .78),
      useMessage: `checks the ${label}`,
      gesture: "hug",
      consumable: false,
    });
  }

  const seats: readonly SeatSlot[] = [
    ...homeBuild.seats,
    ...bedroomBuild.seats,
    ...streetBuild.seats,
    ...cafeBuild.seats,
    ...world3Build.locations.park.seats,
    ...world3Build.locations.grocery.seats,
  ];

  const selectedState = (): CharacterState => characters[selectedCharacterId];
  const selectedRig = (): CharacterRig => characterRigs[selectedCharacterId];

  const syncCharacterState = (characterId: CharacterId): CharacterState => {
    const characterState = characters[characterId];
    const rig = characterRigs[characterId];
    characterState.position = {
      x: rig.root.position.x,
      y: 0,
      z: rig.root.position.z,
    };
    characterState.rotationY = rig.root.rotation.y;
    if (rig.isMoving()) characterState.interaction = "walking";
    else if (characterState.interaction === "walking") characterState.interaction = "idle";
    return characterState;
  };

  const persistCharacter = (characterId: CharacterId): void => {
    saveCharacterState(syncCharacterState(characterId));
  };

  const refreshProductionVisualLoading = (): void => {
    for (const characterId of CHARACTER_IDS) {
      const definition = PRODUCTION_CHARACTER_ASSETS[characterId];
      const visual = characterProductionVisuals[characterId];
      if (!definition || !visual) continue;
      const eagerOrCurrent = characterId === "khadija"
        || characters[characterId].room === activeRoom;
      visual.setQualityEnabled(
        eagerOrCurrent && isProductionAssetAllowed(definition, mediumHighProductionEnabled),
      );
    }

    for (const npcId of NPC_IDS) {
      const definition = PRODUCTION_NPC_ASSETS[npcId];
      const visual = npcProductionVisuals[npcId];
      if (!definition || !visual) continue;
      const eagerOrCurrent = npcId === "parent" || npcStates[npcId].room === activeRoom;
      visual.setQualityEnabled(
        eagerOrCurrent && isProductionAssetAllowed(definition, mediumHighProductionEnabled),
      );
    }
  };

  const updateCharacterVisibility = (): void => {
    for (const characterId of CHARACTER_IDS) {
      const visible = characters[characterId].room === activeRoom;
      characterRigs[characterId].setVisible(visible);
      characterRigs[characterId].setSelected(visible && characterId === selectedCharacterId);
      characterRigs[characterId].setLivingAnimation(
        visible && characterId !== selectedCharacterId && livingSettings.idleAnimations,
        Boolean(characters[characterId].heldItem),
      );
    }
    for (const npcId of NPC_IDS) {
      const visible = npcStates[npcId].room === activeRoom;
      npcRigs[npcId].setVisible(visible);
      npcRigs[npcId].setLivingAnimation(
        visible && livingSettings.idleAnimations,
        Boolean(npcStates[npcId].heldItem),
      );
    }
    refreshProductionVisualLoading();
  };

  const emitPlayState = (): void => {
    const current = selectedState();
    const playState: PlayState = {
      heldItem: current.heldItem,
      seated: current.activity === "sitting",
      sleeping: current.sleeping,
      outfit: current.outfit,
      activeRoom,
      selectedCharacter: selectedCharacterId,
      expression: current.expression,
      characters: CHARACTER_IDS.map((characterId) => ({
        id: characterId,
        room: characters[characterId].room,
        expression: characters[characterId].expression,
        heldItem: characters[characterId].heldItem,
      })),
    };
    options.onPlayStateChange(playState);
  };

  const setOutfit = (outfit: OutfitId): void => {
    const current = selectedState();
    current.outfit = outfit;
    selectedRig().setOutfitColor(outfitColors[outfit]);
    khadijaProductionVisual.setOutfit(outfit);
    persistCharacter(selectedCharacterId);
    options.onAction(`${CHARACTER_DEFINITIONS[selectedCharacterId].shortName} chose the ${outfit} outfit!`, "success");
    emitPlayState();
  };

  const setExpression = (expression: CharacterExpression): void => {
    const current = selectedState();
    current.expression = expression;
    selectedRig().setExpression(expression);
    khadijaProductionVisual.setExpression(expression);
    persistCharacter(selectedCharacterId);
    options.onAction(`${CHARACTER_DEFINITIONS[selectedCharacterId].shortName} feels ${expression}!`, "tap");
    emitPlayState();
  };

  const roomNames: Record<RoomId, string> = {
    home: "the family home",
    bedroom: "Khadija's bedroom",
    street: "the neighborhood street",
    cafe: "Sunny CafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©",
    park: "the neighborhood park",
    grocery: "the grocery shop",
  };
  const arrivalOffsetZ: Record<CharacterId, number> = {
    khadija: 0,
    sister: .8,
    brother: 1.6,
  };

  const switchRoom = (nextRoom: RoomId): void => {
    options.onInteractionHint?.(null);
    if (nextRoom === activeRoom) {
      options.onAction(`We're already at ${roomNames[nextRoom]}!`);
      return;
    }

    const current = selectedState();
    const rig = selectedRig();
    rig.stand();
    current.activity = "standing";
    current.sleeping = false;
    current.seatId = null;
    current.interaction = "idle";
    activeRoom = nextRoom;
    locationRegistry.activate(nextRoom);
    interiorFurniture.setActiveRoom(nextRoom);
    current.room = nextRoom;
    const definition = roomDefinitions[activeRoom];
    rig.setBounds(
      definition.bounds.minX,
      definition.bounds.maxX,
      definition.bounds.minZ,
      definition.bounds.maxZ,
    );
    const arrivalPosition = definition.spawn.clone();
    arrivalPosition.z += arrivalOffsetZ[selectedCharacterId];
    rig.placeAt(arrivalPosition);
    playableAnchors[selectedCharacterId].copyFrom(arrivalPosition);
    rig.root.rotation.y = activeRoom === "home" || activeRoom === "street" || activeRoom === "park"
      ? -Math.PI / 2
      : Math.PI / 2;
    camera.setTarget(definition.center);
    applyActiveRoomLighting();
    updateCharacterVisibility();
    persistCharacter(selectedCharacterId);
    emitPlayState();
    options.onAction(`Welcome to ${roomNames[activeRoom]}!`, "travel");
  };

  const selectCharacter = (characterId: CharacterId, announce = true): void => {
    if (characterId !== "khadija") {
      if (announce) {
        options.onAction(
          `${CHARACTER_DEFINITIONS[characterId].shortName} is part of Khadija's story and can still be moved, seated and given items.`,
          "tap",
        );
      }
      return;
    }
    if (announce) options.onAction("Khadija is ready to play!");
  };

  camera.setTarget(roomDefinitions[activeRoom].center);
  applyActiveRoomLighting();
  updateCharacterVisibility();

  const connectDoor = (door: Mesh, destination: RoomId): void => {
    disposables.add(registerPickInteraction(
      scene,
      door,
      () => switchRoom(destination),
    ));
  };
  connectDoor(homeToBedroomDoor, "bedroom");
  connectDoor(homeToStreetDoor, "street");
  connectDoor(bedroomToHomeDoor, "home");
  connectDoor(streetToHomeDoor, "home");
  connectDoor(streetToCafeDoor, "cafe");
  connectDoor(cafeToStreetDoor, "street");
  connectDoor(streetToParkDoor, "park");
  connectDoor(streetToGroceryDoor, "grocery");
  connectDoor(world3Build.doors.parkToStreet, "street");
  connectDoor(world3Build.doors.groceryToStreet, "street");

  // Simple fruit bowl plus two usable food/drink props.
  cylinder(scene, "fruit-bowl", 0.9, 0.25, new Vector3(3.5, 1.3, 0.6), wood, 18);
  for (const [i, fruitColor] of [colors.yellow, colors.pink, new Color3(0.18, 0.48, 0.22)].entries()) {
    const fruit = MeshBuilder.CreateSphere(`fruit-${i}`, { diameter: 0.28, segments: 9 }, scene);
    fruit.position.set(3.35 + i * 0.2, 1.48 + (i % 2) * 0.08, 0.58);
    fruit.material = material(scene, `fruit-mat-${i}`, fruitColor);
    fruit.isPickable = false;
  }

  const apple = createProductionApple(
    scene,
    new Vector3(3.2, 1.48, .55),
    itemMaterials,
  );
  restoreProp(apple);
  makeDraggable(apple, .2, foodTargets, options.onAction);

  const cup = createProductionCup(
    scene,
    new Vector3(4.15, 1.45, .55),
    itemMaterials,
  );
  restoreProp(cup);
  makeDraggable(cup, .25, cupTargets, options.onAction);

  holdables.set("teddy", {
    id: "teddy",
    label: "teddy",
    mesh: teddy,
    floorY: 0.38,
    holdScale: new Vector3(0.72, 0.72, 0.72),
    useMessage: "gives the teddy a hug",
    gesture: "hug",
    consumable: false,
  });
  holdables.set("book", {
    id: "book",
    label: "book",
    mesh: book,
    floorY: 0.08,
    holdScale: new Vector3(0.62, 0.62, 0.62),
    useMessage: "reads the book",
    gesture: "read",
    consumable: false,
  });
  holdables.set("apple", {
    id: "apple",
    label: "apple",
    mesh: apple,
    floorY: 0.18,
    holdScale: new Vector3(0.8, 0.8, 0.8),
    useMessage: "enjoys the apple",
    gesture: "eat",
    consumable: true,
    respawnPosition: new Vector3(3.2, 1.48, 0.55),
    respawnMessage: "A fresh apple appeared in the fruit bowl",
  });
  holdables.set("cup", {
    id: "cup",
    label: "cup",
    mesh: cup,
    floorY: 0.24,
    holdScale: new Vector3(0.72, 0.72, 0.72),
    useMessage: "takes a cozy sip",
    gesture: "drink",
    consumable: false,
  });
  holdables.set("cupcake", {
    id: "cupcake",
    label: "cupcake",
    mesh: cupcake,
    floorY: 0.22,
    holdScale: new Vector3(0.78, 0.78, 0.78),
    useMessage: "enjoys the cupcake",
    gesture: "eat",
    consumable: true,
    respawnPosition: cafePosition(4.45, 1.12, 0.48),
    respawnMessage: "A fresh cupcake appeared in the pastry case",
  });
  holdables.set("sandwich", {
    id: "sandwich",
    label: "sandwich",
    mesh: sandwich,
    floorY: 0.18,
    holdScale: new Vector3(0.72, 0.72, 0.72),
    useMessage: "takes a bite of the sandwich",
    gesture: "eat",
    consumable: true,
    respawnPosition: cafePosition(4.95, 1.12, 0.5),
    respawnMessage: "A fresh sandwich appeared in the cafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© display",
  });

  type ItemOwnerId = CharacterId | NpcId | `world:${string}`;
  const isPlayableOwner = (owner: ItemOwnerId): owner is CharacterId => (
    CHARACTER_IDS.includes(owner as CharacterId)
  );
  const isNpcOwner = (owner: ItemOwnerId): owner is NpcId => (
    NPC_IDS.includes(owner as NpcId)
  );

  const holderClassForCharacter = (
    characterId: CharacterId,
  ): "toddler" | "child" => (
    characterId === "sister" ? "toddler" : "child"
  );

  const removeFromEverydaySlots = (itemId: string): void => {
    for (const contents of Object.values(everydayState.storageContents)) {
      const index = contents.indexOf(itemId);
      if (index >= 0) contents.splice(index, 1);
    }
    for (const contents of Object.values(everydayState.containerContents)) {
      const index = contents.indexOf(itemId);
      if (index >= 0) contents.splice(index, 1);
    }
    for (const contents of Object.values(everydayState.stationInputs)) {
      const index = contents.indexOf(itemId);
      if (index >= 0) contents.splice(index, 1);
    }
  };

  const itemOwner = (itemId: string): ItemOwnerId | null => {
    for (const characterId of CHARACTER_IDS) {
      if (characters[characterId].heldItem === itemId) return characterId;
    }
    for (const npcId of NPC_IDS) {
      if (npcStates[npcId].heldItem === itemId) return npcId;
    }
    for (const [id, contents] of Object.entries(everydayState.storageContents)) {
      if (contents.includes(itemId)) return `world:${id}`;
    }
    for (const [id, contents] of Object.entries(everydayState.containerContents)) {
      if (contents.includes(itemId)) return `world:${id}`;
    }
    for (const [id, contents] of Object.entries(everydayState.stationInputs)) {
      if (contents.includes(itemId)) return `world:${id}`;
    }
    return null;
  };

  const attachItemToRig = (
    item: HoldableItem,
    rig: CharacterRig,
    holderClass: "toddler" | "child" | "adult",
  ): void => {
    const resolved = resolvePresentationForHolder(item.id, holderClass);
    const holdType = resolved?.holdType
      ?? (item.gesture === "hug" ? "hug" : item.gesture === "read" ? "read" : "one-hand");

    item.mesh.parent = resolved?.anchor === "center" || (!resolved && holdType !== "one-hand")
      ? rig.carryAnchor
      : rig.holdAnchor;

    item.mesh.position.copyFrom(
      resolved
        ? new Vector3(...resolved.holdOffset)
        : item.holdOffset ?? Vector3.Zero(),
    );
    item.mesh.rotation.copyFrom(
      resolved
        ? new Vector3(...resolved.holdRotation)
        : item.holdRotation
          ?? new Vector3(0, 0, item.id === "book" ? Math.PI / 2 : 0),
    );
    item.mesh.scaling.copyFrom(
      resolved
        ? new Vector3(...resolved.holdScale)
        : item.holdScale,
    );
    item.mesh.isPickable = false;
    item.mesh.setEnabled(true);
    rig.setHeldItemPose(holdType);
  };

  const attachItemToCharacter = (item: HoldableItem, characterId: CharacterId): void => {
    attachItemToRig(
      item,
      characterRigs[characterId],
      holderClassForCharacter(characterId),
    );
  };

  const attachItemToNpc = (item: HoldableItem, npcId: NpcId): void => {
    attachItemToRig(item, npcRigs[npcId], "adult");
  };

  const clearNpcItem = (npcId: NpcId): HoldableItem | null => {
    const state = npcStates[npcId];
    if (!state.heldItem) {
      npcRigs[npcId].setHeldItemPose(null);
      return null;
    }
    const item = holdables.get(state.heldItem) ?? null;
    state.heldItem = null;
    npcRigs[npcId].setHeldItemPose(null);
    if (item) {
      item.mesh.parent = null;
      item.mesh.scaling.setAll(1);
      item.mesh.rotation.setAll(0);
    }
    saveNpcState(state);
    return item;
  };

  const detachHeldItem = (
    characterId: CharacterId,
    placeOnFloor: boolean,
  ): HoldableItem | null => {
    const characterState = characters[characterId];
    const rig = characterRigs[characterId];

    if (!characterState.heldItem) {
      rig.setHeldItemPose(null);
      return null;
    }

    const item = holdables.get(characterState.heldItem) ?? null;
    if (!item) {
      characterState.heldItem = null;
      rig.setHeldItemPose(null);
      persistCharacter(characterId);
      return null;
    }

    const absolutePosition = item.mesh.getAbsolutePosition().clone();
    item.mesh.parent = null;
    item.mesh.scaling.setAll(1);
    item.mesh.rotation.setAll(0);
    item.mesh.isPickable = true;
    rig.setHeldItemPose(null);

    if (placeOnFloor) {
      const forward = new Vector3(-Math.sin(rig.root.rotation.y), 0, -Math.cos(rig.root.rotation.y));
      const dropPosition = rig.root.position.add(forward.scale(.78));
      item.mesh.position.set(dropPosition.x, item.floorY, dropPosition.z);
      saveProp(item.mesh);
    } else {
      item.mesh.position.copyFrom(absolutePosition);
    }

    characterState.heldItem = null;
    persistCharacter(characterId);
    return item;
  };

  const dropHeldItem = (): void => {
    const characterId = selectedCharacterId;
    const item = detachHeldItem(characterId, true);
    if (!item) {
      options.onAction(`${CHARACTER_DEFINITIONS[characterId].shortName}'s hands are free!`);
      return;
    }
    options.onAction(`The ${item.label} is ready to play with.`);
    emitPlayState();
  };

  const holdItem = (
    id: string,
    characterId: CharacterId = selectedCharacterId,
    announce = true,
  ): void => {
    const item = holdables.get(id);
    if (!item) return;
    const characterState = characters[characterId];
    if (characterState.heldItem === id) {
      options.onAction(`${CHARACTER_DEFINITIONS[characterId].shortName} is already holding the ${item.label}!`);
      return;
    }
    const previousOwner = itemOwner(id);
    if (previousOwner && previousOwner !== characterId) {
      if (isPlayableOwner(previousOwner)) {
        characters[previousOwner].heldItem = null;
        persistCharacter(previousOwner);
      } else if (isNpcOwner(previousOwner)) {
        clearNpcItem(previousOwner);
      } else {
        removeFromEverydaySlots(id);
        saveEverydayState(everydayState);
      }
    }
    detachHeldItem(characterId, true);
    attachItemToCharacter(item, characterId);
    characterState.heldItem = id;
    persistCharacter(characterId);
    if (announce) {
      options.onAction(`${CHARACTER_DEFINITIONS[characterId].shortName} picked up the ${item.label}!`, "pickup");
    }
    if (characterId === selectedCharacterId) emitPlayState();
  };

  const useHeldItem = (): void => {
    const characterId = selectedCharacterId;
    const characterState = characters[characterId];
    const heldItemId = characterState.heldItem;
    if (!heldItemId) {
      options.onAction("Pick up a toy, book, food or drink first");
      return;
    }
    const item = holdables.get(heldItemId);
    if (!item) return;
    if (heldItemId === "camera") {
      world3State.park.photosTaken = Math.min(999, world3State.park.photosTaken + 1);
      recordWorld3Event(world3State, "took_park_photo");
      saveWorld3State(world3State);
      characterRigs[characterId].playUseGesture("hug");
      options.onAction("Click! A happy pretend photo for the story album!", "success");
      return;
    }
    if (containerController.isContainer(heldItemId)) {
      const storedItemId = everydayState.containerContents[heldItemId][0];
      if (!storedItemId) {
        options.onAction(`The ${item.label} is ready to fill.`, "tap");
        return;
      }
      detachHeldItem(characterId, true);
      const taken = containerController.take(heldItemId);
      if (taken) holdItem(taken, characterId, false);
      saveEverydayState(everydayState);
      syncEverydayVisuals();
      options.onAction(`Took the ${friendlyName(storedItemId)} out of the ${item.label}.`, "pickup");
      emitPlayState();
      return;
    }
    const interaction: Record<UseGesture, CharacterInteraction> = {
      hug: "hugging",
      read: "reading",
      eat: "eating",
      drink: "drinking",
    };
    characterState.interaction = interaction[item.gesture];
    characterRigs[characterId].playUseGesture(item.gesture);
    persistCharacter(characterId);
    options.onAction(`${CHARACTER_DEFINITIONS[characterId].shortName} ${item.useMessage}!`);
    for (const otherId of CHARACTER_IDS) {
      if (otherId === characterId || characters[otherId].room !== activeRoom) continue;
      if (Vector3.Distance(characterRigs[otherId].root.position, characterRigs[characterId].root.position) > 3.4) continue;
      characterRigs[otherId].lookAt(characterRigs[characterId].root.position);
      temporaryReaction(otherId, item.gesture === "eat" || item.gesture === "drink" ? "happy" : "excited");
    }
    for (const npcId of NPC_IDS) {
      if (npcStates[npcId].room !== activeRoom) continue;
      if (Vector3.Distance(npcRigs[npcId].root.position, characterRigs[characterId].root.position) > 4.2) continue;
      reactNpc(npcId, "happy");
    }
    window.setTimeout(() => {
      if (characters[characterId].interaction === interaction[item.gesture]) {
        characters[characterId].interaction = "idle";
        persistCharacter(characterId);
      }
    }, 950);

    if (!item.consumable) return;
    window.setTimeout(() => {
      detachHeldItem(characterId, false);
      item.mesh.setEnabled(false);
      if (characterId === selectedCharacterId) emitPlayState();
      window.setTimeout(() => {
        const respawnPosition = item.respawnPosition ?? new Vector3(3.2, 1.48, 0.55);
        item.mesh.position.copyFrom(respawnPosition);
        item.mesh.scaling.setAll(1);
        item.mesh.setEnabled(true);
        item.mesh.isPickable = true;
        saveProp(item.mesh);
        options.onAction(item.respawnMessage ?? `A fresh ${item.label} appeared`);
      }, 1800);
    }, 550);
  };

  const combinationSound = (sound: CombinationSound): InteractionSound => sound;

  const syncEverydayVisuals = (): void => {
    const storageSlots: Record<string, readonly Vector3[]> = {
      "kitchen-cupboard": [
        new Vector3(4.5, 2.08, 3.3),
        new Vector3(4.82, 2.08, 3.3),
        new Vector3(5.14, 2.08, 3.3),
        new Vector3(4.66, 1.72, 3.3),
        new Vector3(4.98, 1.72, 3.3),
        new Vector3(4.5, 1.42, 3.3),
        new Vector3(4.82, 1.42, 3.3),
        new Vector3(5.14, 1.42, 3.3),
      ],
      "kitchen-drawer": [
        new Vector3(4.2, .72, 2.38),
        new Vector3(4.48, .72, 2.38),
        new Vector3(4.76, .72, 2.38),
      ],
      "fridge-shelves": [
        new Vector3(1.95, 2.15, 2.28),
        new Vector3(2.3, 2.15, 2.28),
        new Vector3(2.65, 2.15, 2.28),
        new Vector3(1.95, 1.65, 2.28),
        new Vector3(2.3, 1.65, 2.28),
        new Vector3(2.65, 1.65, 2.28),
        new Vector3(1.95, 1.35, 2.28),
        new Vector3(2.3, 1.35, 2.28),
        new Vector3(2.65, 1.35, 2.28),
        new Vector3(1.95, 1.05, 2.28),
        new Vector3(2.3, 1.05, 2.28),
        new Vector3(2.65, 1.05, 2.28),
      ],
      "wardrobe-shelves": [
        bedroomPosition(4.45, 1.95, -3.3),
        bedroomPosition(4.9, 1.95, -3.3),
        bedroomPosition(5.35, 1.95, -3.3),
        bedroomPosition(4.65, 1.1, -3.3),
      ],
      "toy-box": [
        bedroomPosition(.5, .62, -.55),
        bedroomPosition(.82, .62, -.55),
        bedroomPosition(1.14, .62, -.55),
        bedroomPosition(1.46, .62, -.55),
      ],
      "cafe-display": [
        cafePosition(4.1, 1.35, .42),
        cafePosition(4.45, 1.35, .42),
        cafePosition(4.8, 1.35, .42),
        cafePosition(4.25, .98, .42),
        cafePosition(4.65, .98, .42),
      ],
      "return-tray": [
        cafePosition(2.15, 1.48, 1.72),
        cafePosition(2.4, 1.48, 1.72),
        cafePosition(2.65, 1.48, 1.72),
        cafePosition(2.9, 1.48, 1.72),
      ],
    };
    for (const [storageId, contents] of Object.entries(everydayState.storageContents)) {
      contents.forEach((itemId, index) => {
        const item = holdables.get(itemId);
        if (item) {
          item.mesh.parent = null;
          item.mesh.scaling.setAll(1);
          item.mesh.rotation.setAll(0);
          const slot = storageSlots[storageId]?.[index];
          if (slot) item.mesh.position.copyFrom(slot);
          item.mesh.setEnabled(everydayState.storageOpen[storageId as keyof typeof everydayState.storageOpen]);
          item.mesh.isPickable = true;
        }
      });
    }
    for (const contents of Object.values(everydayState.containerContents)) {
      for (const itemId of contents) holdables.get(itemId)?.mesh.setEnabled(false);
    }
    for (const contents of Object.values(everydayState.stationInputs)) {
      for (const itemId of contents) holdables.get(itemId)?.mesh.setEnabled(false);
    }
    for (const id of [
      "backpack",
      "basket",
      "serving-tray",
      "shopping-basket",
      "shopping-bag",
      "picnic-basket",
    ] as const) {
      const container = holdables.get(id);
      if (!container) continue;
      const visibleSlots = container.mesh.getChildMeshes().filter((mesh) => mesh.name.includes("visible-slot"));
      visibleSlots.forEach((mesh, index) => {
        mesh.setEnabled(index < everydayState.containerContents[id].length);
      });
    }
  };

  const finishRecipe = (station: StationId): void => {
    const recipe = recipeSystem.completed(station);
    if (!recipe) return;
    options.onAction("Mixing something lovelyÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦", combinationSound(recipe.sound));
    const appliance = recipe.appliance ? applianceVisuals[recipe.appliance] : null;
    if (appliance) {
      Animation.CreateAndStartAnimation(
        `${recipe.appliance}-happy-start`,
        appliance,
        "scaling.y",
        30,
        Math.max(8, Math.round(recipe.durationMs / 34)),
        1,
        1.09,
        Animation.ANIMATIONLOOPMODE_CYCLE,
      );
      if (recipe.appliance === "kettle") everydayState.appliances.kettleWarm = true;
      if (recipe.appliance === "oven") everydayState.appliances.ovenWarm = true;
      saveEverydayState(everydayState);
    }
    window.setTimeout(() => {
      if (appliance) {
        scene.stopAnimation(appliance);
        appliance.scaling.y = 1;
      }
      everydayState.appliances.kettleWarm = false;
      everydayState.appliances.ovenWarm = false;
      for (const input of recipe.requiredInputs) {
        holdables.get(input)?.mesh.setEnabled(false);
      }
      recipeSystem.finish(recipe);
      const ingredientHomes: Record<string, keyof typeof everydayState.storageContents> = {
        apple: "fridge-shelves",
        banana: "fridge-shelves",
        bread: "fridge-shelves",
        cheese: "fridge-shelves",
        berries: "fridge-shelves",
        "cake-mix": "fridge-shelves",
        "tea-leaves": "kitchen-cupboard",
        cup: "return-tray",
      };
      for (const input of recipe.requiredInputs) {
        const home = ingredientHomes[input];
        if (home && !itemOwner(input)) everydayState.storageContents[home].push(input);
      }
      const result = holdables.get(recipe.result);
      if (result && !itemOwner(recipe.result)) {
        result.mesh.parent = null;
        result.mesh.scaling.setAll(1);
        result.mesh.rotation.setAll(0);
        const outputPositions: Record<string, Vector3> = {
          "prepared-fruit-bowl": new Vector3(2.52, 1.62, .55),
          sandwich: new Vector3(4.28, 1.55, .55),
          toast: new Vector3(5.05, 1.68, 3.02),
          juice: new Vector3(4.35, 1.68, 3.02),
          cupcake: new Vector3(5.15, 1.35, 2.52),
          tea: new Vector3(3.5, 1.68, 3.02),
        };
        result.mesh.position.copyFrom(outputPositions[recipe.result] ?? new Vector3(3.4, 1.55, .55));
        result.mesh.setEnabled(true);
        result.mesh.isPickable = true;
        saveProp(result.mesh);
      }
      saveEverydayState(everydayState);
      syncEverydayVisuals();
      selectedRig().playUseGesture("hug");
      selectedRig().setExpression("excited");
      options.onAction(recipe.message, "recipe");
    }, recipe.durationMs);
  };

  const useRecipeStation = (station: StationId): void => {
    const heldId = selectedState().heldItem;
    if (!heldId) {
      const completed = recipeSystem.completed(station);
      if (completed) finishRecipe(station);
      else options.onAction("Bring an ingredient here and tap again.", "tap");
      return;
    }
    const item = holdables.get(heldId);
    if (!item) return;
    const result = recipeSystem.addInput(station, item.recipeIngredientId ?? heldId);
    if (!result.accepted) {
      selectedRig().setExpression("surprised");
      options.onAction(result.message, "invalid");
      return;
    }
    detachHeldItem(selectedCharacterId, false);
    item.mesh.setEnabled(false);
    saveEverydayState(everydayState);
    options.onAction(result.message, "combine");
    const completed = recipeSystem.completed(station);
    if (completed) finishRecipe(station);
    emitPlayState();
  };

  const useStorage = (storageId: string): void => {
    if (!isStorageId(storageId)) return;
    const heldId = selectedState().heldItem;
    if (heldId) {
      const item = holdables.get(heldId);
      if (!item) return;
      const result = storageController.put(storageId, heldId);
      if (!result.accepted) {
        selectedRig().setExpression("surprised");
        options.onAction(result.message, "invalid");
        return;
      }
      detachHeldItem(selectedCharacterId, false);
      item.mesh.setEnabled(everydayState.storageOpen[storageId]);
      if (storageId === "toy-box") everydayState.cleaning.toysTidy = true;
      if (storageId === "wardrobe-shelves") everydayState.cleaning.clothesTidy = true;
      saveEverydayState(everydayState);
      syncEverydayVisuals();
      options.onAction(result.message, "storage");
      emitPlayState();
      return;
    }
    if (!everydayState.storageOpen[storageId]) {
      storageController.toggle(storageId);
      if (storageId === "fridge-shelves") everydayState.appliances.fridgeOpen = true;
      saveEverydayState(everydayState);
      syncEverydayVisuals();
      options.onAction("Opened! Look at all those useful things.", "storage");
      return;
    }
    const itemId = storageController.take(storageId);
    if (itemId && holdables.has(itemId)) {
      holdItem(itemId, selectedCharacterId, false);
      saveEverydayState(everydayState);
      syncEverydayVisuals();
      selectedRig().setExpression("excited");
      options.onAction(`Found the ${friendlyName(itemId)}!`, "pickup");
      return;
    }
    storageController.toggle(storageId);
    if (storageId === "fridge-shelves") everydayState.appliances.fridgeOpen = false;
    saveEverydayState(everydayState);
    syncEverydayVisuals();
    options.onAction("Closed and tidy.", "storage");
  };

  const usePortableContainer = (containerId: ContainerId): void => {
    const heldId = selectedState().heldItem;
    if (heldId && heldId !== containerId) {
      const item = holdables.get(heldId);
      if (!item) return;
      const result = containerController.put(containerId, heldId);
      if (!result.accepted) {
        selectedRig().setExpression("surprised");
        options.onAction(result.message, "invalid");
        return;
      }
      detachHeldItem(selectedCharacterId, false);
      item.mesh.setEnabled(false);
      saveEverydayState(everydayState);
      syncEverydayVisuals();
      options.onAction(result.message, "storage");
      emitPlayState();
      return;
    }
    const itemId = containerController.take(containerId);
    if (itemId && holdables.has(itemId)) {
      holdItem(itemId, selectedCharacterId, false);
      saveEverydayState(everydayState);
      syncEverydayVisuals();
      options.onAction(`Took out the ${friendlyName(itemId)}.`, "pickup");
    }
  };

  const performEverydayTarget = (targetId: string): void => {
    if (STATION_IDS.includes(targetId as StationId)) {
      useRecipeStation(targetId as StationId);
      return;
    }
    if (isStorageId(targetId)) {
      useStorage(targetId);
      return;
    }
    const hygiene = everydayState.hygiene[selectedCharacterId];
    if (targetId === "wash-hands") {
      hygiene.handsWashed = true;
      selectedRig().playUseGesture("hug");
      options.onAction("Bubbly hands, rinse and sparkle!", "water");
    } else if (targetId === "brush-teeth") {
      hygiene.teethBrushed = true;
      selectedRig().playUseGesture("eat");
      options.onAction("Brush, brushÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Âwhat a shiny smile!", "clean");
    } else if (targetId === "bath-time") {
      hygiene.bathBubblesReady = true;
      hygiene.towelDry = false;
      selectedRig().playUseGesture("hug");
      options.onAction("Bubble bath timeÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Âcozy clothes stay on!", "water");
    } else if (targetId === "use-towel") {
      hygiene.towelDry = true;
      selectedRig().playUseGesture("hug");
      options.onAction("Warm, fluffy and all dry!", "clean");
    } else if (targetId === "mirror-smile") {
      hygiene.mirrorSmiles += 1;
      selectedRig().setExpression("excited");
      options.onAction("What a wonderful smile!", "success");
    } else if (targetId === "clean-table" || targetId === "clean-counter") {
      const hasSponge = selectedState().heldItem === "sponge";
      if (!hasSponge) {
        options.onAction("Find the yellow sponge in the kitchen drawer.", "invalid");
        return;
      }
      if (targetId === "clean-table") everydayState.cleaning.homeTableClean = true;
      else everydayState.cleaning.kitchenCounterClean = true;
      selectedRig().playUseGesture("hug");
      options.onAction("Swish, wipe, sparkleÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Âlovely and clean!", "clean");
    } else if (targetId === "wash-dish") {
      const heldId = selectedState().heldItem;
      if (heldId !== "cup" && heldId !== "prep-plate" && heldId !== "mixing-bowl") {
        options.onAction("Bring a cup, plate or bowl to the sink.", "invalid");
        return;
      }
      everydayState.dishClean[heldId] = true;
      selectedRig().playUseGesture("hug");
      options.onAction("Bubbles awayÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Âthe dish is clean!", "water");
    } else if (targetId === "bin-rubbish") {
      if (selectedState().heldItem !== "rubbish") {
        options.onAction("Bring the little wrapper to the bin.", "invalid");
        return;
      }
      const rubbish = detachHeldItem(selectedCharacterId, false);
      rubbish?.mesh.setEnabled(false);
      everydayState.cleaning.rubbishBinned = true;
      selectedRig().setExpression("happy");
      options.onAction("Plop! The rubbish is safely in the bin.", "clean");
    } else if (targetId === "tidy-books") {
      if (selectedState().heldItem !== "book") {
        options.onAction("Bring the book back to its shelf.", "invalid");
        return;
      }
      const bookItem = detachHeldItem(selectedCharacterId, false);
      if (bookItem) {
        bookItem.mesh.position.copyFrom(bedroomPosition(.55, 1.35, 2.72));
        bookItem.mesh.setEnabled(true);
      }
      everydayState.cleaning.booksTidy = true;
      options.onAction("Books are back on their cozy shelf!", "clean");
    } else if (targetId === "tidy-clothes") {
      if (selectedState().heldItem !== "clothes") {
        options.onAction("Bring the folded clothes to the wardrobe.", "invalid");
        return;
      }
      const clothes = detachHeldItem(selectedCharacterId, false);
      clothes?.mesh.setEnabled(false);
      everydayState.storageContents["wardrobe-shelves"].push("clothes");
      everydayState.cleaning.clothesTidy = true;
      options.onAction("Clothes folded and tucked away!", "clean");
    } else {
      return;
    }
    saveEverydayState(everydayState);
  };

  const rememberForRoomNpcs = (
    kind: "activity" | "event",
    id: string,
  ): void => {
    for (const npcId of NPC_IDS) {
      if (npcStates[npcId].room !== activeRoom) continue;
      options.onNpcMemoryEvent?.(
        kind === "activity"
          ? {
              kind,
              npcId,
              characterId: selectedCharacterId,
              activityId: id,
            }
          : {
              kind,
              npcId,
              characterId: selectedCharacterId,
              eventId: id,
            },
      );
    }
  };

  const useGroceryCheckout = (): void => {
    const heldId = selectedState().heldItem;
    if (heldId !== "shopping-basket") {
      options.onAction("Bring your shopping basket to the checkout counter.", "invalid");
      return;
    }
    const basketContents = everydayState.containerContents["shopping-basket"];
    if (basketContents.length === 0) {
      options.onAction("Choose a few groceries before pretending to check out.", "invalid");
      return;
    }
    const bagContents = everydayState.containerContents["shopping-bag"];
    const freeSpace = containerController.capacity("shopping-bag") - bagContents.length;
    const packed = basketContents.splice(0, freeSpace);
    bagContents.push(...packed);
    world3State.grocery.checkoutCount = Math.min(999, world3State.grocery.checkoutCount + 1);
    world3State.grocery.bagsPacked = Math.min(999, world3State.grocery.bagsPacked + 1);
    recordWorld3Event(world3State, "packed_shopping_bag");
    saveWorld3State(world3State);
    saveEverydayState(everydayState);
    detachHeldItem(selectedCharacterId, true);
    world3Build.containerMeshes.shoppingBag.setEnabled(true);
    holdItem("shopping-bag", selectedCharacterId, false);
    syncEverydayVisuals();
    reactNpc("shopkeeper", "excited");
    rememberForRoomNpcs("activity", "shopping");
    options.onAction("Beep! Pretend checkout completeÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Âthe groceries are packed!", "bell");
    emitPlayState();
  };

  const performWorld3Target = (targetId: string): void => {
    const rig = selectedRig();
    const heldId = selectedState().heldItem;
    const held = heldId ? holdables.get(heldId) : null;
    if (targetId === "park-bench-left" || targetId === "park-bench-right") {
      useFurniture("bench");
      rememberForRoomNpcs("activity", "sit-and-talk");
      return;
    }
    if (targetId === "park-picnic") {
      if (held && (held.gesture === "eat" || held.gesture === "drink")) {
        world3State.park.picnicReady = true;
        recordWorld3Event(world3State, "picnic_ready");
        saveWorld3State(world3State);
        rig.playUseGesture(held.gesture);
        rememberForRoomNpcs("activity", "picnic");
        options.onAction(`The ${held.label} is ready for a cheerful picnic!`, "shared");
      } else {
        useFurniture("picnic");
        options.onAction("A cozy picnic spot is ready for friends!", "shared");
      }
      return;
    }
    if (targetId === "park-slide") {
      world3State.park.playgroundUses = Math.min(999, world3State.park.playgroundUses + 1);
      rig.cancelMovement();
      rig.placeAt(parkPosition(3.4, 0, -1.1));
      Animation.CreateAndStartAnimation(
        "park-slide-ride",
        rig.root,
        "position.z",
        30,
        24,
        rig.root.position.z,
        parkPosition(3.4, 0, -3.0).z,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
      );
      rig.playUseGesture("hug");
      recordWorld3Event(world3State, "used_slide");
      saveWorld3State(world3State);
      rememberForRoomNpcs("activity", "playground");
      options.onAction("Wheee! A gentle slide to the bottom!", "shared");
      return;
    }
    if (targetId === "park-swings") {
      world3State.park.playgroundUses = Math.min(999, world3State.park.playgroundUses + 1);
      rig.placeAt(parkPosition(2.0, 0, 2.15));
      Animation.CreateAndStartAnimation(
        "park-swing-play",
        rig.root,
        "rotation.x",
        30,
        26,
        -.12,
        .12,
        Animation.ANIMATIONLOOPMODE_CYCLE,
      );
      window.setTimeout(() => {
        scene.stopAnimation(rig.root);
        rig.root.rotation.x = 0;
      }, 1000);
      recordWorld3Event(world3State, "used_swings");
      saveWorld3State(world3State);
      rememberForRoomNpcs("activity", "playground");
      options.onAction("Back and forth on the friendly swing!", "shared");
      return;
    }
    if (targetId === "park-sandbox") {
      world3State.park.playgroundUses = Math.min(999, world3State.park.playgroundUses + 1);
      rig.playUseGesture("hug");
      recordWorld3Event(world3State, "played_sandbox");
      saveWorld3State(world3State);
      rememberForRoomNpcs("activity", "sandbox");
      options.onAction("Scoop, pat, and build a pretend sandcastle!", "shared");
      return;
    }
    if (targetId === "park-fountain") {
      rig.playUseGesture("drink");
      options.onAction("A cool drink from the park fountain!", "water");
      return;
    }
    if (targetId === "park-sign") {
      world3State.park.signReads = Math.min(999, world3State.park.signReads + 1);
      saveWorld3State(world3State);
      rig.playUseGesture("read");
      options.onAction("Park sign: Be kind, share the space, and care for nature!", "tap");
      return;
    }
    if (targetId === "park-flowers") {
      if (heldId !== "watering-can") {
        options.onAction("The blue watering can is nearby.", "invalid");
        return;
      }
      world3State.park.flowersWatered = true;
      recordWorld3Event(world3State, "watered_flowers");
      saveWorld3State(world3State);
      rig.playUseGesture("drink");
      reactNpc("park-keeper", "excited");
      rememberForRoomNpcs("event", "watering-flowers");
      options.onAction("Sprinkle, sparkleÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Âthe flowers look refreshed!", "water");
      return;
    }
    if (targetId === "park-birds") {
      if (!held || (held.gesture !== "eat" && !held.id.includes("bread") && !held.id.includes("fruit"))) {
        options.onAction("The pretend birds like fruit or bread.", "invalid");
        return;
      }
      world3State.park.birdsFed = true;
      recordWorld3Event(world3State, "fed_birds");
      saveWorld3State(world3State);
      rig.playUseGesture("eat");
      rememberForRoomNpcs("activity", "feed-birds");
      options.onAction("Tweet tweet! The pretend birds enjoy a tiny snack.", "shared");
      return;
    }
    if (targetId === "park-bin") {
      if (heldId !== "rubbish") {
        options.onAction("Bring the little wrapper to the park bin.", "invalid");
        return;
      }
      const rubbish = detachHeldItem(selectedCharacterId, false);
      rubbish?.mesh.setEnabled(false);
      world3State.park.rubbishBinned = true;
      recordWorld3Event(world3State, "park_tidied");
      saveWorld3State(world3State);
      reactNpc("park-keeper", "excited");
      rememberForRoomNpcs("event", "park-cleanup");
      options.onAction("Plop! The park is tidy and happy.", "clean");
      emitPlayState();
      return;
    }
    if (targetId === "grocery-checkout") {
      useGroceryCheckout();
      return;
    }
    if (targetId === "grocery-stock") {
      options.onAction("Fresh fictional Sunny Basket goods are ready for the shelves!", "storage");
    }
  };

  for (const target of everydayTargets.values()) {
    target.actionManager = new ActionManager(scene);
    target.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      if (target.metadata?.room !== activeRoom) return;
      performEverydayTarget(target.metadata.everydayTarget as string);
    }));
  }

  for (const id of [
    "backpack",
    "basket",
    "serving-tray",
    "shopping-basket",
    "shopping-bag",
    "picnic-basket",
  ] as const) {
    const item = holdables.get(id);
    if (item) item.mesh.metadata = { ...item.mesh.metadata, containerTarget: id };
  }

  for (const target of Object.values(world3Build.hotspots)) {
    target.actionManager = new ActionManager(scene);
    target.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      if (target.metadata?.room !== activeRoom) return;
      performWorld3Target(target.metadata.world3Action as string);
    }));
  }

  syncEverydayVisuals();

  // ART.1K-C applies data-driven scale, orientation, offsets, anchor choice,
  // and placement footprints after every location has registered its holdables.
  // Items without a production override keep their existing prototype values.
  for (const [itemId, item] of holdables) {
    const presentation = presentationFor(itemId);
    if (!presentation) continue;
    item.presentation = presentation;
    item.floorY = presentation.floorY;
    item.holdScale.set(...presentation.holdScale);
    item.holdOffset = new Vector3(...presentation.holdOffset);
    item.holdRotation = new Vector3(...presentation.holdRotation);
    item.mesh.metadata = {
      ...item.mesh.metadata,
      holdType: presentation.holdType,
      holdAnchor: presentation.holdType === "one-hand" ? "hand" : "center",
      placementFootprint: {
        width: presentation.footprint[0],
        depth: presentation.footprint[1],
      },
    };
  }

  const restoredItemOwners = new Set<string>();
  for (const characterId of CHARACTER_IDS) {
    const heldItemId = characters[characterId].heldItem;
    const item = heldItemId ? holdables.get(heldItemId) : null;
    if (!heldItemId || !item || restoredItemOwners.has(heldItemId)) {
      characters[characterId].heldItem = null;
      continue;
    }
    restoredItemOwners.add(heldItemId);
    removeFromEverydaySlots(heldItemId);
    attachItemToCharacter(item, characterId);
  }
  for (const npcId of NPC_IDS) {
    const heldItemId = npcStates[npcId].heldItem;
    const item = heldItemId ? holdables.get(heldItemId) : null;
    if (!heldItemId || !item || restoredItemOwners.has(heldItemId)) {
      npcStates[npcId].heldItem = null;
      continue;
    }
    restoredItemOwners.add(heldItemId);
    removeFromEverydaySlots(heldItemId);
    attachItemToNpc(item, npcId);
  }
  saveEverydayState(everydayState);

  for (const item of holdables.values()) {
    item.mesh.metadata = { ...item.mesh.metadata, holdableId: item.id };
  }

  let holdTap: {
    id: string;
    meshUniqueId: number;
    startX: number;
    startY: number;
    startedAt: number;
    moved: boolean;
  } | null = null;

  const addGroceryProduct = (productId: string): boolean => {
    if (activeRoom !== "grocery" || selectedState().heldItem !== "shopping-basket") return false;
    const result = containerController.put("shopping-basket", productId);
    if (!result.accepted) {
      options.onAction(result.message, "invalid");
      return true;
    }
    const product = holdables.get(productId);
    product?.mesh.setEnabled(false);
    world3State.grocery.productsSelected[productId] = Math.min(
      999,
      (world3State.grocery.productsSelected[productId] ?? 0) + 1,
    );
    recordWorld3Event(world3State, `selected:${productId}`);
    saveWorld3State(world3State);
    saveEverydayState(everydayState);
    syncEverydayVisuals();
    reactNpc("shopkeeper", "happy");
    options.onAction(`${friendlyName(productId.replace(/^shop-/, ""))} added to the basket!`, "storage");
    return true;
  };

  scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
    const pointerEvent = pointerInfo.event as PointerEvent;

    if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
      if (pointerEvent.button !== 0) {
        holdTap = null;
        return;
      }
      const pickedMesh = pointerInfo.pickInfo?.pickedMesh;
      const groceryProduct = pickedMesh?.metadata?.groceryProduct as string | undefined;
      if (groceryProduct && addGroceryProduct(groceryProduct)) {
        holdTap = null;
        return;
      }
      const containerTarget = pickedMesh?.metadata?.containerTarget as ContainerId | undefined;
      if (
        containerTarget
        && selectedState().heldItem
        && selectedState().heldItem !== containerTarget
      ) {
        usePortableContainer(containerTarget);
        holdTap = null;
        return;
      }
      const holdableId = pickedMesh?.metadata?.holdableId as string | undefined;
      holdTap = holdableId && pickedMesh
        ? {
            id: holdableId,
            meshUniqueId: pickedMesh.uniqueId,
            startX: pointerEvent.clientX,
            startY: pointerEvent.clientY,
            startedAt: performance.now(),
            moved: false,
          }
        : null;
      return;
    }

    if (pointerInfo.type === PointerEventTypes.POINTERMOVE && holdTap) {
      const distance = Math.hypot(
        pointerEvent.clientX - holdTap.startX,
        pointerEvent.clientY - holdTap.startY,
      );
      if (distance > 8) holdTap.moved = true;
      return;
    }

    if (pointerInfo.type !== PointerEventTypes.POINTERUP || !holdTap) return;

    const tap = holdTap;
    holdTap = null;
    const pickedMesh = pointerInfo.pickInfo?.pickedMesh;
    const isSameItem = pickedMesh?.uniqueId === tap.meshUniqueId;
    const isQuickTap = performance.now() - tap.startedAt < 650;
    if (tap.moved || !isSameItem || !isQuickTap) return;

    window.setTimeout(() => {
      const item = holdables.get(tap.id);
      if (!item || item.mesh.metadata?.dragMoved) return;
      holdItem(tap.id);
    }, 0);
  });

  pastryDisplayHotspot.actionManager = new ActionManager(scene);
  pastryDisplayHotspot.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    if (activeRoom !== "cafe") return;
    const firstChoice = selectedState().heldItem === "cupcake" ? "sandwich" : "cupcake";
    const choice = itemOwner(firstChoice) ? (firstChoice === "cupcake" ? "sandwich" : "cupcake") : firstChoice;
    if (itemOwner(choice)) {
      options.onAction("The treats are being enjoyed right now!");
      return;
    }
    holdItem(choice, selectedCharacterId, false);
    options.onAction(choice === "cupcake" ? "The barista served a cupcake!" : "The barista served a sandwich!");
  }));

  cafeDrinkHotspot.actionManager = new ActionManager(scene);
  cafeDrinkHotspot.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    if (activeRoom !== "cafe") return;
    if (selectedState().heldItem === "cup") {
      options.onAction(`The barista refilled ${CHARACTER_DEFINITIONS[selectedCharacterId].shortName}'s cup!`);
      return;
    }
    const owner = itemOwner("cup");
    if (owner && owner !== selectedCharacterId) {
      const ownerName = isPlayableOwner(owner)
        ? CHARACTER_DEFINITIONS[owner].shortName
        : isNpcOwner(owner)
          ? NPC_DEFINITIONS[owner].displayName
          : "A storage spot";
      options.onAction(`${ownerName} has the cup right now.`);
      return;
    }
    cup.setEnabled(true);
    cup.parent = null;
    cup.position.copyFrom(cafePosition(2.2, 1.32, 2.42));
    holdItem("cup", selectedCharacterId, false);
    options.onAction("The barista prepared a warm drink!");
  }));

  streetScooterHotspot.actionManager = new ActionManager(scene);
  streetScooterHotspot.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    if (activeRoom !== "street") return;
    const characterId = selectedCharacterId;
    const state = characters[characterId];
    const rig = characterRigs[characterId];
    rig.stand();
    state.activity = "standing";
    state.sleeping = false;
    state.seatId = null;
    rig.setTarget(streetPosition(1.0, 0, -0.55), () => {
      options.onAction(`${CHARACTER_DEFINITIONS[characterId].shortName} rings the bell and rides!`, "bell");
      rig.setTarget(streetPosition(3.4, 0, -1.25), () => {
        rig.setTarget(streetPosition(1.0, 0, -0.55), () => persistCharacter(characterId));
      });
    });
    options.onAction(`${CHARACTER_DEFINITIONS[characterId].shortName} is heading to the scooter!`, "travel");
    emitPlayState();
  }));

  for (const wardrobeButton of wardrobeButtons) {
    wardrobeButton.actionManager = new ActionManager(scene);
    wardrobeButton.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      const outfit = wardrobeButton.metadata?.outfit as OutfitId | undefined;
      if (outfit) setOutfit(outfit);
    }));
  }

  const standCharacter = (characterId: CharacterId, position?: Vector3): void => {
    const state = characters[characterId];
    const rig = characterRigs[characterId];
    rig.stand();
    if (position) rig.placeAt(position);
    state.activity = "standing";
    state.sleeping = false;
    state.seatId = null;
    state.interaction = "idle";
    persistCharacter(characterId);
  };

  const placeCharacterInSeat = (characterId: CharacterId, seat: SeatSlot): void => {
    const state = characters[characterId];
    const rig = characterRigs[characterId];
    if (seat.sleeping) {
      rig.sleepAt(seat.position, seat.rotationY);
      state.activity = "sleeping";
      state.sleeping = true;
      state.expression = "sleepy";
      rig.setExpression("sleepy");
    } else {
      rig.sitAt(seat.position, seat.rotationY);
      state.activity = "sitting";
      state.sleeping = false;
    }
    state.seatId = seat.id;
    state.interaction = "idle";
    persistCharacter(characterId);
  };

  const useFurniture = (kind: SeatKind): void => {
    const characterId = selectedCharacterId;
    const state = characters[characterId];
    const currentSeat = getSeatById(seats, state.seatId);
    if (currentSeat?.kind === kind) {
      standCharacter(characterId, currentSeat.approach);
      options.onAction(`${CHARACTER_DEFINITIONS[characterId].shortName} is ready to play again!`);
      emitPlayState();
      return;
    }

    const seat = findAvailableSeat(seats, kind, activeRoom, characters, characterId);
    if (!seat) {
      options.onAction("That spot is cozy and full. Try another one!");
      return;
    }

    standCharacter(characterId);
    characterRigs[characterId].setTarget(seat.approach, () => {
      placeCharacterInSeat(characterId, seat);
      for (const otherId of CHARACTER_IDS) {
        if (otherId === characterId || characters[otherId].room !== state.room) continue;
        if (Vector3.Distance(characterRigs[otherId].root.position, characterRigs[characterId].root.position) > 2.8) continue;
        characterRigs[otherId].lookAt(characterRigs[characterId].root.position);
        temporaryReaction(otherId, "happy");
      }
      options.onAction(
        seat.sleeping
          ? `${CHARACTER_DEFINITIONS[characterId].shortName} is having a sleepy rest.`
          : `${CHARACTER_DEFINITIONS[characterId].shortName} found a comfy seat!`,
        seat.sleeping ? "sleep" : "success",
      );
      emitPlayState();
    });
    options.onAction(seat.sleeping ? "Time for a cozy rest!" : "Let's find a comfy spot!");
    emitPlayState();
  };

  // Each furniture hotspot chooses the first free slot for the selected character.
  const seatMaterial = material(scene, "seat-hotspot-mat", colors.pink);
  seatMaterial.alpha = 0.03;
  const seatHotspot = box(scene, "sofa-seat-hotspot", new Vector3(2.45, 0.3, 0.7), new Vector3(-3.25, 0.95, 0.05), seatMaterial);
  seatHotspot.actionManager = new ActionManager(scene);
  seatHotspot.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    if (activeRoom !== "home") return;
    useFurniture("sofa");
  }));

  bedHotspot.actionManager = new ActionManager(scene);
  bedHotspot.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    if (activeRoom !== "bedroom") return;
    useFurniture("bed");
  }));

  streetBenchHotspot.actionManager = new ActionManager(scene);
  streetBenchHotspot.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    if (activeRoom !== "street") return;
    useFurniture("bench");
  }));

  cafeSeatHotspot.actionManager = new ActionManager(scene);
  cafeSeatHotspot.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    if (activeRoom !== "cafe") return;
    useFurniture("cafe-chair");
  }));

  for (const characterId of CHARACTER_IDS) {
    const state = characters[characterId];
    const seat = getSeatById(seats, state.seatId);
    if (seat && seat.room === state.room && state.activity !== "standing") {
      placeCharacterInSeat(characterId, seat);
    } else {
      state.activity = "standing";
      state.sleeping = false;
      state.seatId = null;
    }
  }

  const transferHeldItem = (fromId: CharacterId, toId: CharacterId): boolean => {
    const fromState = characters[fromId];
    const toState = characters[toId];
    if (!fromState.heldItem || fromState.room !== toState.room) return false;
    const distance = Vector3.Distance(characterRigs[fromId].root.position, characterRigs[toId].root.position);
    if (distance > 2.25) return false;
    const item = holdables.get(fromState.heldItem);
    if (!item) return false;

    detachHeldItem(toId, true);
    fromState.heldItem = null;
    characterRigs[fromId].setHeldItemPose(null);
    toState.heldItem = item.id;
    toState.expression = "excited";
    characterRigs[toId].setExpression("excited");
    characterRigs[fromId].lookAt(characterRigs[toId].root.position);
    characterRigs[toId].lookAt(characterRigs[fromId].root.position);
    characterRigs[toId].playUseGesture(item.gesture);
    attachItemToCharacter(item, toId);
    persistCharacter(fromId);
    persistCharacter(toId);
    options.onAction(
      `${CHARACTER_DEFINITIONS[fromId].shortName} gave the ${item.label} to ${CHARACTER_DEFINITIONS[toId].shortName}!`,
      item.gesture === "eat" || item.gesture === "drink" ? "shared" : "success",
    );
    return true;
  };

  const persistNpc = (npcId: NpcId): void => {
    const state = npcStates[npcId];
    const rig = npcRigs[npcId];
    state.position = {
      x: rig.root.position.x,
      y: 0,
      z: rig.root.position.z,
    };
    state.rotationY = rig.root.rotation.y;
    saveNpcState(state);
  };

  const returnNpcToStation = (npcId: NpcId): void => {
    const state = npcStates[npcId];
    const station = NPC_DEFINITIONS[npcId].position;
    state.activity = npcId === "cafe-worker" || npcId === "shopkeeper" || npcId === "park-keeper"
      ? "work"
      : "relax";
    npcRigs[npcId].setTarget(new Vector3(station.x, 0, station.z), () => {
      npcRigs[npcId].root.rotation.y = npcId === "shopkeeper"
        ? Math.PI
        : 0;
      persistNpc(npcId);
    });
  };

  const reactNpc = (
    npcId: NpcId,
    expression: CharacterExpression,
    gesture: UseGesture = "hug",
  ): void => {
    const rig = npcRigs[npcId];
    rig.setExpression(expression);
    rig.playUseGesture(gesture);
    window.setTimeout(() => {
      rig.setExpression(
        npcId === "cafe-worker" || npcId === "shopkeeper" || npcId === "park-keeper"
          ? "happy"
          : "neutral",
      );
      if (npcId === "cafe-worker") returnNpcToStation(npcId);
    }, 950);
  };

  const interactWithNpc = (npcId: NpcId): void => {
    const definition = NPC_DEFINITIONS[npcId];
    const npcState = npcStates[npcId];
    if (definition.homeLocation !== activeRoom) return;
    const player = selectedState();
    const playerRig = selectedRig();
    const npcRig = npcRigs[npcId];
    playerRig.lookAt(npcRig.root.position);
    npcRig.lookAt(playerRig.root.position);
    npcState.activity = "greet";

    if (player.heldItem) {
      if (npcState.heldItem) {
        options.onAction(`${definition.displayName}'s hands are full right now.`);
        reactNpc(npcId, "happy");
        return;
      }
      const item = detachHeldItem(selectedCharacterId, false);
      if (!item) return;
      npcState.heldItem = item.id;
      attachItemToNpc(item, npcId);
      saveNpcState(npcState);
      reactNpc(npcId, "excited", item.gesture);
      options.onAction(
        `${definition.displayName} says thank you for the ${item.label}!`,
        "success",
      );
      options.onNpcMemoryEvent?.({
        kind: "gift",
        npcId,
        characterId: selectedCharacterId,
        itemId: item.id,
      });
      emitPlayState();
      return;
    }

    // Mama is primarily a conversation NPC. A saved gift in her hands must
    // not turn a normal click into an item hand-over or an unrelated work
    // action. Clicking Mama opens chat unless Khadija is actively gifting an
    // item (handled above).
    if (npcId === "parent" && options.onNpcChat && options.isNpcChatEnabled?.() !== false) {
      reactNpc(npcId, "happy");
      options.onNpcChat(npcId);
      return;
    }

    if (npcState.heldItem) {
      const item = clearNpcItem(npcId);
      if (item) {
        attachItemToCharacter(item, selectedCharacterId);
        player.heldItem = item.id;
        persistCharacter(selectedCharacterId);
        reactNpc(npcId, "happy");
        options.onAction(`${definition.displayName} handed over the ${item.label}!`, "pickup");
        emitPlayState();
        return;
      }
    }

    if (options.onNpcChat && options.isNpcChatEnabled?.() !== false) {
      reactNpc(npcId, "happy");
      options.onNpcChat(npcId);
      return;
    }

    if (npcId === "cafe-worker") {
      const serviceChoices = ["cup", "cupcake", "sandwich"] as const;
      const choice = serviceChoices.find((itemId) => !itemOwner(itemId));
      if (choice) {
        holdItem(choice, selectedCharacterId, false);
        reactNpc(npcId, "excited", choice === "cup" ? "drink" : "eat");
        options.onAction(
          choice === "cup"
            ? "Ms. Sana made a warm drink!"
            : `Ms. Sana served a ${choice}!`,
          "success",
        );
        emitPlayState();
        return;
      }
    }

    const dialogueIndex = npcControllers[npcId].decisionCount % definition.dialogue.length;
    reactNpc(npcId, "happy");
    options.onAction(`${definition.displayName}: ${definition.dialogue[dialogueIndex]}`, "tap");
  };

  scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
    if (pointerInfo.type !== PointerEventTypes.POINTERPICK) return;
    if ((pointerInfo.event as PointerEvent).button !== 0) return;
    const npcId = pointerInfo.pickInfo?.pickedMesh?.metadata?.npcId as NpcId | undefined;
    if (npcId && NPC_IDS.includes(npcId)) interactWithNpc(npcId);
  });

  let characterDrag: {
    characterId: CharacterId;
    startX: number;
    startY: number;
    dragging: boolean;
  } | null = null;
  let suppressNextWalkPick = false;

  scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
    const pointerEvent = pointerInfo.event as PointerEvent;
    const pickedCharacterId = pointerInfo.pickInfo?.pickedMesh?.metadata?.characterId as CharacterId | undefined;

    if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
      if (pointerEvent.button !== 0) {
        characterDrag = null;
        return;
      }
      characterDrag = pickedCharacterId
        ? {
            characterId: pickedCharacterId,
            startX: pointerEvent.clientX,
            startY: pointerEvent.clientY,
            dragging: false,
          }
        : null;
      return;
    }

    if (pointerInfo.type === PointerEventTypes.POINTERMOVE && characterDrag) {
      const distance = Math.hypot(
        pointerEvent.clientX - characterDrag.startX,
        pointerEvent.clientY - characterDrag.startY,
      );
      if (!characterDrag.dragging && distance > 7) {
        characterDrag.dragging = true;
        standCharacter(characterDrag.characterId);
      }
      if (!characterDrag.dragging) return;

      const floorPick = scene.pick(
        scene.pointerX,
        scene.pointerY,
        (mesh) => mesh.metadata?.walkable === true && mesh.metadata?.room === activeRoom,
      );
      if (floorPick?.hit && floorPick.pickedPoint) {
        characterRigs[characterDrag.characterId].placeAt(
          new Vector3(floorPick.pickedPoint.x, 0, floorPick.pickedPoint.z),
        );
      }
      return;
    }

    if (pointerInfo.type !== PointerEventTypes.POINTERUP || !characterDrag) return;
    const completedDrag = characterDrag;
    characterDrag = null;

    if (completedDrag.dragging) {
      suppressNextWalkPick = true;
      const characterId = completedDrag.characterId;
      const nearbySeat = findNearbyAvailableSeat(
        seats,
        activeRoom,
        characterRigs[characterId].root.position,
        characters,
        characterId,
      );
      if (nearbySeat) {
        placeCharacterInSeat(characterId, nearbySeat);
        options.onAction(nearbySeat.sleeping ? "Snug as a bug!" : "Perfect spot!");
      } else {
        standCharacter(characterId);
        options.onAction(`${CHARACTER_DEFINITIONS[characterId].shortName} is ready right there!`);
      }
      emitPlayState();
      return;
    }

    const targetId = completedDrag.characterId;
    const giverId = selectedCharacterId;
    if (targetId !== giverId) {
      if (transferHeldItem(giverId, targetId)) {
        emitPlayState();
        return;
      }
      if (transferHeldItem(targetId, giverId)) {
        emitPlayState();
        return;
      }
      options.onAction(`${CHARACTER_DEFINITIONS[targetId].shortName} smiles at Khadija.`, "tap");
      return;
    }
    selectCharacter(targetId);
  });

  // Click-to-walk always controls the selected character.
  scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
    if (pointerInfo.type !== PointerEventTypes.POINTERPICK) return;
    if ((pointerInfo.event as PointerEvent).button !== 0) return;
    if (suppressNextWalkPick) {
      suppressNextWalkPick = false;
      return;
    }
    const pick = pointerInfo.pickInfo;
    if (!pick?.hit || !pick.pickedPoint || !pick.pickedMesh?.metadata?.walkable) return;
    if (pick.pickedMesh.metadata.room !== activeRoom) return;
    standCharacter(selectedCharacterId);
    selectedRig().setTarget(new Vector3(pick.pickedPoint.x, 0, pick.pickedPoint.z));
    selectedState().interaction = "walking";
    emitPlayState();
    options.onAction("Off we go!");
  });

  const pressedKeys = new Set<string>();
  scene.onKeyboardObservable.add((keyboardInfo: KeyboardInfo) => {
    if (options.isKeyboardInputEnabled?.() === false) {
      pressedKeys.clear();
      return;
    }

    const eventTarget = keyboardInfo.event.target;
    if (
      eventTarget instanceof HTMLElement
      && (
        isTextEntryElement(eventTarget.tagName, eventTarget.isContentEditable)
        || eventTarget instanceof HTMLButtonElement
        || eventTarget instanceof HTMLAnchorElement
      )
    ) return;

    const key = keyboardInfo.event.key.toLowerCase();
    if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) return;
    keyboardInfo.event.preventDefault();
    if (keyboardInfo.type === KeyboardEventTypes.KEYDOWN) pressedKeys.add(key);
    if (keyboardInfo.type === KeyboardEventTypes.KEYUP) pressedKeys.delete(key);
  });

  const temporaryReaction = (
    characterId: CharacterId,
    expression: CharacterExpression,
    gesture?: UseGesture,
  ): void => {
    const rig = characterRigs[characterId];
    rig.setExpression(expression);
    if (gesture) rig.playUseGesture(gesture);
    window.setTimeout(() => {
      if (characterId !== selectedCharacterId) {
        rig.setExpression(characters[characterId].expression);
      }
    }, 1050);
  };

  const playTogether = (): void => {
    const actorId = selectedCharacterId;
    const actorState = selectedState();
    let friendId: CharacterId | null = null;
    let closest = 3.1;
    for (const characterId of CHARACTER_IDS) {
      if (characterId === actorId || characters[characterId].room !== activeRoom) continue;
      const distance = Vector3.Distance(
        characterRigs[actorId].root.position,
        characterRigs[characterId].root.position,
      );
      if (distance < closest) {
        friendId = characterId;
        closest = distance;
      }
    }
    if (!friendId) {
      options.onAction("Move a family member nearby to play together.", "invalid");
      return;
    }

    const friendRig = characterRigs[friendId];
    const actorRig = characterRigs[actorId];
    actorRig.cancelMovement();
    friendRig.cancelMovement();
    actorRig.lookAt(friendRig.root.position);
    friendRig.lookAt(actorRig.root.position);
    const held = actorState.heldItem ? holdables.get(actorState.heldItem) : null;

    if (activeRoom === "park" && held?.id === "watering-can") {
      actorRig.playUseGesture("drink");
      friendRig.playUseGesture("hug");
      temporaryReaction(actorId, "excited");
      temporaryReaction(friendId, "happy");
      rememberForRoomNpcs("activity", "water-plants-together");
      options.onAction("Teamwork makes the park flowers sparkle!", "water");
    } else if (activeRoom === "park" && (held?.gesture === "eat" || held?.gesture === "drink")) {
      actorRig.playUseGesture(held.gesture);
      friendRig.playUseGesture(held.gesture);
      temporaryReaction(actorId, "happy");
      temporaryReaction(friendId, "excited");
      rememberForRoomNpcs("activity", "family-picnic");
      options.onAction("A cheerful family picnic together!", "shared");
    } else if (activeRoom === "park" && !held) {
      actorRig.playUseGesture("hug");
      friendRig.playUseGesture("hug");
      temporaryReaction(actorId, "excited");
      temporaryReaction(friendId, "excited");
      rememberForRoomNpcs("activity", "playground-together");
      options.onAction("A wonderful playground game together!", "shared");
    } else if (held?.gesture === "read") {
      actorRig.playUseGesture("read");
      friendRig.playUseGesture("read");
      temporaryReaction(actorId, "happy");
      temporaryReaction(friendId, "excited");
      options.onAction("Story time together!", "shared");
    } else if (held?.id === "teddy" || held?.gesture === "hug") {
      actorRig.playUseGesture("hug");
      friendRig.playUseGesture("hug");
      temporaryReaction(actorId, "excited");
      temporaryReaction(friendId, "happy");
      options.onAction("A happy toy game together!", "shared");
    } else if (held?.gesture === "eat" || held?.gesture === "drink") {
      actorRig.playUseGesture(held.gesture);
      friendRig.playUseGesture(held.gesture);
      temporaryReaction(actorId, "happy");
      temporaryReaction(friendId, "excited");
      options.onAction(`A tasty ${held.gesture === "eat" ? "snack" : "drink"} to share!`, "shared");
    } else {
      actorRig.playUseGesture("hug");
      friendRig.playUseGesture("hug");
      temporaryReaction(actorId, "excited");
      temporaryReaction(friendId, "excited");
      options.onAction("High-five! What a great team!", "shared");
    }
    window.setTimeout(() => {
      actorRig.lookAt(null);
      friendRig.lookAt(null);
    }, 1150);
  };

  const interactionNames: Record<string, { label: string; hint: string; icon: string }> = {
    "home-to-bedroom-door": { label: "Khadija's bedroom", hint: "Tap to go to the bedroom", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª" },
    "home-to-street-door": { label: "Neighborhood", hint: "Tap to go outside", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª" },
    "bedroom-to-home-door": { label: "Family home", hint: "Tap to return home", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª" },
    "street-to-home-door": { label: "Family home", hint: "Tap to go inside", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â " },
    "street-to-cafe-door": { label: "Sunny CafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©", hint: "Tap to enter the cafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¹Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢" },
    "cafe-to-street-door": { label: "Neighborhood", hint: "Tap to go outside", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª" },
    "street-to-park-gate": { label: "Neighborhood park", hint: "Tap to visit the park", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³" },
    "street-to-grocery-door": { label: "Sunny Basket Grocery", hint: "Tap to visit the shop", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢" },
    "park-exit-door": { label: "Neighborhood", hint: "Tap to leave the park", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª" },
    "grocery-exit-door": { label: "Neighborhood", hint: "Tap to leave the shop", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª" },
    "lamp-shade": { label: "Living-room lamp", hint: "Tap to switch the light", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡" },
    "bedroom-lamp-shade": { label: "Bedside lamp", hint: "Tap to switch the light", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡" },
    "cafe-counter-bell": { label: "Counter bell", hint: "Tap to ring the bell", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â" },
    "cafe-menu-board": { label: "CafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© menu", hint: "Tap to hear today's special", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¹" },
    "cafe-pastry-hotspot": { label: "Pastry display", hint: "Tap to choose a treat", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â" },
    "cafe-drink-hotspot": { label: "Hot drinks", hint: "Tap to order a drink", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¹Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢" },
    "cafe-seat-hotspot": { label: "CafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© chair", hint: "Tap to sit down", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œ" },
    "sofa-seat-hotspot": { label: "Family sofa", hint: "Tap to sit down", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â" },
    "bed-hotspot": { label: "Khadija's bed", hint: "Tap to rest or sleep", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â" },
    "street-bench-hotspot": { label: "Neighborhood bench", hint: "Tap to sit down", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œ" },
    "street-scooter-hotspot": { label: "Scooter", hint: "Tap to take a little ride", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â´" },
  };

  const everydayLabels: Record<string, { label: string; hint: string; icon: string }> = {
    toaster: { label: "Toaster", hint: "Bring an ingredient and tap", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¾" },
    blender: { label: "Blender", hint: "Bring ingredients and tap", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤" },
    kettle: { label: "Kettle", hint: "Bring a cup or tea and tap", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â«ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ" },
    oven: { label: "Oven", hint: "Bring an ingredient and tap", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â" },
    "prep-plate": { label: "Preparation plate", hint: "Place recipe ingredients here", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â" },
    "mixing-bowl": { label: "Mixing bowl", hint: "Add ingredients for a recipe", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£" },
    "fridge-shelves": { label: "Fridge", hint: "Tap to open the food shelves", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â " },
    "kitchen-drawer": { label: "Kitchen drawer", hint: "Tap to look inside", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½" },
    "kitchen-cupboard": { label: "Kitchen cupboard", hint: "Tap to look inside", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª" },
    "cafe-display": { label: "CafÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© display", hint: "Tap to choose a treat", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â" },
    "return-tray": { label: "Return tray", hint: "Bring used dishes here", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â" },
    "wash-hands": { label: "Sink", hint: "Tap to wash hands", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â«ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§" },
    "brush-teeth": { label: "Toothbrush", hint: "Tap to brush teeth", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂªÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥" },
    "bath-time": { label: "Bath", hint: "Tap for bubble-bath play", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â" },
    "use-towel": { label: "Towel", hint: "Tap to get warm and dry", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âº" },
    "mirror-smile": { label: "Mirror", hint: "Tap to make a happy face", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂªÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¾" },
    "wardrobe-shelves": { label: "Wardrobe", hint: "Tap to open the clothes", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â" },
    "toy-box": { label: "Toy box", hint: "Tap to look for a toy", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸" },
    "clean-table": { label: "Coffee table", hint: "Bring the sponge and tap to clean", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¨" },
    "clean-counter": { label: "Kitchen counter", hint: "Bring the sponge and tap to clean", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¨" },
    "wash-dish": { label: "Kitchen sink", hint: "Bring a dish and tap to wash", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â«ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§" },
    "bin-rubbish": { label: "Kitchen bin", hint: "Bring rubbish here", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â" },
    "tidy-books": { label: "Book shelf", hint: "Bring the book back here", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡" },
    "tidy-clothes": { label: "Wardrobe", hint: "Bring folded clothes here", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢" },
  };

  const worldActionLabels: Record<string, { label: string; hint: string; icon: string }> = {
    "grocery-checkout": { label: "Checkout", hint: "Bring your basket and tap", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢" },
    "grocery-stock": { label: "Store shelves", hint: "Tap to restock the shop", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦" },
    "park-bench-left": { label: "Park bench", hint: "Tap to sit down", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œ" },
    "park-bench-right": { label: "Park bench", hint: "Tap to sit down", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œ" },
    "park-picnic": { label: "Picnic blanket", hint: "Tap to enjoy a picnic", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âº" },
    "park-slide": { label: "Slide", hint: "Tap to play on the slide", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â" },
    "park-swings": { label: "Swings", hint: "Tap to swing", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â½ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â " },
    "park-sandbox": { label: "Sandbox", hint: "Tap to build a sandcastle", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â" },
    "park-fountain": { label: "Drinking fountain", hint: "Tap for a cool drink", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â²" },
    "park-bin": { label: "Park bin", hint: "Bring rubbish here", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â" },
    "park-sign": { label: "Park sign", hint: "Tap to read the park message", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂªÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§" },
    "park-flowers": { label: "Flower bed", hint: "Bring the watering can", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â·" },
    "park-birds": { label: "Friendly birds", hint: "Bring a little fruit or bread", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦" },
  };

  // Add readable interaction names without replacing any existing metadata or
  // action managers. The label system is informational only.
  for (const mesh of scene.meshes) {
    const metadata = mesh.metadata as Record<string, unknown> | null | undefined;
    const holdableId = metadata?.holdableId as string | undefined;
    const npcId = metadata?.npcId as NpcId | undefined;
    const characterId = metadata?.characterId as CharacterId | undefined;
    const everydayId = metadata?.everydayTarget as string | undefined;
    const worldAction = metadata?.world3Action as string | undefined;
    const groceryProduct = metadata?.groceryProduct as string | undefined;
    const outfit = metadata?.outfit as OutfitId | undefined;

    if (holdableId) {
      const held = holdables.get(holdableId);
      setInteraction(mesh, {
        label: held?.label ?? humanizeInteractionId(holdableId),
        hint: groceryProduct ? "Pick up or add to the shopping basket" : "Pick up or drag to a new place",
        icon: held?.gesture === "eat" ? "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â½" : held?.gesture === "drink" ? "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤" : held?.gesture === "read" ? "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ" : "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸",
        room: metadata?.room as RoomId | undefined,
      });
      continue;
    }

    if (npcId && NPC_IDS.includes(npcId)) {
      setInteraction(mesh, {
        label: NPC_DEFINITIONS[npcId].displayName,
        hint: "Talk, give a gift, or receive an item",
        icon: npcId === "parent" ? "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬" : "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¹",
        room: NPC_DEFINITIONS[npcId].homeLocation,
      });
      continue;
    }

    if (characterId && characterId !== "khadija") {
      setInteraction(mesh, {
        label: CHARACTER_DEFINITIONS[characterId].shortName,
        hint: "Tap to play together, or drag to move",
        icon: characterId === "sister" ? "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢" : "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦",
        room: characters[characterId].room,
      });
      continue;
    }

    if (everydayId) {
      const definition = everydayLabels[everydayId] ?? {
        label: humanizeInteractionId(everydayId),
        hint: "Tap to use",
        icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¨",
      };
      setInteraction(mesh, { ...definition, room: metadata?.room as RoomId | undefined });
      continue;
    }

    if (worldAction) {
      const definition = worldActionLabels[worldAction] ?? {
        label: humanizeInteractionId(worldAction),
        hint: "Tap to play",
        icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¨",
      };
      setInteraction(mesh, { ...definition, room: metadata?.room as RoomId | undefined });
      continue;
    }

    if (groceryProduct) {
      setInteraction(mesh, {
        label: humanizeInteractionId(groceryProduct),
        hint: "Pick up or add to the shopping basket",
        icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢",
        room: "grocery",
      });
      continue;
    }

    if (outfit) {
      setInteraction(mesh, {
        label: `${humanizeInteractionId(outfit)} outfit`,
        hint: "Tap to change Khadija's clothes",
        icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â",
        room: "home",
      });
      continue;
    }

    const named = interactionNames[mesh.name];
    if (named) {
      setInteraction(mesh, { ...named, room: metadata?.room as RoomId | undefined });
      continue;
    }

    if (mesh.actionManager) {
      const cleanedName = humanizeInteractionId(mesh.name)
        .replace(/\bHotspot\b/gi, "")
        .replace(/\bWorld3\b/gi, "")
        .replace(/\bDraggable\b/gi, "")
        .trim();
      setInteraction(mesh, {
        label: cleanedName || "Interactive object",
        hint: "Tap to interact",
        icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¨",
        room: metadata?.room as RoomId | undefined,
      });
    }
  }

  let interactionHintTimer = 0;
  let lastInteractionHint = "";
  const clearInteractionHint = (): void => {
    window.clearTimeout(interactionHintTimer);
    lastInteractionHint = "";
    options.onInteractionHint?.(null);
  };
  const showInteractionHint = (
    descriptor: InteractionDescriptor,
    pointerEvent: PointerEvent,
    temporary: boolean,
  ): void => {
    if (descriptor.room && descriptor.room !== activeRoom) {
      clearInteractionHint();
      return;
    }
    const key = `${descriptor.label}|${descriptor.hint}`;
    if (key !== lastInteractionHint || temporary) {
      options.onInteractionHint?.({
        ...descriptor,
        x: pointerEvent.clientX,
        y: pointerEvent.clientY,
      });
      lastInteractionHint = key;
    } else {
      options.onInteractionHint?.({
        ...descriptor,
        x: pointerEvent.clientX,
        y: pointerEvent.clientY,
      });
    }
    if (temporary) {
      window.clearTimeout(interactionHintTimer);
      interactionHintTimer = window.setTimeout(clearInteractionHint, 1700);
    }
  };

  scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
    if (
      pointerInfo.type !== PointerEventTypes.POINTERMOVE
      && pointerInfo.type !== PointerEventTypes.POINTERDOWN
    ) return;
    const pointerEvent = pointerInfo.event as PointerEvent;
    const descriptor = interactionFromNode(pointerInfo.pickInfo?.pickedMesh ?? null);
    if (!descriptor) {
      if (pointerInfo.type === PointerEventTypes.POINTERMOVE) clearInteractionHint();
      return;
    }
    const isTouch = pointerEvent.pointerType === "touch";
    if (pointerInfo.type === PointerEventTypes.POINTERMOVE && isTouch) return;
    showInteractionHint(descriptor, pointerEvent, isTouch || pointerInfo.type === PointerEventTypes.POINTERDOWN);
  });

  if (renderingCanvas) {
    renderingCanvas.addEventListener("pointerleave", clearInteractionHint);
    disposables.add(() => renderingCanvas.removeEventListener("pointerleave", clearInteractionHint));
  }

  const nearestCompanionPosition = (
    room: RoomId,
    origin: Vector3,
    exceptCharacter?: CharacterId,
  ): Vector3 | null => {
    let nearest: Vector3 | null = null;
    let nearestDistance = 4.2;
    for (const characterId of CHARACTER_IDS) {
      if (characterId === exceptCharacter || characters[characterId].room !== room) continue;
      const candidate = characterRigs[characterId].root.position;
      const distance = Vector3.Distance(origin, candidate);
      if (distance < nearestDistance) {
        nearest = candidate;
        nearestDistance = distance;
      }
    }
    for (const npcId of NPC_IDS) {
      if (npcStates[npcId].room !== room) continue;
      const candidate = npcRigs[npcId].root.position;
      const distance = Vector3.Distance(origin, candidate);
      if (distance < nearestDistance) {
        nearest = candidate;
        nearestDistance = distance;
      }
    }
    return nearest?.clone() ?? null;
  };

  const interestingTargets: Record<RoomId, readonly Vector3[]> = {
    home: [
      new Vector3(-4.45, 1.2, .35),
      new Vector3(3.45, 1.25, .65),
      new Vector3(.1, 1.4, 3.25),
    ],
    bedroom: [
      bedroomPosition(-3.7, 1.1, .35),
      bedroomPosition(4.9, 1.2, -3.2),
      bedroomPosition(.6, .8, -.3),
    ],
    street: [
      streetPosition(-5.05, 1.3, .75),
      streetPosition(-.25, 2.1, 2.3),
      streetPosition(3.45, 2.1, 3.1),
    ],
    cafe: [
      cafePosition(2.1, 1.9, 3.05),
      cafePosition(4.65, 1.35, .55),
      cafePosition(-4.7, 1.2, 2.65),
    ],
    park: [
      parkPosition(-3.8, .8, 1.85),
      parkPosition(3.4, 1.4, -2.1),
      parkPosition(-3.35, .8, -2.2),
    ],
    grocery: [
      groceryPosition(-2.6, 1.4, 1.55),
      groceryPosition(3.55, 1.1, .35),
      groceryPosition(.8, 1.3, -2.55),
    ],
  };

  const safeHeldItemForWander = (itemId: string | null): boolean => (
    itemId === null || itemId === "teddy" || itemId === "book"
  );

  const pointInside = (
    point: Vector3,
    minX: number,
    maxX: number,
    minZ: number,
    maxZ: number,
  ): boolean => (
    point.x >= minX && point.x <= maxX && point.z >= minZ && point.z <= maxZ
  );

  const safeAutonomyPoint = (room: RoomId, point: Vector3): boolean => {
    const blocked: Record<RoomId, readonly [number, number, number, number][]> = {
      home: [
        [-4.8, -2.05, -.7, .75],
        [2.55, 4.55, -.1, 1.35],
      ],
      bedroom: [
        [17.25, 19.45, -.95, 1.45],
        [25.9, 27.35, -3.45, -2.55],
      ],
      street: [
        [41.0, 42.7, .55, 1.7],
        [38.55, 39.3, .2, 1.25],
        [43.2, 44.45, 1.4, 3.3],
      ],
      cafe: [
        [68.0, 71.8, 1.15, 3.55],
        [61.7, 63.25, .25, 1.65],
        [64.15, 65.65, .25, 1.65],
      ],
      park: [
        [83.2, 85.3, 1.25, 2.35],
        [90.4, 92.35, -3.2, -1.0],
        [91.5, 93.45, 1.75, 3.15],
      ],
      grocery: [
        [106.0, 109.2, -3.25, -2.0],
        [106.0, 109.3, -.1, 3.15],
        [113.1, 115.3, -3.2, 3.35],
      ],
    };
    return !blocked[room].some(([minX, maxX, minZ, maxZ]) => (
      pointInside(point, minX, maxX, minZ, maxZ)
    ));
  };

  const beginShortWander = (
    characterId: CharacterId,
    controller: LivingController,
  ): void => {
    const rig = characterRigs[characterId];
    const anchor = playableAnchors[characterId];
    const step = controller.decisionCount % 4;
    const offset = [
      new Vector3(.48, 0, .18),
      new Vector3(-.4, 0, .3),
      new Vector3(.18, 0, -.46),
      new Vector3(-.32, 0, -.28),
    ][step];
    const candidate = anchor.add(offset);
    if (!safeAutonomyPoint(characters[characterId].room, candidate)) {
      controller.action = "look-around";
      rig.lookAt(interestingTargets[activeRoom][controller.seed % interestingTargets[activeRoom].length]);
      return;
    }
    controller.action = "short-wander";
    rig.setTarget(candidate, () => {
      if (
        characterId !== selectedCharacterId
        && livingSettings.smallMovements
        && characters[characterId].room === activeRoom
      ) {
        window.setTimeout(() => {
          if (livingSettings.smallMovements) rig.setTarget(anchor);
        }, 650 + controller.seed * 90);
      }
    });
  };

  const decidePlayableAction = (
    characterId: CharacterId,
    now: number,
  ): void => {
    const state = characters[characterId];
    const rig = characterRigs[characterId];
    const controller = playableControllers[characterId];
    if (characterId === selectedCharacterId || state.room !== activeRoom) return;

    if (state.sleeping || rig.isSleeping()) {
      controller.action = "sleep";
      rig.lookAt(null);
      scheduleNextDecision(controller, now, 7000, 11000);
      return;
    }

    const choices: LivingAction[] = state.activity === "sitting"
      ? ["relax", "look-around", "social", "use-item"]
      : ["idle", "look-around", "react", "social", "use-item"];
    if (
      livingSettings.smallMovements
      && state.activity === "standing"
      && safeHeldItemForWander(state.heldItem)
    ) {
      choices.push("short-wander");
    }
    const action = chooseLivingAction(controller, choices);
    controller.action = action;

    if (action === "short-wander") {
      beginShortWander(characterId, controller);
      scheduleNextDecision(controller, now, 7600, 12200);
      return;
    }

    if (action === "social") {
      const companion = nearestCompanionPosition(activeRoom, rig.root.position, characterId);
      rig.lookAt(companion);
      temporaryReaction(characterId, "happy", "hug");
    } else if (action === "react") {
      temporaryReaction(
        characterId,
        controller.decisionCount % 2 === 0 ? "surprised" : "excited",
      );
    } else if (action === "use-item" && state.heldItem) {
      const held = holdables.get(state.heldItem);
      if (held) rig.playUseGesture(held.gesture);
    } else if (action === "look-around") {
      const targets = interestingTargets[activeRoom];
      rig.lookAt(targets[(controller.seed + controller.decisionCount) % targets.length]);
    } else if (action === "relax") {
      rig.lookAt(nearestCompanionPosition(activeRoom, rig.root.position, characterId));
    } else {
      rig.lookAt(null);
    }
    scheduleNextDecision(controller, now);
  };

  const npcSafePoints: Record<NpcId, readonly Vector3[]> = {
    parent: [
      new Vector3(1.75, 0, 1.45),
      new Vector3(1.35, 0, 1.1),
      new Vector3(2.15, 0, 1.7),
    ],
    neighbor: [
      streetPosition(-3.65, 0, -.85),
      streetPosition(-4.25, 0, -.35),
      streetPosition(-3.05, 0, -.55),
    ],
    "cafe-worker": [
      cafePosition(3.55, 0, 2.75),
      cafePosition(2.85, 0, 2.7),
      cafePosition(3.95, 0, 3.05),
    ],
    "park-keeper": [
      parkPosition(-3.35, 0, 1.45),
      parkPosition(-4.0, 0, 1.1),
      parkPosition(-2.8, 0, 1.7),
    ],
    "park-parent": [
      parkPosition(3.2, 0, -.35),
      parkPosition(3.8, 0, -.25),
      parkPosition(3.45, 0, .3),
    ],
    shopkeeper: [
      groceryPosition(1.7, 0, -1.9),
      groceryPosition(1.0, 0, -1.8),
      groceryPosition(2.15, 0, -2.15),
    ],
    "grocery-shopper": [
      groceryPosition(-2.9, 0, .15),
      groceryPosition(-3.35, 0, 1.0),
      groceryPosition(-2.2, 0, 1.65),
    ],
  };

  const decideNpcAction = (npcId: NpcId, now: number): void => {
    const definition = NPC_DEFINITIONS[npcId];
    const state = npcStates[npcId];
    const rig = npcRigs[npcId];
    const controller = npcControllers[npcId];
    if (state.room !== activeRoom) return;

    const choices = definition.idleBehaviorSet.filter((choice) => (
      choice !== "short-wander" || livingSettings.smallMovements
    ));
    const action = chooseLivingAction(controller, choices);
    controller.action = action;

    if (action === "short-wander" || (action === "work" && livingSettings.smallMovements)) {
      const points = npcSafePoints[npcId];
      const target = points[(controller.seed + controller.decisionCount) % points.length];
      rig.setTarget(target, () => {
        state.activity = action === "work" ? "work" : "relax";
      });
    } else if (action === "social") {
      rig.lookAt(nearestCompanionPosition(activeRoom, rig.root.position));
      reactNpc(npcId, "happy");
    } else if (action === "react") {
      reactNpc(npcId, "excited");
    } else if (action === "use-item" && state.heldItem) {
      const held = holdables.get(state.heldItem);
      if (held) rig.playUseGesture(held.gesture);
    } else if (action === "work" && npcId === "cafe-worker") {
      rig.lookAt(null);
      rig.root.rotation.y = 0;
      state.rotationY = 0;
      rig.playUseGesture("drink");
    } else {
      const playerPosition = characters[selectedCharacterId].room === activeRoom
        ? selectedRig().root.position
        : null;
      rig.lookAt(playerPosition);
      if (action === "work") rig.playUseGesture("read");
    }
    scheduleNextDecision(controller, now, 4300, 8800);
  };

  let saveMovementTimer = 0;
  let livingDecisionTimer = 0;
  const movementInput = new Vector3();
  scene.onBeforeRenderObservable.add(() => {
    const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05);
    if (options.isKeyboardInputEnabled?.() === false) pressedKeys.clear();
    movementInput.set(
      (pressedKeys.has("d") || pressedKeys.has("arrowright") ? 1 : 0)
        - (pressedKeys.has("a") || pressedKeys.has("arrowleft") ? 1 : 0),
      0,
      (pressedKeys.has("w") || pressedKeys.has("arrowup") ? 1 : 0)
        - (pressedKeys.has("s") || pressedKeys.has("arrowdown") ? 1 : 0),
    );

    const hasMovementInput = movementInput.lengthSquared() > 0;
    if (hasMovementInput) {
      if (selectedState().activity !== "standing") {
        standCharacter(selectedCharacterId);
        emitPlayState();
      }
      selectedState().interaction = "walking";
      selectedRig().moveBy(movementInput, deltaSeconds);
      saveMovementTimer += deltaSeconds;
      if (saveMovementTimer >= 0.5) {
        saveMovementTimer = 0;
        persistCharacter(selectedCharacterId);
      }
    }

    for (const characterId of CHARACTER_IDS) {
      if (characters[characterId].room !== activeRoom) continue;
      if (characterId === selectedCharacterId && hasMovementInput) continue;
      characterRigs[characterId].update(deltaSeconds);
    }

    const khadijaMoving = hasMovementInput || selectedRig().isMoving();
    if (khadijaMoving) options.onPlayerMovement?.();
    if (!khadijaMoving && selectedState().interaction === "walking") {
      selectedState().interaction = "idle";
    }
    khadijaProductionVisual.update(
      khadijaMoving,
      selectedState().activity,
      selectedState().interaction,
      Boolean(selectedState().heldItem),
    );

    for (const characterId of COMPANION_CHARACTER_IDS) {
      const productionVisual = characterProductionVisuals[characterId];
      const state = characters[characterId];
      if (!productionVisual || state.room !== activeRoom) continue;
      const moving = characterRigs[characterId].isMoving();
      productionVisual.update(
        moving,
        state.activity,
        moving ? "walking" : state.interaction,
        Boolean(state.heldItem),
      );
    }

    for (const npcId of NPC_IDS) {
      if (npcStates[npcId].room !== activeRoom) continue;
      npcRigs[npcId].update(deltaSeconds);
      const productionVisual = npcProductionVisuals[npcId];
      if (!productionVisual) continue;
      const moving = npcRigs[npcId].isMoving();
      productionVisual.update(
        moving,
        "standing",
        moving ? "walking" : "idle",
        Boolean(npcStates[npcId].heldItem),
      );
    }

    if (!livingSettings.idleAnimations) return;
    livingDecisionTimer += deltaSeconds;
    if (livingDecisionTimer < .25) return;
    livingDecisionTimer = 0;
    const now = performance.now();
    for (const characterId of CHARACTER_IDS) {
      const controller = playableControllers[characterId];
      if (
        characterId !== selectedCharacterId
        && characters[characterId].room === activeRoom
        && now >= controller.nextDecisionAt
      ) {
        decidePlayableAction(characterId, now);
      }
    }
    for (const npcId of NPC_IDS) {
      const controller = npcControllers[npcId];
      if (npcStates[npcId].room === activeRoom && now >= controller.nextDecisionAt) {
        decideNpcAction(npcId, now);
      }
    }
  });

  // Synchronize the player-facing controls with a restored save before the
  // player makes their first interaction.
  emitPlayState();

  const setQuality = (settings: QualitySettings): void => {
    enhancedLighting = settings.enhancedLighting;
    sun.intensity = enhancedLighting ? 0.58 : 0.35;
    applyActiveRoomLighting();
    graphics.setQuality(settings);
    for (const mesh of detailMeshes) mesh.setEnabled(settings.decorativeDetails);
    interiorFurniture.setQualityEnabled(settings.decorativeDetails);
    // High-detail Meshy hero characters remain disabled on Low. Procedural
    // companions and world NPCs remain available on every quality preset.
    mediumHighProductionEnabled = settings.adaptive
      || settings.hardwareScalingLevel < 1.6;
    refreshProductionVisualLoading();
  };

  const setLivingSettings = (settings: LivingSettings): void => {
    livingSettings.idleAnimations = settings.idleAnimations;
    livingSettings.smallMovements = settings.smallMovements;
    if (!settings.idleAnimations || !settings.smallMovements) {
      for (const characterId of CHARACTER_IDS) {
        if (characterId !== selectedCharacterId) characterRigs[characterId].cancelMovement();
      }
      for (const npcId of NPC_IDS) npcRigs[npcId].cancelMovement();
    }
    updateCharacterVisibility();
  };

  const getLivingDebugState = (): {
    activePlayable: number;
    activeNpcs: number;
    decisions: number;
  } => ({
    activePlayable: 0,
    activeNpcs: livingSettings.idleAnimations
      ? COMPANION_CHARACTER_IDS.filter((id) => characters[id].room === activeRoom).length
        + NPC_IDS.filter((id) => npcStates[id].room === activeRoom).length
      : 0,
    decisions: [
      ...Object.values(playableControllers),
      ...Object.values(npcControllers),
    ].reduce((total, controller) => total + controller.decisionCount, 0),
  });

  const getDialogueContext = (npcId: NpcId): RoomDialogueContext | null => {
    if (!NPC_IDS.includes(npcId) || npcStates[npcId].room !== activeRoom) return null;
    const current = selectedState();
    const nearbyCharacterIds = CHARACTER_IDS.filter((characterId) => (
      characters[characterId].room === activeRoom
      && Vector3.Distance(characterRigs[characterId].root.position, npcRigs[npcId].root.position) <= 4.4
    ));
    return {
      npcId,
      activeCharacterId: selectedCharacterId,
      activeCharacterName: CHARACTER_DEFINITIONS[selectedCharacterId].shortName,
      locationId: activeRoom,
      locationName: roomNames[activeRoom],
      nearbyCharacterIds,
      heldItemId: current.heldItem ?? undefined,
      recentWorldEvents: [...world3State.recentEvents],
      relationshipLevel: 0,
      recentTopics: [],
    };
  };

  return {
    scene,
    setQuality,
    useHeldItem,
    dropHeldItem,
    setOutfit,
    setExpression,
    selectCharacter,
    switchRoom,
    setLivingSettings,
    playTogether,
    getDialogueContext,
    getLivingDebugState,
    dispose: () => {
      for (const productionVisual of Object.values(characterProductionVisuals)) {
        productionVisual?.dispose();
      }
      for (const productionVisual of Object.values(npcProductionVisuals)) {
        productionVisual?.dispose();
      }
      graphics.dispose();
      disposables.dispose();
      interiorFurniture.dispose();
      locationRegistry.dispose();
      scene.dispose();
    },
  };
}
