import {
  type AbstractMesh,
  Animation,
  Color3,
  type Mesh,
  MeshBuilder,
  type Scene,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import type { CharacterExpression, CharacterId } from "../characterState";
import { CHARACTER_VISUALS, DEFAULT_CHARACTER_VISUAL } from "../characterVisuals";
import { createMaterial, WORLD_COLORS } from "../shared/createMaterials";
import { addBlobShadow } from "../shared/meshHelpers";

export type UseGesture = "hug" | "read" | "eat" | "drink";

export const CHARACTER_VISUAL_SEMANTIC_KEYS = [
  "root",
  "body",
  "head",
  "eyes",
  "mouth",
  "arms",
  "hands",
  "outfitMeshes",
  "heldItemAnchor",
  "seatAnchor",
  "sleepAnchor",
] as const;

export interface CharacterVisualReferences {
  root: TransformNode;
  body: Mesh;
  head: Mesh;
  eyes: readonly Mesh[];
  mouth: Mesh;
  arms: readonly [TransformNode, TransformNode];
  hands: readonly Mesh[];
  outfitMeshes: readonly AbstractMesh[];
  heldItemAnchor: TransformNode;
  seatAnchor: TransformNode;
  sleepAnchor: TransformNode;
}

export interface CharacterRig {
  root: TransformNode;
  holdAnchor: TransformNode;
  semantic: CharacterVisualReferences;
  update(deltaSeconds: number): void;
  setTarget(target: Vector3, onArrive?: () => void): void;
  moveBy(direction: Vector3, deltaSeconds: number): void;
  sitAt(position: Vector3, rotationY: number): void;
  sleepAt(position: Vector3, rotationY: number): void;
  stand(): void;
  placeAt(position: Vector3): void;
  setOutfitColor(color: Color3): void;
  setExpression(expression: CharacterExpression): void;
  setSelected(selected: boolean): void;
  setVisible(visible: boolean): void;
  setBounds(minX: number, maxX: number, minZ: number, maxZ: number): void;
  setLivingAnimation(enabled: boolean, hasHeldItem?: boolean): void;
  lookAt(target: Vector3 | null): void;
  cancelMovement(): void;
  playUseGesture(gesture: UseGesture): void;
  isSeated(): boolean;
  isSleeping(): boolean;
  isMoving(): boolean;
}


export function createCharacterVisual(
  scene: Scene,
  name: string,
  position: Vector3,
  hoodieColor: Color3,
  scale = 1,
  movable = false,
  characterId?: CharacterId,
  onPositionChanged?: (position: Vector3, rotationY: number) => void,
): CharacterRig {
  const root = new TransformNode(name, scene);
  root.position.copyFrom(position);
  root.scaling.setAll(scale);
  addBlobShadow(scene, root, 0.52);

  const visualRoot = new TransformNode(`${name}-visual`, scene);
  visualRoot.parent = root;
  const headPivot = new TransformNode(`${name}-head-pivot`, scene);
  headPivot.position.y = 1.73;
  headPivot.parent = visualRoot;

  const visualStyle = characterId
    ? CHARACTER_VISUALS[characterId]
    : DEFAULT_CHARACTER_VISUAL;
  const skin = createMaterial(scene, `${name}-skin`, new Color3(...visualStyle.skin));
  const hair = createMaterial(scene, `${name}-hair`, new Color3(...visualStyle.hair));
  const accent = createMaterial(scene, `${name}-accent`, new Color3(...visualStyle.accent));
  const hoodie = createMaterial(scene, `${name}-hoodie`, hoodieColor);
  const denim = createMaterial(scene, `${name}-denim`, new Color3(0.12, 0.31, 0.52));
  const white = createMaterial(scene, `${name}-white`, new Color3(0.96, 0.95, 0.91));
  const eye = createMaterial(scene, `${name}-eye`, WORLD_COLORS.dark);
  const smile = createMaterial(scene, `${name}-smile`, new Color3(0.35, 0.08, 0.10));
  const shoeMaterial = createMaterial(scene, `${name}-shoe-mat`, new Color3(...visualStyle.shoe));
  const cheekMaterial = createMaterial(scene, `${name}-cheek-mat`, new Color3(.94, .43, .50));

  const body = MeshBuilder.CreateCapsule(`${name}-body`, { radius: 0.32, height: 1.1, tessellation: 14 }, scene);
  body.position.y = 0.95;
  body.scaling.x = visualStyle.bodyWidth;
  body.material = hoodie;
  body.parent = visualRoot;

  const head = MeshBuilder.CreateSphere(`${name}-head`, { diameter: 0.88, segments: 18 }, scene);
  head.scaling.set(visualStyle.faceWidth, 1, .9);
  head.material = skin;
  head.parent = headPivot;

  const hairCap = MeshBuilder.CreateSphere(`${name}-hair-cap`, { diameter: 0.91, segments: 14, slice: 0.58 }, scene);
  hairCap.position.set(0, .18, .02);
  hairCap.rotation.x = Math.PI;
  if (visualStyle.hairStyle === "soft-crop") hairCap.scaling.y = .78;
  hairCap.material = hair;
  hairCap.parent = headPivot;

  if (visualStyle.hairStyle === "long-curls") {
    for (const [x, y, diameter] of [
      [-.36, -.08, .34],
      [.36, -.08, .34],
      [-.37, -.36, .31],
      [.37, -.36, .31],
      [-.25, -.57, .29],
      [.25, -.57, .29],
    ] as const) {
      const curl = MeshBuilder.CreateSphere(
        `${name}-curl-${x}-${y}`,
        { diameter, segments: 10 },
        scene,
      );
      curl.position.set(x, y, .12);
      curl.material = hair;
      curl.parent = headPivot;
      curl.isPickable = false;
    }
    const headband = MeshBuilder.CreateTorus(`${name}-headband`, { diameter: 0.76, thickness: 0.07, tessellation: 20 }, scene);
    headband.position.set(0, .19, -.03);
    headband.rotation.x = Math.PI / 2;
    headband.material = accent;
    headband.parent = headPivot;

    for (const x of [-.075, .075]) {
      const bowLoop = MeshBuilder.CreateSphere(`${name}-bow-${x}`, { diameter: .15, segments: 8 }, scene);
      bowLoop.scaling.set(1.25, .72, .42);
      bowLoop.position.set(.26 + x, .43, -.25);
      bowLoop.material = accent;
      bowLoop.parent = headPivot;
      bowLoop.isPickable = false;
    }
  } else if (visualStyle.hairStyle === "double-buns") {
    for (const x of [-.36, .36]) {
      const bun = MeshBuilder.CreateSphere(`${name}-bun-${x}`, { diameter: .38, segments: 11 }, scene);
      bun.position.set(x, .28, .05);
      bun.material = hair;
      bun.parent = headPivot;
      bun.isPickable = false;
      const band = MeshBuilder.CreateTorus(
        `${name}-bun-band-${x}`,
        { diameter: .27, thickness: .045, tessellation: 14 },
        scene,
      );
      band.position.set(x, .24, .01);
      band.rotation.x = Math.PI / 2;
      band.material = accent;
      band.parent = headPivot;
      band.isPickable = false;
    }
  } else {
    for (const x of [-.25, -.08, .09, .26]) {
      const curl = MeshBuilder.CreateSphere(`${name}-front-curl-${x}`, { diameter: .18, segments: 8 }, scene);
      curl.position.set(x, .35 - Math.abs(x) * .18, -.16);
      curl.material = hair;
      curl.parent = headPivot;
      curl.isPickable = false;
    }
  }

  const eyes: Mesh[] = [];
  const pupils: Mesh[] = [];
  const brows: Mesh[] = [];
  const cheeks: Mesh[] = [];
  for (const x of [-0.18, 0.18]) {
    const eyeMesh = MeshBuilder.CreateSphere(`${name}-eye-white-${x}`, { diameter: .17, segments: 10 }, scene);
    eyeMesh.scaling.set(1.12, .86, .36);
    eyeMesh.position.set(x, .035, -.397);
    eyeMesh.material = white;
    eyeMesh.parent = headPivot;
    eyeMesh.isPickable = false;
    eyes.push(eyeMesh);

    const pupil = MeshBuilder.CreateSphere(`${name}-pupil-${x}`, { diameter: .082, segments: 9 }, scene);
    pupil.scaling.z = .42;
    pupil.position.set(x, .025, -.455);
    pupil.material = eye;
    pupil.parent = headPivot;
    pupil.isPickable = false;
    pupils.push(pupil);

    const brow = MeshBuilder.CreateBox(
      `${name}-brow-${x}`,
      { width: .19, height: .026, depth: .025 },
      scene,
    );
    brow.position.set(x, .17, -.425);
    brow.material = hair;
    brow.parent = headPivot;
    brow.isPickable = false;
    brows.push(brow);

    const cheek = MeshBuilder.CreateSphere(`${name}-cheek-${x}`, { diameter: .12, segments: 8 }, scene);
    cheek.scaling.set(1.3, .52, .28);
    cheek.position.set(x < 0 ? -.285 : .285, -.095, -.405);
    cheek.material = cheekMaterial;
    cheek.parent = headPivot;
    cheek.isPickable = false;
    cheeks.push(cheek);
  }

  const mouth = MeshBuilder.CreateBox(`${name}-mouth`, { width: 0.22, height: 0.035, depth: 0.035 }, scene);
  mouth.position.set(0, -.16, -.414);
  mouth.rotation.z = -0.08;
  mouth.material = smile;
  mouth.parent = headPivot;
  mouth.isPickable = false;

  const mouthHighlight = MeshBuilder.CreateBox(
    `${name}-smile-highlight`,
    { width: .12, height: .025, depth: .02 },
    scene,
  );
  mouthHighlight.position.set(0, -.145, -.438);
  mouthHighlight.material = white;
  mouthHighlight.parent = headPivot;
  mouthHighlight.isPickable = false;

  const nose = MeshBuilder.CreateSphere(`${name}-nose`, { diameter: .07, segments: 8 }, scene);
  nose.scaling.set(.72, .88, .6);
  nose.position.set(0, -.055, -.445);
  nose.material = skin;
  nose.parent = headPivot;
  nose.isPickable = false;

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
    shoe.material = shoeMaterial;
    shoe.parent = legRoot;

    const sole = MeshBuilder.CreateBox(
      `${name}-shoe-sole-${suffix}`,
      { width: .29, height: .045, depth: .44 },
      scene,
    );
    sole.position.set(0, -.66, -.08);
    sole.material = white;
    sole.parent = legRoot;
    sole.isPickable = false;
  }

  const leftArm = new TransformNode(`${name}-left-arm-pivot`, scene);
  const rightArm = new TransformNode(`${name}-right-arm-pivot`, scene);
  leftArm.position.set(-0.34, 1.18, 0);
  rightArm.position.set(0.34, 1.18, 0);
  leftArm.parent = visualRoot;
  rightArm.parent = visualRoot;

  const hands: Mesh[] = [];
  for (const [armRoot, suffix] of [[leftArm, "left"], [rightArm, "right"]] as const) {
    const arm = MeshBuilder.CreateCapsule(`${name}-arm-${suffix}`, { radius: 0.105, height: 0.62, tessellation: 10 }, scene);
    arm.position.y = -0.23;
    arm.material = hoodie;
    arm.parent = armRoot;

    const hand = MeshBuilder.CreateSphere(`${name}-hand-${suffix}`, { diameter: .19, segments: 9 }, scene);
    hand.position.y = -.53;
    hand.material = skin;
    hand.parent = armRoot;
    hand.isPickable = false;
    hands.push(hand);
  }

  for (const x of [-.09, .09]) {
    const drawstring = MeshBuilder.CreateCylinder(
      `${name}-drawstring-${x}`,
      { diameter: .018, height: .25, tessellation: 8 },
      scene,
    );
    drawstring.position.set(x, 1.18, -.29);
    drawstring.material = white;
    drawstring.parent = visualRoot;
    drawstring.isPickable = false;
  }

  const pocket = MeshBuilder.CreateBox(
    `${name}-pocket`,
    { width: .38, height: .2, depth: .035 },
    scene,
  );
  pocket.position.set(0, .78, -.31);
  pocket.material = hoodie;
  pocket.parent = visualRoot;
  pocket.isPickable = false;

  const emblemCenter = MeshBuilder.CreateSphere(
    `${name}-${visualStyle.emblem}-center`,
    { diameter: .11, segments: 8 },
    scene,
  );
  emblemCenter.scaling.z = .28;
  emblemCenter.position.set(0, 1.03, -.337);
  emblemCenter.material = accent;
  emblemCenter.parent = visualRoot;
  emblemCenter.isPickable = false;
  const emblemPoints = visualStyle.emblem === "flower" ? 5 : visualStyle.emblem === "star" ? 4 : 2;
  for (let index = 0; index < emblemPoints; index += 1) {
    const angle = emblemPoints === 2 ? (index === 0 ? -.65 : .65) : (index / emblemPoints) * Math.PI * 2;
    const detail = MeshBuilder.CreateSphere(
      `${name}-${visualStyle.emblem}-detail-${index}`,
      { diameter: visualStyle.emblem === "heart" ? .10 : .085, segments: 7 },
      scene,
    );
    detail.scaling.set(
      visualStyle.emblem === "heart" ? .9 : 1,
      visualStyle.emblem === "heart" ? 1.2 : 1,
      .25,
    );
    detail.position.set(
      Math.cos(angle) * (visualStyle.emblem === "heart" ? .055 : .09),
      1.03 + Math.sin(angle) * (visualStyle.emblem === "heart" ? .045 : .09),
      -.342,
    );
    detail.material = accent;
    detail.parent = visualRoot;
    detail.isPickable = false;
  }

  const holdAnchor = new TransformNode(`${name}-hold-anchor`, scene);
  holdAnchor.position.set(0, -0.53, -0.17);
  holdAnchor.parent = rightArm;

  // Khadija is the sole playable character, so a permanent selection ring no
  // longer communicates a meaningful choice. Character identity is conveyed by
  // the HUD and direct interaction labels instead.
  if (characterId) {
    for (const childMesh of root.getChildMeshes()) {
      childMesh.metadata = { ...childMesh.metadata, characterId };
    }
  }

  let target: Vector3 | null = null;
  let arrivalAction: (() => void) | null = null;
  let seated = false;
  let sleeping = false;
  let walkPhase = 0;
  let gestureActive = false;
  let livingAnimation = true;
  let heldItemAnimation = false;
  let lookTarget: Vector3 | null = null;
  let expression: CharacterExpression = "neutral";
  let idleClock = name.split("").reduce((total, letter) => total + letter.charCodeAt(0), 0) * .071;
  const idleSeed = idleClock;
  const speed = movable ? 2.15 : 0;
  const movementScratch = new Vector3();
  const directionScratch = new Vector3();

  let bounds = { minX: -5.25, maxX: 5.15, minZ: -3.35, maxZ: 3.45 };

  const clampPositionInPlace = (value: Vector3): Vector3 => {
    value.x = Math.max(bounds.minX, Math.min(bounds.maxX, value.x));
    value.y = 0;
    value.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, value.z));
    return value;
  };

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
      if (!sleeping) visualRoot.position.y *= 0.72;
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

  const expressionEyeScale = (): number => {
    if (expression === "sleepy") return .18;
    if (expression === "excited" || expression === "surprised") return 1.28;
    return 1;
  };

  const applyExpression = (): void => {
    const eyeY = expressionEyeScale();
    for (const eyeMesh of eyes) eyeMesh.scaling.set(1.12, .86 * eyeY, .36);
    for (const pupil of pupils) pupil.scaling.y = eyeY;
    for (const cheek of cheeks) {
      cheek.setEnabled(expression === "happy" || expression === "excited");
    }
    brows[0].rotation.z = 0;
    brows[1].rotation.z = 0;
    brows[0].position.y = .17;
    brows[1].position.y = .17;
    if (expression === "excited") {
      brows[0].rotation.z = -.12;
      brows[1].rotation.z = .12;
      brows[0].position.y = .205;
      brows[1].position.y = .205;
    } else if (expression === "surprised") {
      brows[0].position.y = .24;
      brows[1].position.y = .24;
    } else if (expression === "sleepy") {
      brows[0].rotation.z = .08;
      brows[1].rotation.z = -.08;
      brows[0].position.y = .145;
      brows[1].position.y = .145;
    }
    mouth.rotation.z = expression === "happy" || expression === "excited" ? -.14 : 0;
    if (expression === "surprised") {
      mouth.scaling.set(.45, 2.2, 1);
    } else if (expression === "sleepy") {
      mouth.scaling.set(.7, .7, 1);
    } else if (expression === "excited") {
      mouth.scaling.set(1.22, 1.35, 1);
    } else {
      mouth.scaling.set(1, 1, 1);
    }
    mouthHighlight.setEnabled(expression === "happy" || expression === "excited");
  };

  const animateIdle = (deltaSeconds: number): void => {
    if (!livingAnimation || gestureActive || target) {
      visualRoot.rotation.z *= .72;
      headPivot.rotation.y *= .72;
      headPivot.rotation.z *= .72;
      holdAnchor.rotation.z *= .72;
      return;
    }
    idleClock += deltaSeconds;
    const breath = Math.sin(idleClock * (sleeping ? 1.25 : .82) + idleSeed);
    visualRoot.rotation.z = breath * (sleeping ? .012 : seated ? .015 : .022);
    visualRoot.scaling.y = 1 + breath * (sleeping ? .014 : .004);
    headPivot.rotation.z = Math.sin(idleClock * .37 + idleSeed) * (sleeping ? .009 : .018);

    if (lookTarget && !sleeping) {
      const toTarget = lookTarget.subtract(root.position);
      const desiredWorldYaw = Math.atan2(-toTarget.x, -toTarget.z);
      let localYaw = desiredWorldYaw - root.rotation.y;
      while (localYaw > Math.PI) localYaw -= Math.PI * 2;
      while (localYaw < -Math.PI) localYaw += Math.PI * 2;
      headPivot.rotation.y += (Math.max(-.52, Math.min(.52, localYaw)) - headPivot.rotation.y) * .08;
    } else {
      headPivot.rotation.y = Math.sin(idleClock * .51 + idleSeed * 1.7) * (sleeping ? .025 : .1);
    }

    if (seated && !sleeping) {
      leftArm.rotation.x = -.15 + Math.sin(idleClock * .31 + idleSeed) * .055;
      rightArm.rotation.x = -.15 + Math.sin(idleClock * .29 + idleSeed * 2) * .055;
      leftLeg.rotation.x = -1.28 + Math.sin(idleClock * .24 + idleSeed) * .035;
      rightLeg.rotation.x = -1.28 - Math.sin(idleClock * .24 + idleSeed) * .035;
    }

    if (sleeping) {
      visualRoot.position.y = .15 + breath * .018;
      for (const eyeMesh of eyes) eyeMesh.scaling.y = .055;
      for (const pupil of pupils) pupil.scaling.y = .05;
      return;
    }

    const blinkCycle = (idleClock + idleSeed) % (3.1 + (idleSeed % 1.4));
    const blinking = blinkCycle < .11;
    const eyeY = blinking ? .08 : expressionEyeScale();
    for (const eyeMesh of eyes) eyeMesh.scaling.y = .86 * eyeY;
    for (const pupil of pupils) pupil.scaling.y = eyeY;

    const happyMoment = (idleClock + idleSeed * 2) % 9.5 > 9.05;
    if (happyMoment && (expression === "happy" || expression === "excited")) {
      leftArm.rotation.z = .16;
      rightArm.rotation.z = -.16;
    }
    holdAnchor.rotation.z = heldItemAnimation
      ? Math.sin(idleClock * 1.35 + idleSeed) * .08
      : holdAnchor.rotation.z * .72;
  };

  const stand = (): void => {
    seated = false;
    sleeping = false;
    visualRoot.position.y = 0;
    visualRoot.rotation.z = 0;
    headPivot.rotation.setAll(0);
    leftLeg.rotation.x = 0;
    rightLeg.rotation.x = 0;
    root.position.y = 0;
  };

  applyExpression();

  return {
    root,
    holdAnchor,
    semantic: {
      root: visualRoot,
      body,
      head,
      eyes,
      mouth,
      arms: [leftArm, rightArm],
      hands,
      outfitMeshes: root.getChildMeshes().filter((mesh) => mesh.material === hoodie),
      heldItemAnchor: holdAnchor,
      seatAnchor: root,
      sleepAnchor: root,
    },
    setTarget(nextTarget: Vector3, onArrive?: () => void): void {
      if (!movable) return;
      stand();
      target ??= new Vector3();
      target.copyFrom(nextTarget);
      clampPositionInPlace(target);
      arrivalAction = onArrive ?? null;
    },
    moveBy(direction: Vector3, deltaSeconds: number): void {
      if (!movable || direction.lengthSquared() < 0.0001) return;
      stand();
      target = null;
      arrivalAction = null;
      movementScratch.copyFrom(direction).normalize().scaleInPlace(speed * deltaSeconds);
      root.position.addInPlace(movementScratch);
      clampPositionInPlace(root.position);
      root.rotation.y = Math.atan2(-movementScratch.x, -movementScratch.z);
      animateWalk(true, deltaSeconds);
    },
    sitAt(seatPosition: Vector3, rotationY: number): void {
      target = null;
      arrivalAction = null;
      seated = true;
      sleeping = false;
      root.position.copyFrom(seatPosition);
      root.rotation.y = rotationY;
      root.position.y = 0.43;
      visualRoot.position.y = -0.12;
      leftLeg.rotation.x = -1.28;
      rightLeg.rotation.x = -1.28;
      leftArm.rotation.x = -0.15;
      rightArm.rotation.x = -0.15;
    },
    sleepAt(sleepPosition: Vector3, rotationY: number): void {
      target = null;
      arrivalAction = null;
      seated = true;
      sleeping = true;
      root.position.copyFrom(sleepPosition);
      root.rotation.y = rotationY;
      root.position.y = .48;
      visualRoot.position.y = .15;
      visualRoot.rotation.z = -Math.PI / 2;
      leftLeg.rotation.x = -.18;
      rightLeg.rotation.x = .18;
      leftArm.rotation.x = .42;
      rightArm.rotation.x = .42;
    },
    stand,
    placeAt(nextPosition: Vector3): void {
      stand();
      target = null;
      arrivalAction = null;
      root.position.copyFrom(nextPosition);
      clampPositionInPlace(root.position);
      onPositionChanged?.(root.position, root.rotation.y);
    },
    setOutfitColor(color: Color3): void {
      hoodie.diffuseColor = color;
    },
    setExpression(nextExpression: CharacterExpression): void {
      expression = nextExpression;
      applyExpression();
    },
    setSelected(_selected: boolean): void {
      // Intentionally empty: Khadija is the only playable character.
    },
    setVisible(visible: boolean): void {
      root.setEnabled(visible);
    },
    setBounds(minX: number, maxX: number, minZ: number, maxZ: number): void {
      bounds = { minX, maxX, minZ, maxZ };
      clampPositionInPlace(root.position);
    },
    setLivingAnimation(enabled: boolean, hasHeldItem = false): void {
      livingAnimation = enabled;
      heldItemAnimation = enabled && hasHeldItem;
      if (!enabled) {
        lookTarget = null;
        visualRoot.rotation.z = 0;
        visualRoot.scaling.y = 1;
        headPivot.rotation.y = 0;
        headPivot.rotation.z = 0;
        holdAnchor.rotation.z = 0;
        applyExpression();
      }
    },
    lookAt(nextTarget: Vector3 | null): void {
      lookTarget = nextTarget?.clone() ?? null;
    },
    cancelMovement(): void {
      target = null;
      arrivalAction = null;
      animateWalk(false, 0);
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
    isSleeping(): boolean {
      return sleeping;
    },
    isMoving(): boolean {
      return target !== null;
    },
    update(deltaSeconds: number): void {
      if (!movable || !target) {
        animateWalk(false, deltaSeconds);
        animateIdle(deltaSeconds);
        return;
      }

      directionScratch.copyFrom(target).subtractInPlace(root.position);
      directionScratch.y = 0;
      const distance = directionScratch.length();
      if (distance < 0.06) {
        root.position.copyFrom(target);
        target = null;
        onPositionChanged?.(root.position, root.rotation.y);
        animateWalk(false, deltaSeconds);
        const callback = arrivalAction;
        arrivalAction = null;
        callback?.();
        return;
      }

      const step = Math.min(distance, speed * deltaSeconds);
      directionScratch.scaleInPlace(step / distance);
      root.position.addInPlace(directionScratch);
      root.rotation.y = Math.atan2(-directionScratch.x, -directionScratch.z);
      animateWalk(true, deltaSeconds);
    },
  };
}
