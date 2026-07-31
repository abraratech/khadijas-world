import {
  ActionManager,
  Animation,
  Color3,
  ExecuteCodeAction,
  type Mesh,
  MeshBuilder,
  type Scene,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import type { ContentState } from "../../contentState";
import type { SeatSlot } from "../../seatRegistry";
import { saveContentState, type RoomId } from "../../storage";
import { createMaterial as material, WORLD_COLORS as colors, type WorldMaterialRegistry } from "../../shared/createMaterials";
import { box } from "../../shared/meshHelpers";
import type { InteractionSound } from "../../world/WorldContext";
import type { LocationBuildResult } from "../../world/LocationBuildResult";

export interface BedroomBuild extends LocationBuildResult {
  bedHotspot: Mesh;
}

export interface BedroomContext {
  scene: Scene;
  materials: WorldMaterialRegistry;
  detailMeshes: Mesh[];
  contentState: ContentState;
  position(x: number, y: number, z: number): Vector3;
  initialLampOn: boolean;
  onLampChanged(next: boolean): void;
  onAction(message: string, sound?: InteractionSound): void;
}

export function buildBedroom({
  scene,
  materials,
  detailMeshes,
  contentState,
  position: bedroomPosition,
  initialLampOn,
  onLampChanged,
  onAction,
}: BedroomContext): BedroomBuild {
  const root = new TransformNode("location-bedroom-root", scene);
  const meshStart = scene.meshes.length;
  let bedroomLampOn = initialLampOn;
  const { floor: floorMat, floorLight, lavender, creamWall, white, teal, mint, wood, pink, yellow, sky } = materials;

  const bedroomFloor = box(
    scene,
    "bedroom-floor",
    new Vector3(12, 0.18, 8),
    bedroomPosition(0, -0.1, 0),
    floorMat,
  );
  bedroomFloor.metadata = { walkable: true, room: "bedroom" satisfies RoomId };
  box(scene, "bedroom-back-wall", new Vector3(12, 4.2, 0.2), bedroomPosition(0, 2, 4), lavender);
  box(scene, "bedroom-left-wall", new Vector3(0.2, 4.2, 8), bedroomPosition(-6, 2, 0), creamWall);

  for (let z = -3.5; z <= 3.5; z += 0.5) {
    const plank = box(
      scene,
      `bedroom-floor-plank-${z}`,
      new Vector3(11.8, 0.012, 0.025),
      bedroomPosition(0, 0.003, z),
      floorLight,
    );
    plank.isPickable = false;
    detailMeshes.push(plank);
  }

  box(scene, "bedroom-window-view", new Vector3(3, 1.7, 0.08), bedroomPosition(-2.8, 2.55, 3.86), sky);
  box(scene, "bedroom-window-top", new Vector3(3.25, 0.12, 0.12), bedroomPosition(-2.8, 3.46, 3.75), white);
  box(scene, "bedroom-window-bottom", new Vector3(3.25, 0.12, 0.12), bedroomPosition(-2.8, 1.63, 3.75), white);
  box(scene, "bedroom-window-left", new Vector3(0.12, 1.95, 0.12), bedroomPosition(-4.42, 2.55, 3.75), white);
  box(scene, "bedroom-window-right", new Vector3(0.12, 1.95, 0.12), bedroomPosition(-1.18, 2.55, 3.75), white);
  box(scene, "bedroom-curtain-left", new Vector3(0.42, 2.05, 0.2), bedroomPosition(-4.28, 2.5, 3.55), pink);
  box(scene, "bedroom-curtain-right", new Vector3(0.42, 2.05, 0.2), bedroomPosition(-1.32, 2.5, 3.55), pink);

  const bedroomRug = box(
    scene,
    "bedroom-rug",
    new Vector3(4.7, 0.04, 3.1),
    bedroomPosition(0.1, 0.02, -0.35),
    mint,
  );
  bedroomRug.metadata = { walkable: true, room: "bedroom" satisfies RoomId };
  const bedroomRugInset = box(
    scene,
    "bedroom-rug-inset",
    new Vector3(4.1, 0.018, 2.5),
    bedroomPosition(0.1, 0.045, -0.35),
    pink,
  );
  bedroomRugInset.isPickable = false;
  detailMeshes.push(bedroomRugInset);

  // A separate ensuite nook keeps hygiene play visually distinct from
  // the sleeping and dress-up parts of the bedroom.
  box(
    scene,
    "bedroom-ensuite-wall-back",
    new Vector3(.16, 2.75, 1.30),
    bedroomPosition(.72, 1.37, -2.68),
    creamWall,
  );

  box(
    scene,
    "bedroom-ensuite-wall-front",
    new Vector3(.16, 2.75, .56),
    bedroomPosition(.72, 1.37, -.92),
    creamWall,
  );

  box(
    scene,
    "bedroom-ensuite-door-header",
    new Vector3(.16, .36, .82),
    bedroomPosition(.72, 2.56, -1.62),
    creamWall,
  );

  box(
    scene,
    "bedroom-ensuite-floor",
    new Vector3(4.75, .035, 2.70),
    bedroomPosition(3.25, .015, -2.12),
    sky,
  ).isPickable = false;

  // A lower, layered bed keeps the sleeping pose readable from the dollhouse camera.
  box(scene, "bed-frame", new Vector3(3.42, .28, 2.22), bedroomPosition(-3.55, .20, .55), wood);
  box(scene, "bed-mattress", new Vector3(3.18, .34, 2.02), bedroomPosition(-3.55, .48, .52), creamWall);
  box(scene, "bed-blanket", new Vector3(2.36, .12, 1.94), bedroomPosition(-3.12, .70, .48), lavender);
  box(scene, "bed-blanket-fold", new Vector3(.56, .15, 1.96), bedroomPosition(-2.18, .76, .48), pink);
  box(scene, "bed-headboard", new Vector3(3.42, 1.10, .24), bedroomPosition(-3.55, .78, 1.55), wood);
  box(scene, "bed-headboard-inset", new Vector3(2.92, .62, .08), bedroomPosition(-3.55, .86, 1.40), pink);
  box(scene, "bed-pillow-left", new Vector3(.84, .22, .62), bedroomPosition(-4.24, .76, .92), white);
  box(scene, "bed-pillow-right", new Vector3(.84, .22, .62), bedroomPosition(-3.34, .76, .92), yellow);
  for (const [index, x] of [-3.75, -3.20, -2.65].entries()) {
    const quiltStripe = box(
      scene,
      `bed-quilt-stripe-${index}`,
      new Vector3(.045, .025, 1.76),
      bedroomPosition(x, .775, .40),
      white,
    );
    quiltStripe.isPickable = false;
    detailMeshes.push(quiltStripe);
  }
  const bedHotspotMaterial = material(scene, "bed-hotspot-mat", colors.pink);
  bedHotspotMaterial.alpha = 0.025;
  const bedHotspot = box(
    scene,
    "bed-hotspot",
    new Vector3(2.9, 0.3, 1.75),
    bedroomPosition(-3.55, 1.05, 0.5),
    bedHotspotMaterial,
  );

  // Bedroom desk, mirror, wardrobe and toy storage.
  box(scene, "bedroom-desk-top", new Vector3(2.2, 0.16, 0.9), bedroomPosition(2.75, 1.05, 2.85), wood);
  for (const x of [1.95, 3.55]) {
    box(scene, `bedroom-desk-leg-${x}`, new Vector3(0.14, 1.0, 0.14), bedroomPosition(x, 0.52, 2.85), white);
  }
  box(scene, "bedroom-chair-seat", new Vector3(0.85, 0.18, 0.75), bedroomPosition(2.75, 0.58, 1.95), teal);
  box(scene, "bedroom-chair-back", new Vector3(0.85, 0.9, 0.18), bedroomPosition(2.75, 1.05, 2.25), teal);
  box(scene, "bedroom-notebook", new Vector3(0.72, 0.08, 0.52), bedroomPosition(2.50, 1.17, 2.8), pink);

  box(scene, "bedroom-wardrobe", new Vector3(1.85, 2.85, 0.72), bedroomPosition(5.0, 1.42, 2.72), wood);
  box(scene, "bedroom-wardrobe-door-left", new Vector3(0.82, 2.55, 0.08), bedroomPosition(4.55, 1.42, 2.32), mint);
  box(scene, "bedroom-wardrobe-door-right", new Vector3(0.82, 2.55, 0.08), bedroomPosition(5.45, 1.42, 2.32), mint);
  box(scene, "bedroom-mirror-frame", new Vector3(1.35, 2.35, 0.12), bedroomPosition(4.05, 1.55, 3.82), wood);
  const mirror = box(scene, "bedroom-mirror", new Vector3(1.12, 2.08, 0.05), bedroomPosition(4.05, 1.55, 3.72), sky);
  mirror.isPickable = false;

  box(scene, "toy-shelf", new Vector3(2.35, 1.35, 0.72), bedroomPosition(1.0, 0.68, 3.15), wood);
  box(scene, "toy-shelf-divider", new Vector3(0.08, 1.1, 0.62), bedroomPosition(1.0, 0.68, 2.75), white);
  const toyBall = MeshBuilder.CreateSphere("bedroom-toy-ball", { diameter: 0.46, segments: 10 }, scene);
  toyBall.position.copyFrom(bedroomPosition(0.45, 0.42, 2.72));
  toyBall.material = yellow;
  const toyBlock = box(scene, "bedroom-toy-block", new Vector3(0.48, 0.48, 0.48), bedroomPosition(1.55, 0.42, 2.72), teal);
  toyBlock.rotation.y = 0.25;

  const musicBoxMaterial = material(
    scene,
    "bedroom-music-box-star-material",
    colors.yellow,
    contentState.bedroomMusicBoxOn ? new Color3(.35, .2, .05) : Color3.Black(),
  );
  const musicBox = box(
    scene,
    "bedroom-music-box",
    new Vector3(.68, .36, .52),
    bedroomPosition(2.95, 1.28, 2.82),
    pink,
  );
  const musicBoxStar = MeshBuilder.CreatePolyhedron(
    "bedroom-music-box-star",
    { type: 1, size: .16 },
    scene,
  );
  musicBoxStar.position.copyFrom(bedroomPosition(2.95, 1.57, 2.80));
  musicBoxStar.material = musicBoxMaterial;
  musicBoxStar.isPickable = false;
  musicBox.actionManager = new ActionManager(scene);
  musicBox.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    contentState.bedroomMusicBoxOn = !contentState.bedroomMusicBoxOn;
    musicBoxMaterial.emissiveColor = contentState.bedroomMusicBoxOn
      ? new Color3(.35, .2, .05)
      : Color3.Black();
    musicBoxStar.rotation.y += Math.PI / 3;
    saveContentState(contentState);
    onAction(
      contentState.bedroomMusicBoxOn
        ? "A tiny bedtime melody twinkles!"
        : "The music box closes softly.",
      contentState.bedroomMusicBoxOn ? "bell" : "toggle",
    );
  }));

  toyBall.actionManager = new ActionManager(scene);
  toyBall.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    const startY = toyBall.position.y;
    Animation.CreateAndStartAnimation(
      "bedroom-toy-ball-bounce",
      toyBall,
      "position.y",
      30,
      10,
      startY,
      startY + .48,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
      undefined,
      () => Animation.CreateAndStartAnimation(
        "bedroom-toy-ball-land",
        toyBall,
        "position.y",
        30,
        8,
        startY + .48,
        startY,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
      ),
    );
    onAction("Boing! The ball makes a happy bounce.", "tap");
  }));

  // Bedroom lamp uses the same low-cost emissive technique as the home lamp.
  box(scene, "bedroom-lamp-stand", new Vector3(0.1, 1.25, 0.1), bedroomPosition(-1.2, 0.62, 1.35), wood);
  const bedroomLampMaterial = material(
    scene,
    "bedroom-lamp-shade-mat",
    colors.yellow,
    bedroomLampOn ? new Color3(0.35, 0.22, 0.05) : Color3.Black(),
  );
  const bedroomLampShade = MeshBuilder.CreateCylinder(
    "bedroom-lamp-shade",
    { diameterTop: 0.34, diameterBottom: 0.58, height: 0.5, tessellation: 16 },
    scene,
  );
  bedroomLampShade.position.copyFrom(bedroomPosition(-1.2, 1.42, 1.35));
  bedroomLampShade.material = bedroomLampMaterial;
  bedroomLampShade.actionManager = new ActionManager(scene);
  bedroomLampShade.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    bedroomLampOn = !bedroomLampOn;
    bedroomLampMaterial.emissiveColor = bedroomLampOn
      ? new Color3(0.35, 0.22, 0.05)
      : Color3.Black();
    onLampChanged(bedroomLampOn);
    onAction(bedroomLampOn ? "Khadija's bedroom is glowing!" : "The bedroom lamp is off for now.");
  }));

  // WORLD.2 neighborhood street. The road, garden and storefronts stay deliberately
  // mid-poly so the active-mesh budget remains suitable for older Intel integrated graphics.

  const ownedMeshes = scene.meshes.slice(meshStart);
  for (const mesh of ownedMeshes) if (!mesh.parent) mesh.parent = root;
  const seats: SeatSlot[] = [
    {
      id: "bedroom-bed-1",
      kind: "bed",
      room: "bedroom",
      position: bedroomPosition(-3.55, 0, .22),
      approach: bedroomPosition(-2.30, 0, -.55),
      rotationY: 0,
      sleeping: true,
    },
    {
      id: "bedroom-bed-2",
      kind: "bed",
      room: "bedroom",
      position: bedroomPosition(-3.55, 0, .82),
      approach: bedroomPosition(-2.30, 0, -.05),
      rotationY: 0,
      sleeping: true,
    },
  ];
  return {
    id: "bedroom",
    root,
    interactiveMeshes: ownedMeshes.filter((mesh) => Boolean(mesh.actionManager)),
    seats,
    placementSlots: [],
    bedHotspot,
    activate: () => undefined,
    deactivate: () => undefined,
    dispose: () => root.dispose(false, false),
  };
}
