import {
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
  PointerDragBehavior,
  PointerEventTypes,
  type PointerInfo,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import type { QualitySettings } from "./quality";
import {
  loadSave,
  restoreProp,
  saveKhadijaPosition,
  saveProp,
  savePlayState,
  saveRoomState,
  type OutfitId,
  type RoomId,
} from "./storage";

export interface PlayState {
  heldItem: string | null;
  seated: boolean;
  outfit: OutfitId;
  activeRoom: RoomId;
}

export interface PrototypeRoom {
  scene: Scene;
  setQuality(settings: QualitySettings): void;
  useHeldItem(): void;
  dropHeldItem(): void;
  setOutfit(outfit: OutfitId): void;
  switchRoom(room: RoomId): void;
}

interface RoomOptions {
  onAction(message: string): void;
  onPlayStateChange(state: PlayState): void;
}

interface SnapTarget {
  name: string;
  position: Vector3;
  marker: Mesh;
}

type UseGesture = "hug" | "read" | "eat" | "drink";

interface CharacterRig {
  root: TransformNode;
  holdAnchor: TransformNode;
  update(deltaSeconds: number): void;
  setTarget(target: Vector3, onArrive?: () => void): void;
  moveBy(direction: Vector3, deltaSeconds: number): void;
  sitAt(position: Vector3, rotationY: number): void;
  stand(): void;
  setOutfitColor(color: Color3): void;
  setBounds(minX: number, maxX: number, minZ: number, maxZ: number): void;
  playUseGesture(gesture: UseGesture): void;
  isSeated(): boolean;
}

const colors = {
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
};

function material(scene: Scene, name: string, diffuse: Color3, emissive?: Color3): StandardMaterial {
  const result = new StandardMaterial(name, scene);
  result.diffuseColor = diffuse;
  result.specularColor = new Color3(0.06, 0.06, 0.06);
  if (emissive) result.emissiveColor = emissive;
  return result;
}

function box(
  scene: Scene,
  name: string,
  size: Vector3,
  position: Vector3,
  mat: StandardMaterial,
  parent?: TransformNode,
): Mesh {
  const mesh = MeshBuilder.CreateBox(name, {
    width: size.x,
    height: size.y,
    depth: size.z,
  }, scene);
  mesh.position.copyFrom(position);
  mesh.material = mat;
  mesh.parent = parent ?? null;
  mesh.receiveShadows = true;
  return mesh;
}

function cylinder(
  scene: Scene,
  name: string,
  diameter: number,
  height: number,
  position: Vector3,
  mat: StandardMaterial,
  tessellation = 16,
): Mesh {
  const mesh = MeshBuilder.CreateCylinder(name, { diameter, height, tessellation }, scene);
  mesh.position.copyFrom(position);
  mesh.material = mat;
  return mesh;
}

function addBlobShadow(scene: Scene, parent: TransformNode, radius: number): void {
  const shadow = MeshBuilder.CreateDisc(`${parent.name}-blob-shadow`, { radius, tessellation: 20 }, scene);
  shadow.rotation.x = Math.PI / 2;
  shadow.position.y = 0.015;
  shadow.parent = parent;
  const shadowMaterial = material(scene, `${parent.name}-shadow-mat`, new Color3(0.08, 0.05, 0.09));
  shadowMaterial.alpha = 0.16;
  shadow.material = shadowMaterial;
  shadow.isPickable = false;
}

function createCharacter(
  scene: Scene,
  name: string,
  position: Vector3,
  hoodieColor: Color3,
  scale = 1,
  movable = false,
): CharacterRig {
  const root = new TransformNode(name, scene);
  root.position.copyFrom(position);
  root.scaling.setAll(scale);
  addBlobShadow(scene, root, 0.52);

  const visualRoot = new TransformNode(`${name}-visual`, scene);
  visualRoot.parent = root;

  const skin = material(scene, `${name}-skin`, new Color3(0.58, 0.33, 0.21));
  const hair = material(scene, `${name}-hair`, new Color3(0.055, 0.035, 0.04));
  const hoodie = material(scene, `${name}-hoodie`, hoodieColor);
  const denim = material(scene, `${name}-denim`, new Color3(0.12, 0.31, 0.52));
  const white = material(scene, `${name}-white`, new Color3(0.96, 0.95, 0.91));
  const eye = material(scene, `${name}-eye`, colors.dark);
  const smile = material(scene, `${name}-smile`, new Color3(0.35, 0.08, 0.10));

  const body = MeshBuilder.CreateCapsule(`${name}-body`, { radius: 0.32, height: 1.1, tessellation: 14 }, scene);
  body.position.y = 0.95;
  body.material = hoodie;
  body.parent = visualRoot;

  const head = MeshBuilder.CreateSphere(`${name}-head`, { diameter: 0.88, segments: 18 }, scene);
  head.position.y = 1.73;
  head.scaling.z = 0.9;
  head.material = skin;
  head.parent = visualRoot;

  const hairCap = MeshBuilder.CreateSphere(`${name}-hair-cap`, { diameter: 0.91, segments: 14, slice: 0.58 }, scene);
  hairCap.position.set(0, 1.91, 0.02);
  hairCap.rotation.x = Math.PI;
  hairCap.material = hair;
  hairCap.parent = visualRoot;

  if (name === "khadija") {
    const headband = MeshBuilder.CreateTorus(`${name}-headband`, { diameter: 0.76, thickness: 0.07, tessellation: 20 }, scene);
    headband.position.set(0, 1.92, -0.03);
    headband.rotation.x = Math.PI / 2;
    headband.material = material(scene, `${name}-headband-mat`, colors.pink);
    headband.parent = visualRoot;
  }

  for (const x of [-0.18, 0.18]) {
    const eyeMesh = MeshBuilder.CreateSphere(`${name}-eye-${x}`, { diameter: 0.105, segments: 10 }, scene);
    eyeMesh.position.set(x, 1.76, -0.405);
    eyeMesh.material = eye;
    eyeMesh.parent = visualRoot;
  }

  const mouth = MeshBuilder.CreateBox(`${name}-mouth`, { width: 0.22, height: 0.035, depth: 0.035 }, scene);
  mouth.position.set(0, 1.57, -0.414);
  mouth.rotation.z = -0.08;
  mouth.material = smile;
  mouth.parent = visualRoot;
  mouth.isPickable = false;

  const leftLeg = new TransformNode(`${name}-left-leg-pivot`, scene);
  const rightLeg = new TransformNode(`${name}-right-leg-pivot`, scene);
  leftLeg.position.set(-0.17, 0.67, 0);
  rightLeg.position.set(0.17, 0.67, 0);
  leftLeg.parent = visualRoot;
  rightLeg.parent = visualRoot;

  for (const [legRoot, suffix] of [[leftLeg, "left"], [rightLeg, "right"]] as const) {
    const leg = MeshBuilder.CreateCapsule(`${name}-leg-${suffix}`, { radius: 0.12, height: 0.65, tessellation: 10 }, scene);
    leg.position.y = -0.25;
    leg.material = denim;
    leg.parent = legRoot;

    const shoe = MeshBuilder.CreateBox(`${name}-shoe-${suffix}`, { width: 0.27, height: 0.16, depth: 0.42 }, scene);
    shoe.position.set(0, -0.58, -0.08);
    shoe.material = white;
    shoe.parent = legRoot;
  }

  const leftArm = new TransformNode(`${name}-left-arm-pivot`, scene);
  const rightArm = new TransformNode(`${name}-right-arm-pivot`, scene);
  leftArm.position.set(-0.34, 1.18, 0);
  rightArm.position.set(0.34, 1.18, 0);
  leftArm.parent = visualRoot;
  rightArm.parent = visualRoot;

  for (const [armRoot, suffix] of [[leftArm, "left"], [rightArm, "right"]] as const) {
    const arm = MeshBuilder.CreateCapsule(`${name}-arm-${suffix}`, { radius: 0.105, height: 0.62, tessellation: 10 }, scene);
    arm.position.y = -0.23;
    arm.material = hoodie;
    arm.parent = armRoot;
  }

  const holdAnchor = new TransformNode(`${name}-hold-anchor`, scene);
  holdAnchor.position.set(0, -0.53, -0.17);
  holdAnchor.parent = rightArm;

  let target: Vector3 | null = null;
  let arrivalAction: (() => void) | null = null;
  let seated = false;
  let walkPhase = 0;
  let gestureActive = false;
  const speed = movable ? 2.15 : 0;

  let bounds = { minX: -5.25, maxX: 5.15, minZ: -3.35, maxZ: 3.45 };

  const clampPosition = (value: Vector3): Vector3 => new Vector3(
    Math.max(bounds.minX, Math.min(bounds.maxX, value.x)),
    0,
    Math.max(bounds.minZ, Math.min(bounds.maxZ, value.z)),
  );

  const animateWalk = (moving: boolean, deltaSeconds: number): void => {
    if (!moving) {
      if (!seated) {
        leftLeg.rotation.x *= 0.72;
        rightLeg.rotation.x *= 0.72;
      }
      if (!gestureActive) {
        leftArm.rotation.x *= 0.72;
        rightArm.rotation.x *= 0.72;
        leftArm.rotation.z *= 0.72;
        rightArm.rotation.z *= 0.72;
      }
      visualRoot.position.y *= 0.72;
      return;
    }

    walkPhase += deltaSeconds * 9;
    const swing = Math.sin(walkPhase) * 0.48;
    leftLeg.rotation.x = swing;
    rightLeg.rotation.x = -swing;
    if (!gestureActive) {
      leftArm.rotation.x = -swing * 0.65;
      rightArm.rotation.x = swing * 0.65;
      leftArm.rotation.z *= 0.72;
      rightArm.rotation.z *= 0.72;
    }
    visualRoot.position.y = Math.abs(Math.sin(walkPhase * 2)) * 0.035;
  };

  const stand = (): void => {
    if (!seated) return;
    seated = false;
    visualRoot.position.y = 0;
    leftLeg.rotation.x = 0;
    rightLeg.rotation.x = 0;
    root.position.y = 0;
  };

  return {
    root,
    holdAnchor,
    setTarget(nextTarget: Vector3, onArrive?: () => void): void {
      if (!movable) return;
      stand();
      target = clampPosition(nextTarget);
      arrivalAction = onArrive ?? null;
    },
    moveBy(direction: Vector3, deltaSeconds: number): void {
      if (!movable || direction.lengthSquared() < 0.0001) return;
      stand();
      target = null;
      arrivalAction = null;
      const normalized = direction.normalize();
      const next = clampPosition(root.position.add(normalized.scale(speed * deltaSeconds)));
      root.position.copyFrom(next);
      root.rotation.y = Math.atan2(-normalized.x, -normalized.z);
      animateWalk(true, deltaSeconds);
    },
    sitAt(seatPosition: Vector3, rotationY: number): void {
      target = null;
      arrivalAction = null;
      seated = true;
      root.position.copyFrom(seatPosition);
      root.rotation.y = rotationY;
      root.position.y = 0.43;
      visualRoot.position.y = -0.12;
      leftLeg.rotation.x = -1.28;
      rightLeg.rotation.x = -1.28;
      leftArm.rotation.x = -0.15;
      rightArm.rotation.x = -0.15;
    },
    stand,
    setOutfitColor(color: Color3): void {
      hoodie.diffuseColor = color;
    },
    setBounds(minX: number, maxX: number, minZ: number, maxZ: number): void {
      bounds = { minX, maxX, minZ, maxZ };
      root.position.copyFrom(clampPosition(root.position));
    },
    playUseGesture(gesture: UseGesture): void {
      if (gestureActive) return;
      gestureActive = true;
      scene.stopAnimation(leftArm);
      scene.stopAnimation(rightArm);

      type ArmAxis = "x" | "z";
      interface ArmPose {
        node: TransformNode;
        axis: ArmAxis;
        target: number;
      }

      const poses: ArmPose[] = gesture === "hug"
        ? [
            { node: leftArm, axis: "x", target: 1.12 },
            { node: rightArm, axis: "x", target: 1.12 },
            { node: leftArm, axis: "z", target: 0.52 },
            { node: rightArm, axis: "z", target: -0.52 },
          ]
        : gesture === "read"
          ? [
              { node: leftArm, axis: "x", target: 0.72 },
              { node: rightArm, axis: "x", target: 0.72 },
              { node: leftArm, axis: "z", target: 0.24 },
              { node: rightArm, axis: "z", target: -0.24 },
            ]
          : [
              { node: rightArm, axis: "x", target: gesture === "drink" ? 1.55 : 1.38 },
              { node: rightArm, axis: "z", target: -0.12 },
            ];

      const startingValues = poses.map(({ node, axis }) => (axis === "x" ? node.rotation.x : node.rotation.z));
      const animatePose = (returning: boolean): void => {
        poses.forEach((pose, index) => {
          const from = returning ? pose.target : startingValues[index];
          const to = returning ? startingValues[index] : pose.target;
          Animation.CreateAndStartAnimation(
            `${name}-${gesture}-${returning ? "return" : "raise"}-${index}`,
            pose.node,
            `rotation.${pose.axis}`,
            30,
            returning ? 10 : 9,
            from,
            to,
            Animation.ANIMATIONLOOPMODE_CONSTANT,
            undefined,
            index === 0
              ? () => {
                  if (returning) {
                    gestureActive = false;
                  } else {
                    window.setTimeout(() => animatePose(true), gesture === "hug" ? 320 : 220);
                  }
                }
              : undefined,
          );
        });
      };

      animatePose(false);
    },
    isSeated(): boolean {
      return seated;
    },
    update(deltaSeconds: number): void {
      if (!movable || !target) {
        animateWalk(false, deltaSeconds);
        return;
      }

      const direction = target.subtract(root.position);
      direction.y = 0;
      const distance = direction.length();
      if (distance < 0.06) {
        root.position.copyFrom(target);
        target = null;
        saveKhadijaPosition(root.position);
        animateWalk(false, deltaSeconds);
        const callback = arrivalAction;
        arrivalAction = null;
        callback?.();
        return;
      }

      const normalized = direction.scale(1 / distance);
      const step = Math.min(distance, speed * deltaSeconds);
      root.position.addInPlace(normalized.scale(step));
      root.rotation.y = Math.atan2(-normalized.x, -normalized.z);
      animateWalk(true, deltaSeconds);
    },
  };
}

function animateRotation(scene: Scene, mesh: TransformNode, toY: number): void {
  Animation.CreateAndStartAnimation(
    `${mesh.name}-toggle`,
    mesh,
    "rotation.y",
    30,
    10,
    mesh.rotation.y,
    toY,
    Animation.ANIMATIONLOOPMODE_CONSTANT,
    undefined,
    () => scene.stopAnimation(mesh),
  );
}

function createSnapMarker(scene: Scene, name: string, position: Vector3, markerMaterial: StandardMaterial): Mesh {
  const marker = MeshBuilder.CreateTorus(name, { diameter: 0.7, thickness: 0.07, tessellation: 20 }, scene);
  marker.position.copyFrom(position);
  marker.position.y = Math.max(0.04, position.y - 0.18);
  marker.material = markerMaterial;
  marker.isPickable = false;
  marker.setEnabled(false);
  return marker;
}

function makeDraggable(
  mesh: Mesh,
  floorY: number,
  targets: SnapTarget[],
  onAction: (message: string) => void,
): void {
  const drag = new PointerDragBehavior({ dragPlaneNormal: Vector3.Up() });
  drag.useObjectOrientationForDragging = false;
  drag.updateDragPlane = false;
  mesh.addBehavior(drag);

  let dragStartPosition = mesh.position.clone();
  let dragActivated = false;

  drag.onDragStartObservable.add(() => {
    dragStartPosition = mesh.position.clone();
    dragActivated = false;
    mesh.metadata = { ...mesh.metadata, dragging: true, dragMoved: false };
  });

  drag.onDragObservable.add(() => {
    const horizontalDistance = Math.hypot(
      mesh.position.x - dragStartPosition.x,
      mesh.position.z - dragStartPosition.z,
    );

    if (!dragActivated && horizontalDistance < 0.08) return;

    if (!dragActivated) {
      dragActivated = true;
      mesh.metadata = { ...mesh.metadata, dragMoved: true };
      for (const target of targets) target.marker.setEnabled(true);
      onAction(`Drag the ${mesh.name.replace("draggable-", "")} to a glowing spot!`);
    }

    mesh.position.y = floorY;
    mesh.position.x = Math.max(-5.4, Math.min(71.4, mesh.position.x));
    mesh.position.z = Math.max(-3.55, Math.min(3.55, mesh.position.z));

    let nearest: SnapTarget | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const target of targets) {
      const dx = target.position.x - mesh.position.x;
      const dz = target.position.z - mesh.position.z;
      const distance = Math.hypot(dx, dz);
      target.marker.scaling.setAll(1);
      if (distance < nearestDistance) {
        nearest = target;
        nearestDistance = distance;
      }
    }
    if (nearest && nearestDistance < 1.15) nearest.marker.scaling.setAll(1.35);
  });

  drag.onDragEndObservable.add(() => {
    mesh.metadata = { ...mesh.metadata, dragging: false };

    if (!dragActivated) {
      mesh.position.copyFrom(dragStartPosition);
      mesh.metadata = { ...mesh.metadata, dragMoved: false };
      return;
    }

    window.setTimeout(() => {
      mesh.metadata = { ...mesh.metadata, dragMoved: false };
    }, 220);

    let nearest: SnapTarget | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const target of targets) {
      target.marker.setEnabled(false);
      target.marker.scaling.setAll(1);
      const dx = target.position.x - mesh.position.x;
      const dz = target.position.z - mesh.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance < nearestDistance) {
        nearest = target;
        nearestDistance = distance;
      }
    }

    if (nearest && nearestDistance < 1.15) {
      mesh.position.copyFrom(nearest.position);
      onAction(`Lovely! The ${mesh.name.replace("draggable-", "")} is on the ${nearest.name}.`);
    } else {
      mesh.position.y = floorY;
      onAction(`The ${mesh.name.replace("draggable-", "")} is ready to play with.`);
    }
    saveProp(mesh);
  });
}

export function createPrototypeRoom(engine: Engine, options: RoomOptions): PrototypeRoom {
  const save = loadSave();
  const bedroomOffsetX = 22;
  const streetOffsetX = 44;
  const cafeOffsetX = 66;
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
  };
  let activeRoom: RoomId = save.activeRoom;

  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.78, 0.87, 0.91, 1);
  scene.ambientColor = new Color3(0.38, 0.38, 0.38);

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
  camera.attachControl(engine.getRenderingCanvas(), true);
  camera.inputs.removeByType("ArcRotateCameraPointersInput");

  const updateOrtho = (): void => {
    const aspect = engine.getRenderWidth() / Math.max(engine.getRenderHeight(), 1);
    const vertical = 5.2;
    camera.orthoTop = vertical;
    camera.orthoBottom = -vertical;
    camera.orthoLeft = -vertical * aspect;
    camera.orthoRight = vertical * aspect;
  };
  updateOrtho();
  engine.onResizeObservable.add(updateOrtho);

  const hemi = new HemisphericLight("soft-fill", new Vector3(0, 1, -0.4), scene);
  hemi.intensity = 0.9;
  hemi.groundColor = new Color3(0.42, 0.31, 0.28);

  const sun = new DirectionalLight("window-sun", new Vector3(-0.45, -1, 0.55), scene);
  sun.position.set(4, 8, -6);
  sun.intensity = 0.42;

  const floorMat = material(scene, "floor-mat", colors.floor);
  const floorLight = material(scene, "floor-light", new Color3(0.73, 0.48, 0.29));
  const lavender = material(scene, "lavender-wall", colors.wallLavender);
  const creamWall = material(scene, "cream-wall", colors.wallCream);
  const white = material(scene, "white", colors.cream);
  const teal = material(scene, "teal", colors.teal);
  const mint = material(scene, "mint", colors.mint);
  const wood = material(scene, "wood", new Color3(0.49, 0.27, 0.13));
  const dark = material(scene, "dark", colors.dark);
  const pink = material(scene, "pink", colors.pink);
  const yellow = material(scene, "yellow", colors.yellow);
  const green = material(scene, "green", new Color3(0.18, 0.48, 0.22));
  const sky = material(scene, "sky", colors.sky, new Color3(0.12, 0.18, 0.2));
  const markerMaterial = material(scene, "snap-marker", colors.yellow, new Color3(0.25, 0.13, 0.01));
  markerMaterial.alpha = 0.75;
  const road = material(scene, "road", new Color3(0.34, 0.37, 0.42));
  const sidewalk = material(scene, "sidewalk", new Color3(0.72, 0.72, 0.68));
  const grass = material(scene, "grass", new Color3(0.30, 0.58, 0.28));
  const peach = material(scene, "peach", new Color3(0.94, 0.55, 0.44));
  const cafeBlue = material(scene, "cafe-blue", new Color3(0.27, 0.61, 0.72));
  const glass = material(scene, "glass", new Color3(0.58, 0.82, 0.90), new Color3(0.06, 0.12, 0.14));
  glass.alpha = 0.48;

  const detailMeshes: Mesh[] = [];

  const floor = box(scene, "floor", new Vector3(12, 0.18, 8), new Vector3(0, -0.1, 0), floorMat);
  floor.metadata = { walkable: true, room: "home" satisfies RoomId };
  box(scene, "back-wall", new Vector3(12, 4.2, 0.2), new Vector3(0, 2.0, 4), creamWall);
  box(scene, "left-wall", new Vector3(0.2, 4.2, 8), new Vector3(-6, 2.0, 0), lavender);
  box(scene, "kitchen-divider", new Vector3(0.1, 3.3, 3.5), new Vector3(1.2, 1.55, 2.25), white);

  // Low-cost floor planks provide visual depth and are disabled on low/adaptive presets.
  for (let z = -3.5; z <= 3.5; z += 0.5) {
    const plank = box(scene, `floor-plank-${z}`, new Vector3(11.8, 0.012, 0.025), new Vector3(0, 0.003, z), floorLight);
    plank.isPickable = false;
    detailMeshes.push(plank);
  }

  // Window and curtains.
  box(scene, "window-view", new Vector3(3.15, 1.75, 0.08), new Vector3(-3.05, 2.55, 3.86), sky);
  box(scene, "window-frame-top", new Vector3(3.35, 0.12, 0.12), new Vector3(-3.05, 3.48, 3.75), white);
  box(scene, "window-frame-bottom", new Vector3(3.35, 0.12, 0.12), new Vector3(-3.05, 1.62, 3.75), white);
  box(scene, "window-frame-left", new Vector3(0.12, 1.98, 0.12), new Vector3(-4.72, 2.55, 3.75), white);
  box(scene, "window-frame-right", new Vector3(0.12, 1.98, 0.12), new Vector3(-1.38, 2.55, 3.75), white);
  box(scene, "window-frame-middle", new Vector3(0.09, 1.85, 0.1), new Vector3(-3.05, 2.55, 3.72), white);
  const curtainLeft = box(scene, "curtain-left", new Vector3(0.48, 2.15, 0.2), new Vector3(-4.58, 2.52, 3.55), yellow);
  const curtainRight = box(scene, "curtain-right", new Vector3(0.48, 2.15, 0.2), new Vector3(-1.52, 2.52, 3.55), yellow);
  curtainLeft.scaling.x = 0.75;
  curtainRight.scaling.x = 0.75;

  // Wall art.
  box(scene, "art-frame", new Vector3(1.15, 1.25, 0.12), new Vector3(-5.83, 2.45, 1.0), wood);
  box(scene, "art-canvas", new Vector3(0.92, 1.02, 0.08), new Vector3(-5.75, 2.45, 1.0), pink);
  const artFlower = MeshBuilder.CreateDisc("art-flower", { radius: 0.25, tessellation: 16 }, scene);
  artFlower.position.set(-5.69, 2.45, 0.94);
  artFlower.rotation.y = Math.PI / 2;
  artFlower.material = yellow;
  artFlower.isPickable = false;

  // Living-room rug and sofa.
  const rug = box(scene, "rug", new Vector3(5.1, 0.04, 3.2), new Vector3(-2.6, 0.02, -0.4), teal);
  rug.metadata = { walkable: true, room: "home" satisfies RoomId };
  const rugInset = box(scene, "rug-inset", new Vector3(4.5, 0.018, 2.62), new Vector3(-2.6, 0.045, -0.4), mint);
  rugInset.isPickable = false;
  detailMeshes.push(rugInset);

  box(scene, "sofa-seat", new Vector3(3.25, 0.52, 1.25), new Vector3(-3.25, 0.53, 0.35), teal);
  box(scene, "sofa-back", new Vector3(3.25, 1.2, 0.38), new Vector3(-3.25, 1.12, 0.86), teal);
  box(scene, "sofa-arm-l", new Vector3(0.38, 0.92, 1.3), new Vector3(-4.88, 0.72, 0.35), teal);
  box(scene, "sofa-arm-r", new Vector3(0.38, 0.92, 1.3), new Vector3(-1.62, 0.72, 0.35), teal);
  const cushionOne = box(scene, "cushion-one", new Vector3(0.72, 0.58, 0.22), new Vector3(-4.15, 1.12, 0.54), yellow);
  cushionOne.rotation.z = 0.08;
  const cushionTwo = box(scene, "cushion-two", new Vector3(0.72, 0.58, 0.22), new Vector3(-2.25, 1.12, 0.54), pink);
  cushionTwo.rotation.z = -0.08;
  box(scene, "coffee-table", new Vector3(2.3, 0.15, 1.25), new Vector3(-2.6, 0.68, -1.8), wood);
  for (const x of [-3.45, -1.75]) {
    for (const z of [-2.2, -1.4]) {
      box(scene, `table-leg-${x}-${z}`, new Vector3(0.12, 0.65, 0.12), new Vector3(x, 0.34, z), white);
    }
  }
  box(scene, "tv-console", new Vector3(2.25, 0.58, 0.58), new Vector3(-4.55, 0.32, -2.4), wood);
  box(scene, "tv", new Vector3(1.85, 1.15, 0.12), new Vector3(-4.55, 1.16, -2.65), dark);
  const tvScreen = box(scene, "tv-screen", new Vector3(1.62, 0.92, 0.03), new Vector3(-4.55, 1.16, -2.73), sky);
  tvScreen.isPickable = false;

  // Kitchen floor zone.
  const kitchenFloor = box(scene, "kitchen-floor", new Vector3(4.65, 0.025, 3.95), new Vector3(3.65, 0.012, 2), white);
  kitchenFloor.metadata = { walkable: true, room: "home" satisfies RoomId };
  for (let x = 1.55; x <= 5.75; x += 0.7) {
    const line = box(scene, `tile-line-x-${x}`, new Vector3(0.018, 0.02, 3.8), new Vector3(x, 0.034, 2), lavender);
    line.isPickable = false;
    detailMeshes.push(line);
  }
  for (let z = 0.15; z <= 3.65; z += 0.7) {
    const line = box(scene, `tile-line-z-${z}`, new Vector3(4.5, 0.02, 0.018), new Vector3(3.65, 0.034, z), lavender);
    line.isPickable = false;
    detailMeshes.push(line);
  }

  // Kitchen cabinets, fridge and island.
  box(scene, "fridge", new Vector3(1.45, 2.9, 1.15), new Vector3(2.3, 1.43, 2.95), mint);
  box(scene, "fridge-divider", new Vector3(1.28, 0.05, 0.03), new Vector3(2.3, 1.35, 2.36), white);
  box(scene, "fridge-handle-top", new Vector3(0.08, 0.62, 0.08), new Vector3(2.82, 2.15, 2.34), white);
  box(scene, "fridge-handle-bottom", new Vector3(0.08, 0.62, 0.08), new Vector3(2.82, 0.72, 2.34), white);
  const magnetOne = cylinder(scene, "fridge-magnet-one", 0.18, 0.04, new Vector3(1.92, 2.2, 2.35), pink, 12);
  magnetOne.rotation.x = Math.PI / 2;
  const magnetTwo = cylinder(scene, "fridge-magnet-two", 0.16, 0.04, new Vector3(2.28, 1.9, 2.35), yellow, 12);
  magnetTwo.rotation.x = Math.PI / 2;

  box(scene, "counter", new Vector3(4.1, 1.0, 1.1), new Vector3(4.15, 0.5, 3.2), mint);
  box(scene, "counter-top", new Vector3(4.3, 0.14, 1.28), new Vector3(4.15, 1.07, 3.2), white);
  box(scene, "backsplash", new Vector3(4.3, 0.68, 0.08), new Vector3(4.15, 1.42, 3.77), teal);
  for (const x of [3.0, 3.75, 4.5, 5.25]) {
    box(scene, `cabinet-door-${x}`, new Vector3(0.63, 0.72, 0.04), new Vector3(x, 0.55, 2.62), mint);
    box(scene, `cabinet-handle-${x}`, new Vector3(0.22, 0.05, 0.06), new Vector3(x, 0.62, 2.57), dark);
  }
  box(scene, "island", new Vector3(3.1, 1.05, 1.45), new Vector3(3.5, 0.52, 0.6), mint);
  box(scene, "island-top", new Vector3(3.3, 0.16, 1.62), new Vector3(3.5, 1.1, 0.6), white);

  const sink = MeshBuilder.CreateCylinder("sink", { diameter: 0.75, height: 0.07, tessellation: 20 }, scene);
  sink.position.set(4.0, 1.17, 3.18);
  sink.material = dark;
  const faucet = MeshBuilder.CreateTorus("faucet", { diameter: 0.46, thickness: 0.07, tessellation: 18 }, scene);
  faucet.position.set(4.0, 1.48, 3.44);
  faucet.rotation.x = Math.PI / 2;
  faucet.material = white;

  for (const x of [2.65, 3.5, 4.35]) {
    cylinder(scene, `stool-${x}`, 0.52, 0.14, new Vector3(x, 0.68, -0.65), wood, 18);
    box(scene, `stool-leg-${x}`, new Vector3(0.12, 0.62, 0.12), new Vector3(x, 0.32, -0.65), mint);
  }

  // Cupboard with a pivoted interactive door.
  const cupboard = new TransformNode("cupboard", scene);
  cupboard.position.set(4.85, 1.9, 3.65);
  box(scene, "cupboard-body", new Vector3(1.75, 1.55, 0.5), Vector3.Zero(), wood, cupboard);
  box(scene, "cupboard-shelf", new Vector3(1.55, 0.07, 0.46), new Vector3(0, 0, -0.28), white, cupboard);
  for (const x of [-0.46, 0, 0.46]) {
    const jar = MeshBuilder.CreateCylinder(`jar-${x}`, { diameter: 0.25, height: 0.38, tessellation: 12 }, scene);
    jar.position.set(x, 0.33, -0.34);
    jar.material = x === 0 ? yellow : pink;
    jar.parent = cupboard;
    jar.isPickable = false;
  }

  const doorPivot = new TransformNode("cupboard-door-pivot", scene);
  doorPivot.parent = cupboard;
  doorPivot.position.set(-0.88, 0, -0.29);
  const cupboardDoor = box(
    scene,
    "cupboard-door",
    new Vector3(0.87, 1.45, 0.08),
    new Vector3(0.435, 0, 0),
    mint,
    doorPivot,
  );
  let cupboardOpen = save.cupboardOpen;
  let lampOn = save.lampOn;
  let bedroomLampOn = save.bedroomLampOn;
  let enhancedLighting = false;

  const applyActiveRoomLighting = (): void => {
    if (activeRoom === "street") {
      hemi.intensity = enhancedLighting ? 0.96 : 1.02;
      sun.intensity = enhancedLighting ? 0.72 : 0.52;
      scene.clearColor = new Color4(0.66, 0.84, 0.94, 1);
      return;
    }

    if (activeRoom === "cafe") {
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

  // Bed and a transparent hotspot used for the relax interaction.
  box(scene, "bed-frame", new Vector3(3.25, 0.48, 2.15), bedroomPosition(-3.55, 0.34, 0.55), white);
  box(scene, "bed-mattress", new Vector3(3.05, 0.38, 1.95), bedroomPosition(-3.55, 0.72, 0.52), creamWall);
  box(scene, "bed-blanket", new Vector3(1.95, 0.18, 1.88), bedroomPosition(-3.0, 0.98, 0.5), lavender);
  box(scene, "bed-headboard", new Vector3(3.25, 1.55, 0.28), bedroomPosition(-3.55, 1.2, 1.52), pink);
  box(scene, "bed-pillow", new Vector3(0.95, 0.28, 0.68), bedroomPosition(-4.35, 1.02, 0.9), yellow);
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
  box(scene, "bedroom-desk-top", new Vector3(2.2, 0.16, 0.9), bedroomPosition(3.8, 1.05, 2.85), wood);
  for (const x of [3.0, 4.6]) {
    box(scene, `bedroom-desk-leg-${x}`, new Vector3(0.14, 1.0, 0.14), bedroomPosition(x, 0.52, 2.85), white);
  }
  box(scene, "bedroom-chair-seat", new Vector3(0.85, 0.18, 0.75), bedroomPosition(3.8, 0.58, 1.95), teal);
  box(scene, "bedroom-chair-back", new Vector3(0.85, 0.9, 0.18), bedroomPosition(3.8, 1.05, 2.25), teal);
  box(scene, "bedroom-notebook", new Vector3(0.72, 0.08, 0.52), bedroomPosition(3.55, 1.17, 2.8), pink);

  box(scene, "bedroom-wardrobe", new Vector3(1.85, 2.85, 0.72), bedroomPosition(4.85, 1.42, -2.72), wood);
  box(scene, "bedroom-wardrobe-door-left", new Vector3(0.82, 2.55, 0.08), bedroomPosition(4.4, 1.42, -3.12), mint);
  box(scene, "bedroom-wardrobe-door-right", new Vector3(0.82, 2.55, 0.08), bedroomPosition(5.3, 1.42, -3.12), mint);
  box(scene, "bedroom-mirror-frame", new Vector3(1.35, 2.35, 0.12), bedroomPosition(2.45, 1.55, 3.82), wood);
  const mirror = box(scene, "bedroom-mirror", new Vector3(1.12, 2.08, 0.05), bedroomPosition(2.45, 1.55, 3.72), sky);
  mirror.isPickable = false;

  box(scene, "toy-shelf", new Vector3(2.35, 1.35, 0.72), bedroomPosition(1.0, 0.68, 3.15), wood);
  box(scene, "toy-shelf-divider", new Vector3(0.08, 1.1, 0.62), bedroomPosition(1.0, 0.68, 2.75), white);
  const toyBall = MeshBuilder.CreateSphere("bedroom-toy-ball", { diameter: 0.46, segments: 10 }, scene);
  toyBall.position.copyFrom(bedroomPosition(0.45, 0.42, 2.72));
  toyBall.material = yellow;
  const toyBlock = box(scene, "bedroom-toy-block", new Vector3(0.48, 0.48, 0.48), bedroomPosition(1.55, 0.42, 2.72), teal);
  toyBlock.rotation.y = 0.25;

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
    applyActiveRoomLighting();
    saveRoomState({ cupboardOpen, lampOn, bedroomLampOn });
    options.onAction(bedroomLampOn ? "Khadija's bedroom is glowing!" : "The bedroom lamp is off for now.");
  }));

  // WORLD.2 neighborhood street. The road, garden and storefronts stay deliberately
  // mid-poly so the active-mesh budget remains suitable for older Intel integrated graphics.
  const streetGround = box(
    scene,
    "street-ground",
    new Vector3(12, 0.18, 8),
    streetPosition(0, -0.1, 0),
    grass,
  );
  streetGround.metadata = { walkable: true, room: "street" satisfies RoomId };
  const streetRoad = box(
    scene,
    "street-road",
    new Vector3(12, 0.05, 2.65),
    streetPosition(0, 0.01, -1.85),
    road,
  );
  streetRoad.metadata = { walkable: true, room: "street" satisfies RoomId };
  const streetSidewalk = box(
    scene,
    "street-sidewalk",
    new Vector3(12, 0.08, 1.35),
    streetPosition(0, 0.05, 0.15),
    sidewalk,
  );
  streetSidewalk.metadata = { walkable: true, room: "street" satisfies RoomId };
  for (const x of [-4.8, -3.2, -1.6, 0, 1.6, 3.2, 4.8]) {
    const roadMark = box(
      scene,
      `street-road-mark-${x}`,
      new Vector3(0.85, 0.02, 0.08),
      streetPosition(x, 0.05, -1.85),
      yellow,
    );
    roadMark.isPickable = false;
    detailMeshes.push(roadMark);
  }

  // Pastel building fronts give the hub clear destinations without loading full interiors.
  box(scene, "street-home-front", new Vector3(4.4, 3.45, 0.42), streetPosition(-3.55, 1.65, 3.55), peach);
  box(scene, "street-home-roof", new Vector3(4.75, 0.38, 0.72), streetPosition(-3.55, 3.45, 3.5), pink);
  box(scene, "street-home-window", new Vector3(1.35, 1.15, 0.08), streetPosition(-4.55, 2.05, 3.3), sky);
  box(scene, "street-cafe-front", new Vector3(4.4, 3.45, 0.42), streetPosition(3.55, 1.65, 3.55), creamWall);
  box(scene, "street-cafe-awning", new Vector3(4.4, 0.45, 0.85), streetPosition(3.55, 2.85, 3.12), cafeBlue);
  for (const x of [1.75, 2.6, 3.45, 4.3, 5.15]) {
    const stripe = box(scene, `street-awning-stripe-${x}`, new Vector3(0.36, 0.47, 0.88), streetPosition(x, 2.87, 3.1), white);
    stripe.isPickable = false;
    detailMeshes.push(stripe);
  }
  box(scene, "street-cafe-window", new Vector3(1.55, 1.2, 0.08), streetPosition(4.45, 1.85, 3.3), glass);

  // Street tree, flowers, mailbox, bench and scooter.
  box(scene, "street-tree-trunk", new Vector3(0.42, 2.1, 0.42), streetPosition(-0.25, 1.05, 2.3), wood);
  for (const [index, offset] of [
    new Vector3(-0.42, 2.3, 2.28),
    new Vector3(0.38, 2.35, 2.25),
    new Vector3(0, 2.75, 2.28),
  ].entries()) {
    const crown = MeshBuilder.CreateSphere(`street-tree-crown-${index}`, { diameter: 1.55, segments: 10 }, scene);
    crown.position.copyFrom(streetPosition(offset.x, offset.y, offset.z));
    crown.material = green;
    crown.isPickable = false;
  }
  box(scene, "street-bench-seat", new Vector3(2.2, 0.2, 0.72), streetPosition(-2.1, 0.6, 1.15), wood);
  box(scene, "street-bench-back", new Vector3(2.2, 0.85, 0.16), streetPosition(-2.1, 1.0, 1.48), wood);
  for (const x of [-2.85, -1.35]) {
    box(scene, `street-bench-leg-${x}`, new Vector3(0.15, 0.62, 0.15), streetPosition(x, 0.3, 1.15), dark);
  }
  const streetBenchMaterial = material(scene, "street-bench-hotspot-mat", colors.pink);
  streetBenchMaterial.alpha = 0.025;
  const streetBenchHotspot = box(
    scene,
    "street-bench-hotspot",
    new Vector3(1.9, 0.28, 0.62),
    streetPosition(-2.1, 0.78, 1.12),
    streetBenchMaterial,
  );
  box(scene, "street-mailbox-post", new Vector3(0.12, 1.15, 0.12), streetPosition(-5.1, 0.57, 0.75), wood);
  box(scene, "street-mailbox", new Vector3(0.75, 0.52, 0.48), streetPosition(-5.1, 1.2, 0.75), teal);
  box(scene, "street-mailbox-flag", new Vector3(0.08, 0.45, 0.08), streetPosition(-4.68, 1.45, 0.75), pink);

  const scooterRoot = new TransformNode("street-scooter", scene);
  scooterRoot.position.copyFrom(streetPosition(1.0, 0, -0.15));
  const scooterDeck = box(scene, "street-scooter-deck", new Vector3(0.95, 0.1, 0.28), new Vector3(0, 0.2, 0), pink, scooterRoot);
  scooterDeck.isPickable = false;
  box(scene, "street-scooter-stem", new Vector3(0.1, 1.1, 0.1), new Vector3(0.36, 0.72, 0), teal, scooterRoot).isPickable = false;
  box(scene, "street-scooter-handle", new Vector3(0.55, 0.08, 0.08), new Vector3(0.36, 1.28, 0), teal, scooterRoot).isPickable = false;
  for (const x of [-0.34, 0.34]) {
    const wheel = MeshBuilder.CreateCylinder(`street-scooter-wheel-${x}`, { diameter: 0.32, height: 0.12, tessellation: 14 }, scene);
    wheel.position.set(x, 0.16, 0);
    wheel.rotation.x = Math.PI / 2;
    wheel.material = dark;
    wheel.parent = scooterRoot;
    wheel.isPickable = false;
  }
  const scooterHotspotMaterial = material(scene, "scooter-hotspot-mat", colors.yellow);
  scooterHotspotMaterial.alpha = 0.025;
  const streetScooterHotspot = box(
    scene,
    "street-scooter-hotspot",
    new Vector3(1.25, 1.5, 0.8),
    streetPosition(1.0, 0.75, -0.15),
    scooterHotspotMaterial,
  );

  // WORLD.2 Sunny Café interior.
  const cafeFloor = box(
    scene,
    "cafe-floor",
    new Vector3(12, 0.18, 8),
    cafePosition(0, -0.1, 0),
    floorMat,
  );
  cafeFloor.metadata = { walkable: true, room: "cafe" satisfies RoomId };
  box(scene, "cafe-back-wall", new Vector3(12, 4.2, 0.2), cafePosition(0, 2, 4), creamWall);
  box(scene, "cafe-left-wall", new Vector3(0.2, 4.2, 8), cafePosition(-6, 2, 0), mint);
  const cafeRug = box(scene, "cafe-rug", new Vector3(4.2, 0.04, 2.6), cafePosition(-2.6, 0.02, -0.5), peach);
  cafeRug.metadata = { walkable: true, room: "cafe" satisfies RoomId };

  box(scene, "cafe-window-view", new Vector3(2.8, 1.75, 0.08), cafePosition(-3.45, 2.55, 3.86), sky);
  box(scene, "cafe-window-frame", new Vector3(3.15, 2.05, 0.12), cafePosition(-3.45, 2.55, 3.74), white);
  box(scene, "cafe-window-glass", new Vector3(2.75, 1.65, 0.04), cafePosition(-3.45, 2.55, 3.66), glass);

  box(scene, "cafe-counter", new Vector3(4.25, 1.15, 1.2), cafePosition(3.4, 0.57, 1.95), mint);
  box(scene, "cafe-counter-top", new Vector3(4.5, 0.16, 1.4), cafePosition(3.4, 1.2, 1.95), white);
  box(scene, "cafe-back-counter", new Vector3(3.7, 0.9, 0.75), cafePosition(3.5, 0.45, 3.35), cafeBlue);
  box(scene, "cafe-menu-board", new Vector3(2.3, 1.35, 0.1), cafePosition(2.5, 2.65, 3.8), dark);
  for (let y = 2.35; y <= 2.95; y += 0.3) {
    const menuLine = box(scene, `cafe-menu-line-${y}`, new Vector3(1.65, 0.055, 0.04), cafePosition(2.5, y, 3.72), white);
    menuLine.isPickable = false;
    detailMeshes.push(menuLine);
  }

  // Lightweight pastry case with two playable food props.
  box(scene, "cafe-pastry-base", new Vector3(1.75, 0.75, 1.05), cafePosition(4.7, 0.48, 0.55), wood);
  box(scene, "cafe-pastry-glass", new Vector3(1.75, 1.15, 1.05), cafePosition(4.7, 1.35, 0.55), glass);
  const pastryHotspotMaterial = material(scene, "pastry-hotspot-mat", colors.pink);
  pastryHotspotMaterial.alpha = 0.025;
  const pastryDisplayHotspot = box(
    scene,
    "cafe-pastry-hotspot",
    new Vector3(1.9, 1.7, 1.2),
    cafePosition(4.7, 1.2, 0.55),
    pastryHotspotMaterial,
  );

  const cupcake = MeshBuilder.CreateCylinder(
    "draggable-cupcake",
    { diameterTop: 0.38, diameterBottom: 0.46, height: 0.36, tessellation: 14 },
    scene,
  );
  cupcake.position.copyFrom(cafePosition(4.45, 1.12, 0.48));
  cupcake.material = yellow;
  const frosting = MeshBuilder.CreateSphere("cupcake-frosting", { diameter: 0.48, segments: 10 }, scene);
  frosting.position.set(0, 0.26, 0);
  frosting.scaling.y = 0.75;
  frosting.material = pink;
  frosting.parent = cupcake;
  frosting.isPickable = false;

  const sandwich = box(
    scene,
    "draggable-sandwich",
    new Vector3(0.68, 0.34, 0.55),
    cafePosition(4.95, 1.12, 0.5),
    yellow,
  );
  const sandwichFilling = box(
    scene,
    "sandwich-filling",
    new Vector3(0.62, 0.1, 0.52),
    new Vector3(0, 0, 0),
    green,
    sandwich,
  );
  sandwichFilling.isPickable = false;

  // Café tables and seating.
  for (const [index, x] of [-3.5, -1.1].entries()) {
    cylinder(scene, `cafe-table-${index}`, 1.3, 0.16, cafePosition(x, 0.9, 0.95), wood, 20);
    box(scene, `cafe-table-leg-${index}`, new Vector3(0.16, 0.85, 0.16), cafePosition(x, 0.43, 0.95), white);
    for (const z of [0.0, 1.9]) {
      cylinder(scene, `cafe-chair-seat-${index}-${z}`, 0.68, 0.16, cafePosition(x, 0.55, z), cafeBlue, 18);
      box(scene, `cafe-chair-leg-${index}-${z}`, new Vector3(0.12, 0.55, 0.12), cafePosition(x, 0.28, z), dark);
    }
  }
  const cafeSeatMaterial = material(scene, "cafe-seat-hotspot-mat", colors.pink);
  cafeSeatMaterial.alpha = 0.025;
  const cafeSeatHotspot = box(
    scene,
    "cafe-seat-hotspot",
    new Vector3(0.85, 0.5, 0.85),
    cafePosition(-3.5, 0.72, 0),
    cafeSeatMaterial,
  );

  // Coffee machine and refill interaction.
  box(scene, "cafe-coffee-machine", new Vector3(1.25, 1.15, 0.75), cafePosition(2.1, 1.85, 3.28), dark);
  box(scene, "cafe-coffee-screen", new Vector3(0.55, 0.32, 0.04), cafePosition(2.1, 2.05, 2.88), sky);
  const drinkHotspotMaterial = material(scene, "drink-hotspot-mat", colors.teal);
  drinkHotspotMaterial.alpha = 0.025;
  const cafeDrinkHotspot = box(
    scene,
    "cafe-drink-hotspot",
    new Vector3(1.4, 1.45, 0.9),
    cafePosition(2.1, 1.75, 3.0),
    drinkHotspotMaterial,
  );

  // Toy corner keeps the café useful for the younger sister too.
  box(scene, "cafe-toy-shelf", new Vector3(1.8, 1.25, 0.72), cafePosition(-4.7, 0.63, 2.85), wood);
  const cafeToyBall = MeshBuilder.CreateSphere("cafe-toy-ball", { diameter: 0.45, segments: 10 }, scene);
  cafeToyBall.position.copyFrom(cafePosition(-4.95, 0.42, 2.48));
  cafeToyBall.material = yellow;
  cafeToyBall.isPickable = false;
  box(scene, "cafe-toy-block", new Vector3(0.45, 0.45, 0.45), cafePosition(-4.35, 0.42, 2.48), pink).isPickable = false;

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

  const homeBedroomSign = box(scene, "home-bedroom-sign", new Vector3(0.72, 0.34, 0.08), new Vector3(5.72, 2.15, -2.6), pink);
  const homeStreetSign = box(scene, "home-street-sign", new Vector3(0.72, 0.34, 0.08), new Vector3(-5.72, 2.15, -2.6), yellow);
  const bedroomHomeSign = box(scene, "bedroom-home-sign", new Vector3(0.72, 0.34, 0.08), bedroomPosition(-5.72, 2.15, -2.6), teal);
  const streetHomeSign = box(scene, "street-home-sign", new Vector3(0.72, 0.34, 0.08), streetPosition(-3.35, 2.08, 3.08), yellow);
  const streetCafeSign = box(scene, "street-cafe-sign", new Vector3(0.72, 0.34, 0.08), streetPosition(3.45, 2.08, 3.08), pink);
  const cafeStreetSign = box(scene, "cafe-street-sign", new Vector3(0.72, 0.34, 0.08), cafePosition(-5.72, 2.15, -2.6), yellow);
  for (const sign of [homeBedroomSign, homeStreetSign, bedroomHomeSign, streetHomeSign, streetCafeSign, cafeStreetSign]) {
    sign.isPickable = false;
  }

  // Snap targets strengthen object placement without physics cost.
  const makeTargets = (definitions: Array<[string, Vector3]>): SnapTarget[] => definitions.map(([name, position], index) => ({
    name,
    position,
    marker: createSnapMarker(scene, `snap-${name}-${index}`, position, markerMaterial),
  }));

  const plantTargets = makeTargets([
    ["coffee table", new Vector3(-2.6, 0.98, -1.8)],
    ["TV console", new Vector3(-4.15, 0.82, -2.35)],
    ["kitchen island", new Vector3(3.05, 1.48, 0.55)],
    ["window corner", new Vector3(-5.15, 0.22, 2.8)],
    ["bedroom desk", bedroomPosition(4.2, 1.24, 2.82)],
    ["bedroom window", bedroomPosition(-0.9, 0.22, 2.95)],
    ["street bench", streetPosition(-2.75, 0.82, 1.12)],
    ["café window", cafePosition(-4.85, 0.22, 2.75)],
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
    ["café toy shelf", cafePosition(-4.7, 1.35, 2.82)],
    ["café rug", cafePosition(-2.6, 0.38, -0.55)],
  ]);
  const bookTargets = makeTargets([
    ["coffee table", new Vector3(-3.1, 0.86, -1.72)],
    ["sofa", new Vector3(-4.0, 0.88, 0.2)],
    ["TV console", new Vector3(-4.8, 0.68, -2.35)],
    ["kitchen island", new Vector3(3.9, 1.27, 0.55)],
    ["bedroom desk", bedroomPosition(3.55, 1.18, 2.8)],
    ["bed", bedroomPosition(-3.7, 1.2, 0.2)],
    ["street bench", streetPosition(-2.25, 0.85, 1.12)],
    ["café table", cafePosition(-3.5, 1.08, 0.95)],
    ["café counter", cafePosition(2.85, 1.36, 1.92)],
  ]);
  const foodTargets = makeTargets([
    ["kitchen island", new Vector3(3.2, 1.42, 0.55)],
    ["coffee table", new Vector3(-2.25, 0.88, -1.75)],
    ["sofa", new Vector3(-2.65, 0.93, 0.15)],
    ["kitchen floor", new Vector3(2.15, 0.22, -0.25)],
    ["bedroom desk", bedroomPosition(4.05, 1.24, 2.8)],
    ["bedside", bedroomPosition(-1.2, 0.25, 0.95)],
    ["street bench", streetPosition(-2.15, 0.88, 1.12)],
    ["café table", cafePosition(-3.25, 1.08, 0.92)],
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
    ["café table", cafePosition(-3.75, 1.12, 0.98)],
    ["café counter", cafePosition(3.0, 1.38, 1.9)],
  ]);

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

  const teddy = MeshBuilder.CreateSphere("draggable-teddy", { diameter: 0.62, segments: 12 }, scene);
  teddy.position.set(-1.2, 0.38, -0.6);
  teddy.material = wood;
  for (const x of [-0.22, 0.22]) {
    const ear = MeshBuilder.CreateSphere(`teddy-ear-${x}`, { diameter: 0.27, segments: 9 }, scene);
    ear.position.set(x, 0.24, 0);
    ear.material = wood;
    ear.parent = teddy;
    ear.isPickable = false;
  }
  restoreProp(teddy);
  makeDraggable(teddy, 0.38, teddyTargets, options.onAction);

  const book = box(scene, "draggable-book", new Vector3(0.85, 0.12, 0.62), new Vector3(-3.1, 0.86, -1.72), pink);
  restoreProp(book);
  makeDraggable(book, 0.08, bookTargets, options.onAction);

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

  // Placeholder characters establish scale before final Blender assets arrive.
  const initialRoomDefinition = roomDefinitions[activeRoom];
  const savedKhadijaPosition = new Vector3(save.khadijaPosition.x, 0, save.khadijaPosition.z);
  const savedPositionIsInRoom = savedKhadijaPosition.x >= initialRoomDefinition.bounds.minX
    && savedKhadijaPosition.x <= initialRoomDefinition.bounds.maxX
    && savedKhadijaPosition.z >= initialRoomDefinition.bounds.minZ
    && savedKhadijaPosition.z <= initialRoomDefinition.bounds.maxZ;
  const khadijaStart = savedPositionIsInRoom
    ? savedKhadijaPosition
    : initialRoomDefinition.spawn.clone();
  const khadija = createCharacter(scene, "khadija", khadijaStart, colors.pink, 1, true);
  khadija.setBounds(
    initialRoomDefinition.bounds.minX,
    initialRoomDefinition.bounds.maxX,
    initialRoomDefinition.bounds.minZ,
    initialRoomDefinition.bounds.maxZ,
  );
  createCharacter(scene, "brother", new Vector3(-3.15, 0.58, 0.1), new Color3(0.14, 0.50, 0.28), 0.88);
  createCharacter(scene, "little-sister", new Vector3(1.3, 0, -1.65), colors.yellow, 0.72);
  createCharacter(scene, "street-neighbor", streetPosition(-3.65, 0, -0.85), new Color3(0.15, 0.48, 0.31), 0.84);
  createCharacter(scene, "cafe-worker", cafePosition(3.55, 0, 2.75), colors.teal, 0.92);
  createCharacter(scene, "cafe-little-sister", cafePosition(-4.55, 0, 1.65), colors.yellow, 0.72);

  const outfitColors: Record<OutfitId, Color3> = {
    pink: colors.pink,
    teal: colors.teal,
    yellow: colors.yellow,
  };
  let activeOutfit: OutfitId = save.outfit;
  let heldItemId: string | null = null;
  let seated = save.seated;

  interface HoldableItem {
    id: string;
    label: string;
    mesh: Mesh;
    floorY: number;
    holdScale: Vector3;
    useMessage: string;
    gesture: UseGesture;
    consumable: boolean;
    respawnPosition?: Vector3;
    respawnMessage?: string;
  }

  const holdables = new Map<string, HoldableItem>();

  const emitPlayState = (): void => {
    const state: PlayState = {
      heldItem: heldItemId,
      seated,
      outfit: activeOutfit,
      activeRoom,
    };
    savePlayState(state);
    options.onPlayStateChange(state);
  };

  const setOutfit = (outfit: OutfitId): void => {
    activeOutfit = outfit;
    khadija.setOutfitColor(outfitColors[outfit]);
    options.onAction(`Khadija changed into the ${outfit} outfit`);
    emitPlayState();
  };

  khadija.setOutfitColor(outfitColors[activeOutfit]);

  const roomNames: Record<RoomId, string> = {
    home: "the family home",
    bedroom: "Khadija's bedroom",
    street: "the neighborhood street",
    cafe: "Sunny Café",
  };

  const switchRoom = (nextRoom: RoomId): void => {
    if (nextRoom === activeRoom) {
      options.onAction(`We're already at ${roomNames[nextRoom]}!`);
      return;
    }

    if (seated) {
      khadija.stand();
      seated = false;
    }

    activeRoom = nextRoom;
    const definition = roomDefinitions[activeRoom];
    khadija.setBounds(
      definition.bounds.minX,
      definition.bounds.maxX,
      definition.bounds.minZ,
      definition.bounds.maxZ,
    );
    khadija.root.position.copyFrom(definition.spawn);
    khadija.root.rotation.y = activeRoom === "home" || activeRoom === "street"
      ? -Math.PI / 2
      : Math.PI / 2;
    camera.setTarget(definition.center);
    applyActiveRoomLighting();
    saveKhadijaPosition(khadija.root.position);
    emitPlayState();
    options.onAction(`Welcome to ${roomNames[activeRoom]}!`);
  };

  const connectDoor = (door: Mesh, destination: RoomId): void => {
    door.actionManager = new ActionManager(scene);
    door.actionManager.registerAction(new ExecuteCodeAction(
      ActionManager.OnPickTrigger,
      () => switchRoom(destination),
    ));
  };
  connectDoor(homeToBedroomDoor, "bedroom");
  connectDoor(homeToStreetDoor, "street");
  connectDoor(bedroomToHomeDoor, "home");
  connectDoor(streetToHomeDoor, "home");
  connectDoor(streetToCafeDoor, "cafe");
  connectDoor(cafeToStreetDoor, "street");

  // Simple fruit bowl plus two usable food/drink props.
  cylinder(scene, "fruit-bowl", 0.9, 0.25, new Vector3(3.5, 1.3, 0.6), wood, 18);
  for (const [i, fruitColor] of [colors.yellow, colors.pink, new Color3(0.18, 0.48, 0.22)].entries()) {
    const fruit = MeshBuilder.CreateSphere(`fruit-${i}`, { diameter: 0.28, segments: 9 }, scene);
    fruit.position.set(3.35 + i * 0.2, 1.48 + (i % 2) * 0.08, 0.58);
    fruit.material = material(scene, `fruit-mat-${i}`, fruitColor);
    fruit.isPickable = false;
  }

  const apple = MeshBuilder.CreateSphere("draggable-apple", { diameter: 0.34, segments: 10 }, scene);
  apple.position.set(3.2, 1.48, 0.55);
  apple.material = pink;
  restoreProp(apple);
  makeDraggable(apple, 0.18, foodTargets, options.onAction);

  const cup = MeshBuilder.CreateCylinder("draggable-cup", { diameterTop: 0.34, diameterBottom: 0.3, height: 0.48, tessellation: 14 }, scene);
  cup.position.set(4.15, 1.45, 0.55);
  cup.material = sky;
  const cupHandle = MeshBuilder.CreateTorus("cup-handle", { diameter: 0.3, thickness: 0.07, tessellation: 14 }, scene);
  cupHandle.position.set(0.19, 0, 0);
  cupHandle.rotation.y = Math.PI / 2;
  cupHandle.material = sky;
  cupHandle.parent = cup;
  cupHandle.isPickable = false;
  restoreProp(cup);
  makeDraggable(cup, 0.24, cupTargets, options.onAction);

  holdables.set("teddy", {
    id: "teddy",
    label: "teddy",
    mesh: teddy,
    floorY: 0.38,
    holdScale: new Vector3(0.72, 0.72, 0.72),
    useMessage: "Khadija gives the teddy a hug",
    gesture: "hug",
    consumable: false,
  });
  holdables.set("book", {
    id: "book",
    label: "book",
    mesh: book,
    floorY: 0.08,
    holdScale: new Vector3(0.62, 0.62, 0.62),
    useMessage: "Khadija reads the book",
    gesture: "read",
    consumable: false,
  });
  holdables.set("apple", {
    id: "apple",
    label: "apple",
    mesh: apple,
    floorY: 0.18,
    holdScale: new Vector3(0.8, 0.8, 0.8),
    useMessage: "Khadija eats the apple",
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
    useMessage: "Khadija takes a drink",
    gesture: "drink",
    consumable: false,
  });
  holdables.set("cupcake", {
    id: "cupcake",
    label: "cupcake",
    mesh: cupcake,
    floorY: 0.22,
    holdScale: new Vector3(0.78, 0.78, 0.78),
    useMessage: "Khadija enjoys the cupcake",
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
    useMessage: "Khadija takes a bite of the sandwich",
    gesture: "eat",
    consumable: true,
    respawnPosition: cafePosition(4.95, 1.12, 0.5),
    respawnMessage: "A fresh sandwich appeared in the café display",
  });

  const detachHeldItem = (placeOnFloor: boolean): HoldableItem | null => {
    if (!heldItemId) return null;
    const item = holdables.get(heldItemId) ?? null;
    if (!item) {
      heldItemId = null;
      return null;
    }

    const absolutePosition = item.mesh.getAbsolutePosition().clone();
    item.mesh.parent = null;
    item.mesh.scaling.setAll(1);
    item.mesh.rotation.setAll(0);
    item.mesh.isPickable = true;

    if (placeOnFloor) {
      const forward = new Vector3(-Math.sin(khadija.root.rotation.y), 0, -Math.cos(khadija.root.rotation.y));
      const dropPosition = khadija.root.position.add(forward.scale(0.78));
      item.mesh.position.set(dropPosition.x, item.floorY, dropPosition.z);
      saveProp(item.mesh);
    } else {
      item.mesh.position.copyFrom(absolutePosition);
    }

    heldItemId = null;
    return item;
  };

  const dropHeldItem = (): void => {
    const item = detachHeldItem(true);
    if (!item) {
      options.onAction("Khadija's hands are free!");
      return;
    }
    options.onAction(`The ${item.label} is ready to play with.`);
    emitPlayState();
  };

  const holdItem = (id: string, announce = true): void => {
    const item = holdables.get(id);
    if (!item) return;
    if (heldItemId === id) {
      options.onAction(`Khadija is already holding the ${item.label}!`);
      return;
    }
    detachHeldItem(true);
    item.mesh.parent = khadija.holdAnchor;
    item.mesh.position.set(0, 0, 0);
    item.mesh.rotation.set(0, 0, id === "book" ? Math.PI / 2 : 0);
    item.mesh.scaling.copyFrom(item.holdScale);
    item.mesh.isPickable = false;
    heldItemId = id;
    if (announce) options.onAction(`Khadija picked up the ${item.label}!`);
    emitPlayState();
  };

  const useHeldItem = (): void => {
    if (!heldItemId) {
      options.onAction("Pick up a toy, book, food or drink first");
      return;
    }
    const item = holdables.get(heldItemId);
    if (!item) return;
    khadija.playUseGesture(item.gesture);
    options.onAction(item.useMessage);

    if (!item.consumable) return;
    window.setTimeout(() => {
      detachHeldItem(false);
      item.mesh.setEnabled(false);
      emitPlayState();
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

  scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
    const pointerEvent = pointerInfo.event as PointerEvent;

    if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
      const pickedMesh = pointerInfo.pickInfo?.pickedMesh;
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
    const choice = heldItemId === "cupcake" || !cupcake.isEnabled() ? "sandwich" : "cupcake";
    holdItem(choice);
    options.onAction(choice === "cupcake" ? "The barista served a cupcake" : "The barista served a sandwich");
  }));

  cafeDrinkHotspot.actionManager = new ActionManager(scene);
  cafeDrinkHotspot.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    if (activeRoom !== "cafe") return;
    if (heldItemId === "cup") {
      options.onAction("The barista refilled Khadija's cup");
      return;
    }
    cup.setEnabled(true);
    cup.parent = null;
    cup.position.copyFrom(cafePosition(2.2, 1.32, 2.42));
    holdItem("cup");
    options.onAction("The barista prepared a warm drink");
  }));

  streetScooterHotspot.actionManager = new ActionManager(scene);
  streetScooterHotspot.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    if (activeRoom !== "street") return;
    if (seated) {
      khadija.stand();
      seated = false;
      emitPlayState();
    }
    khadija.setTarget(streetPosition(1.0, 0, -0.55), () => {
      options.onAction("Khadija rings the scooter bell and rides along the street");
      khadija.setTarget(streetPosition(3.4, 0, -1.25), () => {
        khadija.setTarget(streetPosition(1.0, 0, -0.55));
      });
    });
    options.onAction("Khadija is walking to the scooter");
  }));

  for (const wardrobeButton of wardrobeButtons) {
    wardrobeButton.actionManager = new ActionManager(scene);
    wardrobeButton.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      const outfit = wardrobeButton.metadata?.outfit as OutfitId | undefined;
      if (outfit) setOutfit(outfit);
    }));
  }

  // Sofa interaction walks Khadija to the seat and then changes her pose.
  const seatMaterial = material(scene, "seat-hotspot-mat", colors.pink);
  seatMaterial.alpha = 0.03;
  const seatHotspot = box(scene, "sofa-seat-hotspot", new Vector3(2.45, 0.3, 0.7), new Vector3(-3.25, 0.95, 0.05), seatMaterial);
  seatHotspot.actionManager = new ActionManager(scene);
  seatHotspot.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    if (activeRoom !== "home") return;
    if (seated) {
      khadija.stand();
      khadija.root.position.set(-2.7, 0, -0.75);
      saveKhadijaPosition(khadija.root.position);
      seated = false;
      options.onAction("Khadija stood up");
      emitPlayState();
      return;
    }

    khadija.setTarget(new Vector3(-3.25, 0, -0.45), () => {
      khadija.sitAt(new Vector3(-3.25, 0, 0.05), 0);
      seated = true;
      options.onAction("Khadija sat on the sofa");
      emitPlayState();
    });
    options.onAction("Let's sit on the sofa!");
  }));

  bedHotspot.actionManager = new ActionManager(scene);
  bedHotspot.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    if (activeRoom !== "bedroom") return;
    if (seated) {
      khadija.stand();
      khadija.root.position.copyFrom(bedroomPosition(-2.1, 0, -0.6));
      saveKhadijaPosition(khadija.root.position);
      seated = false;
      options.onAction("Khadija got off the bed");
      emitPlayState();
      return;
    }

    khadija.setTarget(bedroomPosition(-2.25, 0, -0.45), () => {
      khadija.sitAt(bedroomPosition(-3.25, 0, 0.35), Math.PI / 2);
      seated = true;
      options.onAction("Khadija is relaxing on her bed");
      emitPlayState();
    });
    options.onAction("Time to relax on the bed!");
  }));

  streetBenchHotspot.actionManager = new ActionManager(scene);
  streetBenchHotspot.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    if (activeRoom !== "street") return;
    if (seated) {
      khadija.stand();
      khadija.root.position.copyFrom(streetPosition(-1.4, 0, 0.25));
      saveKhadijaPosition(khadija.root.position);
      seated = false;
      options.onAction("Khadija stood up from the bench");
      emitPlayState();
      return;
    }

    khadija.setTarget(streetPosition(-2.1, 0, 0.55), () => {
      khadija.sitAt(streetPosition(-2.1, 0, 1.08), 0);
      seated = true;
      options.onAction("Khadija sat on the neighborhood bench");
      emitPlayState();
    });
    options.onAction("Let's visit the neighborhood bench!");
  }));

  cafeSeatHotspot.actionManager = new ActionManager(scene);
  cafeSeatHotspot.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
    if (activeRoom !== "cafe") return;
    if (seated) {
      khadija.stand();
      khadija.root.position.copyFrom(cafePosition(-2.8, 0, -0.55));
      saveKhadijaPosition(khadija.root.position);
      seated = false;
      options.onAction("Khadija left the café chair");
      emitPlayState();
      return;
    }

    khadija.setTarget(cafePosition(-3.5, 0, -0.55), () => {
      khadija.sitAt(cafePosition(-3.5, 0, 0), 0);
      seated = true;
      options.onAction("Khadija sat down for a café snack");
      emitPlayState();
    });
    options.onAction("Let's find a cozy café seat!");
  }));

  if (save.seated) {
    if (activeRoom === "bedroom") {
      khadija.sitAt(bedroomPosition(-3.25, 0, 0.35), Math.PI / 2);
    } else if (activeRoom === "street") {
      khadija.sitAt(streetPosition(-2.1, 0, 1.08), 0);
    } else if (activeRoom === "cafe") {
      khadija.sitAt(cafePosition(-3.5, 0, 0), 0);
    } else {
      khadija.sitAt(new Vector3(-3.25, 0, 0.05), 0);
    }
  }
  if (save.heldItem && holdables.has(save.heldItem)) {
    holdItem(save.heldItem, false);
  } else {
    options.onPlayStateChange({ heldItem: null, seated, outfit: activeOutfit, activeRoom });
  }

  // Click-to-walk plus keyboard movement.
  scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
    if (pointerInfo.type !== PointerEventTypes.POINTERPICK) return;
    const pick = pointerInfo.pickInfo;
    if (!pick?.hit || !pick.pickedPoint || !pick.pickedMesh?.metadata?.walkable) return;
    if (pick.pickedMesh.metadata.room !== activeRoom) return;
    if (seated) {
      seated = false;
      emitPlayState();
    }
    khadija.setTarget(new Vector3(pick.pickedPoint.x, 0, pick.pickedPoint.z));
    options.onAction("Off we go!");
  });

  const pressedKeys = new Set<string>();
  scene.onKeyboardObservable.add((keyboardInfo: KeyboardInfo) => {
    const key = keyboardInfo.event.key.toLowerCase();
    if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) return;
    keyboardInfo.event.preventDefault();
    if (keyboardInfo.type === KeyboardEventTypes.KEYDOWN) pressedKeys.add(key);
    if (keyboardInfo.type === KeyboardEventTypes.KEYUP) pressedKeys.delete(key);
  });

  let saveMovementTimer = 0;
  scene.onBeforeRenderObservable.add(() => {
    const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05);
    const input = new Vector3(
      (pressedKeys.has("d") || pressedKeys.has("arrowright") ? 1 : 0)
        - (pressedKeys.has("a") || pressedKeys.has("arrowleft") ? 1 : 0),
      0,
      (pressedKeys.has("w") || pressedKeys.has("arrowup") ? 1 : 0)
        - (pressedKeys.has("s") || pressedKeys.has("arrowdown") ? 1 : 0),
    );

    if (input.lengthSquared() > 0) {
      if (seated) {
        seated = false;
        emitPlayState();
      }
      khadija.moveBy(input, deltaSeconds);
      saveMovementTimer += deltaSeconds;
      if (saveMovementTimer >= 0.5) {
        saveMovementTimer = 0;
        saveKhadijaPosition(khadija.root.position);
      }
    } else {
      khadija.update(deltaSeconds);
    }
  });

  const setQuality = (settings: QualitySettings): void => {
    enhancedLighting = settings.enhancedLighting;
    sun.intensity = enhancedLighting ? 0.58 : 0.35;
    applyActiveRoomLighting();
    for (const mesh of detailMeshes) mesh.setEnabled(settings.decorativeDetails);
  };

  return {
    scene,
    setQuality,
    useHeldItem,
    dropHeldItem,
    setOutfit,
    switchRoom,
  };
}
