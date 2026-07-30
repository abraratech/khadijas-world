import {
  type AbstractMesh,
  Color3,
  type Material,
  Mesh,
  MeshBuilder,
  type Node,
  type Scene,
  TransformNode,
  Vector3,
  VertexData,
} from "@babylonjs/core";
import type { CharacterExpression } from "../characterState";
import { createMaterial } from "../shared/createMaterials";
import type { CharacterRig } from "./createCharacterVisual";

/**
 * CHAR.4 â€” corrected exterior hair shell.
 *
 * Every earlier checkpoint (CHAR.1A-1J) kept the proven `-hair-cap` sphere
 * hidden and rebuilt the crown from scratch with an additional front-hair
 * disc, five separate forehead "locks", and two temple pads layered on top
 * of a same-size shell. That stack is what produced the visor line, the
 * disconnected forehead patches, and the oversized rear silhouette: four
 * to seven overlapping near-black volumes with no gaps between them read as
 * one fused mass from every angle, and the forehead locks sat close enough
 * to the brow tubes to hide them.
 *
 * CHAR.3 removes the sliced-sphere cap that rendered as a bald crown plus a
 * horizontal forehead band. It replaces that cap with one custom ellipsoid
 * shell whose face opening widens smoothly from crown to cheeks, and relies on that single shell for the visible hairline. The only two pieces that are
 * genuinely rebuilt are the ones the brief calls out by name â€” the headband
 * (flat torus -> swept arch tube, so it cannot read as a bar in profile) and
 * the bow (pinned back onto the hair surface instead of floating beside it).
 * The richer eye/brow/nose/cheek stack from the previous attempt is kept,
 * since it was never the reported problem, and is retuned only where the
 * removed forehead locks had been overlapping it.
 */

interface UnifiedFaceParts {
  sclera: readonly Mesh[];
  irises: readonly Mesh[];
  pupils: readonly Mesh[];
  highlights: readonly Mesh[];
  lids: readonly Mesh[];
  brows: readonly Mesh[];
  blush: readonly Mesh[];
  mouth: Mesh;
  teeth: Mesh;
}

function attachPart(
  mesh: Mesh,
  parent: Node,
  material: Material | null,
): Mesh {
  mesh.parent = parent;
  mesh.material = material;
  mesh.isPickable = false;
  mesh.receiveShadows = true;
  mesh.metadata = {
    ...mesh.metadata,
    characterId: "khadija",
    visualRole: "char2-consolidated-hero",
  };
  return mesh;
}

function sphere(
  scene: Scene,
  name: string,
  diameter: number,
  segments: number,
  parent: Node,
  material: Material | null,
  slice?: number,
): Mesh {
  return attachPart(
    MeshBuilder.CreateSphere(
      name,
      slice === undefined
        ? { diameter, segments }
        : { diameter, segments, slice },
      scene,
    ),
    parent,
    material,
  );
}

function box(
  scene: Scene,
  name: string,
  width: number,
  height: number,
  depth: number,
  parent: Node,
  material: Material | null,
): Mesh {
  return attachPart(
    MeshBuilder.CreateBox(
      name,
      { width, height, depth },
      scene,
    ),
    parent,
    material,
  );
}

function cylinder(
  scene: Scene,
  name: string,
  diameter: number,
  height: number,
  parent: Node,
  material: Material | null,
  tessellation = 20,
): Mesh {
  return attachPart(
    MeshBuilder.CreateCylinder(
      name,
      { diameter, height, tessellation },
      scene,
    ),
    parent,
    material,
  );
}

function torus(
  scene: Scene,
  name: string,
  diameter: number,
  thickness: number,
  parent: Node,
  material: Material | null,
  tessellation = 28,
): Mesh {
  return attachPart(
    MeshBuilder.CreateTorus(
      name,
      { diameter, thickness, tessellation },
      scene,
    ),
    parent,
    material,
  );
}

function tube(
  scene: Scene,
  name: string,
  path: readonly Vector3[],
  radius: number,
  parent: Node,
  material: Material | null,
  tessellation = 12,
): Mesh {
  return attachPart(
    MeshBuilder.CreateTube(
      name,
      {
        path: [...path],
        radius,
        tessellation,
        updatable: false,
      },
      scene,
    ),
    parent,
    material,
  );
}

function findExact(
  meshes: readonly AbstractMesh[],
  name: string,
): AbstractMesh | undefined {
  return meshes.find((mesh) => mesh.name === name);
}

function findContaining(
  meshes: readonly AbstractMesh[],
  marker: string,
): AbstractMesh | undefined {
  return meshes.find((mesh) => mesh.name.includes(marker));
}

function materialOrFallback(
  scene: Scene,
  material: Material | null | undefined,
  name: string,
  color: Color3,
): Material {
  return material ?? createMaterial(scene, name, color);
}

function createHairShell(
  scene: Scene,
  name: string,
  parent: Node,
  material: Material,
): Mesh {
  const mesh = new Mesh(name, scene);
  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];

  const rowCount = 16;
  const columnCount = 24;
  const minimumPhi = .08;
  const maximumPhi = 2.22;

  for (let row = 0; row <= rowCount; row += 1) {
    const rowRatio = row / rowCount;
    const phi =
      minimumPhi
      + (maximumPhi - minimumPhi) * rowRatio;

    const smoothRatio =
      rowRatio
      * rowRatio
      * (3 - 2 * rowRatio);

    const halfArc =
      Math.PI - .93 * smoothRatio;

    for (
      let column = 0;
      column <= columnCount;
      column += 1
    ) {
      const columnRatio =
        column / columnCount;

      const theta =
        -halfArc
        + 2 * halfArc * columnRatio;

      const sinPhi = Math.sin(phi);

      positions.push(
        .47 * sinPhi * Math.sin(theta),
        .075 + .49 * Math.cos(phi),
        .055 + .44 * sinPhi * Math.cos(theta),
      );
    }
  }

  const rowWidth = columnCount + 1;

  for (let row = 0; row < rowCount; row += 1) {
    for (
      let column = 0;
      column < columnCount;
      column += 1
    ) {
      const topLeft =
        row * rowWidth + column;

      const topRight = topLeft + 1;
      const bottomLeft =
        (row + 1) * rowWidth + column;

      const bottomRight = bottomLeft + 1;

      indices.push(
        topLeft,
        topRight,
        bottomLeft,
        topRight,
        bottomRight,
        bottomLeft,
      );
    }
  }

  VertexData.ComputeNormals(
    positions,
    indices,
    normals,
  );

  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.applyToMesh(mesh);

  return attachPart(
    mesh,
    parent,
    material,
  );
}

/**
 * Disables every legacy procedural mesh this rebuild replaces. This list is
 * unchanged from earlier checkpoints â€” hiding was never the bug, what was
 * built to replace the hidden pieces was.
 */
function hideLegacyVisuals(
  rootName: string,
  meshes: readonly AbstractMesh[],
): void {
  const exactNames = new Set([
    rootName + "-mouth",
    rootName + "-smile-highlight",
    rootName + "-nose",
    rootName + "-hair-cap",
    rootName + "-shoe-left",
    rootName + "-shoe-right",
    rootName + "-shoe-sole-left",
    rootName + "-shoe-sole-right",
  ]);

  for (const mesh of meshes) {
    const name = mesh.name;
    const normalized = name.toLowerCase();

    if (
      exactNames.has(name)
      || name.startsWith(rootName + "-eye-white-")
      || name.startsWith(rootName + "-pupil-")
      || name.startsWith(rootName + "-brow-")
      || name.startsWith(rootName + "-cheek-")
      || normalized.includes("-curl-")
      || normalized.includes("front-curl")
      || normalized.includes("headband")
      || normalized.includes("-bow-")
      || normalized.includes("-bun-")
      || normalized.includes("bun-band")
    ) {
      mesh.setEnabled(false);
    }
  }
}

/**
 * Hair: one continuous sliced-sphere cap (the proven `-hair-cap` geometry,
 * rebuilt under the unified name) plus the six-curl cascade already used for
 * every "long-curls" character. No separate front-hair disc, forehead
 * locks, or temple pads â€” the cap's own slice already forms a single
 * connected hairline down to a safe height above the brows, so there is
 * nothing left to read as a visor or to fall out of alignment with the
 * skull.
 */
function createUnifiedHair(
  scene: Scene,
  rootName: string,
  headRoot: TransformNode,
  hairMaterial: Material,
  accentMaterial: Material,
): void {
  createHairShell(
    scene,
    rootName + "-unified-hair-shell",
    headRoot,
    hairMaterial,
  );

  const curls = [
    [-.36, -.08, .34],
    [.36, -.08, .34],
    [-.37, -.36, .31],
    [.37, -.36, .31],
    [-.25, -.57, .29],
    [.25, -.57, .29],
  ] as const;

  curls.forEach(([x, y, diameter], index) => {
    const curl = sphere(
      scene,
      rootName + "-unified-curl-" + index,
      diameter,
      14,
      headRoot,
      hairMaterial,
    );
    curl.position.set(x, y, .12);
  });

  const headbandPath: Vector3[] = [];
  const headbandSteps = 16;

  for (
    let index = 0;
    index <= headbandSteps;
    index += 1
  ) {
    const ratio =
      index / headbandSteps;

    const angle =
      Math.PI - ratio * Math.PI;

    const arch = Math.sin(angle);

    headbandPath.push(
      new Vector3(
        .40 * Math.cos(angle),
        .20 + .33 * arch,
        -.015 - .075 * arch,
      ),
    );
  }

  tube(
    scene,
    rootName + "-unified-headband-tube",
    headbandPath,
    .026,
    headRoot,
    accentMaterial,
    12,
  );

  const bowRoot = new TransformNode(
    rootName + "-unified-bow-root",
    scene,
  );
  bowRoot.parent = headRoot;
  bowRoot.position.set(.30, .445, -.225);
  bowRoot.rotation.z = -.08;

  for (const side of [-1, 1] as const) {
    const loop = sphere(
      scene,
      rootName
        + "-unified-bow-loop-"
        + (side < 0 ? "left" : "right"),
      .135,
      14,
      bowRoot,
      accentMaterial,
    );
    loop.position.set(side * .075, 0, 0);
    loop.scaling.set(1.20, .66, .40);
  }

  const center = sphere(
    scene,
    rootName + "-unified-bow-center",
    .075,
    12,
    bowRoot,
    accentMaterial,
  );
  center.scaling.z = .5;
}

/**
 * Face: the richer sclera/iris/pupil/highlight/lid/brow stack from the
 * previous checkpoint, kept because it was never the reported problem.
 * Sclera size is pulled in slightly so the eyes read as readable rather
 * than saucer-like, and the nose is enlarged and pushed to the most-forward
 * point on the face â€” previously it was smaller and set back behind the
 * eyes, which is why it was effectively invisible in render.
 */
function createUnifiedFace(
  scene: Scene,
  rootName: string,
  headRoot: TransformNode,
  skinMaterial: Material,
  whiteMaterial: Material,
  irisMaterial: Material,
  pupilMaterial: Material,
  browMaterial: Material,
  noseMaterial: Material,
  blushMaterial: Material,
  smileMaterial: Material,
): UnifiedFaceParts {
  const sclera: Mesh[] = [];
  const irises: Mesh[] = [];
  const pupils: Mesh[] = [];
  const highlights: Mesh[] = [];
  const lids: Mesh[] = [];
  const brows: Mesh[] = [];
  const blush: Mesh[] = [];

  for (const side of [-1, 1] as const) {
    const sideName = side < 0 ? "left" : "right";
    const eyeX = side * .155;

    const eyeWhite = sphere(
      scene,
      rootName + "-unified-eye-white-" + sideName,
      .165,
      20,
      headRoot,
      whiteMaterial,
    );
    eyeWhite.position.set(eyeX, .035, -.415);
    eyeWhite.scaling.set(1.12, .95, .13);
    sclera.push(eyeWhite);

    const iris = sphere(
      scene,
      rootName + "-unified-eye-iris-" + sideName,
      .088,
      18,
      headRoot,
      irisMaterial,
    );
    iris.position.set(eyeX, .032, -.432);
    iris.scaling.set(1, 1.02, .08);
    irises.push(iris);

    const pupil = sphere(
      scene,
      rootName + "-unified-eye-pupil-" + sideName,
      .046,
      16,
      headRoot,
      pupilMaterial,
    );
    pupil.position.set(eyeX, .030, -.442);
    pupil.scaling.set(1, 1.02, .06);
    pupils.push(pupil);

    const highlight = sphere(
      scene,
      rootName + "-unified-eye-highlight-" + sideName,
      .016,
      12,
      headRoot,
      whiteMaterial,
    );
    highlight.position.set(eyeX - .013, .055, -.449);
    highlight.scaling.set(1, 1, .05);
    highlight.visibility = .50;
    highlights.push(highlight);

    const lid = sphere(
      scene,
      rootName + "-unified-eyelid-" + sideName,
      .170,
      18,
      headRoot,
      skinMaterial,
    );
    lid.position.set(eyeX, .108, -.405);
    lid.scaling.set(1.10, .07, .09);
    lids.push(lid);

    const brow = tube(
      scene,
      rootName + "-unified-brow-" + sideName,
      [
        new Vector3(-.055, -.005, 0),
        new Vector3(-.018, .005, -.002),
        new Vector3(.018, .005, -.002),
        new Vector3(.055, -.005, 0),
      ],
      .008,
      headRoot,
      browMaterial,
      10,
    );
    brow.position.set(eyeX, .205, -.406);
    brow.rotation.z = side < 0 ? -.035 : .035;
    brows.push(brow);

    const cheekVolume = sphere(
      scene,
      rootName + "-unified-cheek-volume-" + sideName,
      .175,
      18,
      headRoot,
      skinMaterial,
    );
    cheekVolume.position.set(side * .235, -.090, -.335);
    cheekVolume.scaling.set(.86, .55, .45);

    const cheekBlush = sphere(
      scene,
      rootName + "-unified-blush-" + sideName,
      .055,
      16,
      headRoot,
      blushMaterial,
    );
    cheekBlush.position.set(side * .233, -.098, -.410);
    cheekBlush.scaling.set(1.0, .20, .08);
    cheekBlush.visibility = .12;
    blush.push(cheekBlush);

    const ear = sphere(
      scene,
      rootName + "-unified-ear-" + sideName,
      .165,
      16,
      headRoot,
      skinMaterial,
    );
    ear.position.set(side * .435, -.015, .010);
    ear.scaling.set(.58, .86, .40);
  }

  const nose = sphere(
    scene,
    rootName + "-unified-nose",
    .062,
    16,
    headRoot,
    noseMaterial,
  );
  nose.position.set(0, -.060, -.448);
  nose.scaling.set(.66, .62, .36);

  const chin = sphere(
    scene,
    rootName + "-unified-chin",
    .148,
    18,
    headRoot,
    skinMaterial,
  );
  chin.position.set(0, -.215, -.415);
  chin.scaling.set(.76, .36, .38);

  const mouth = sphere(
    scene,
    rootName + "-unified-mouth",
    .190,
    20,
    headRoot,
    smileMaterial,
  );
  mouth.position.set(0, -.172, -.421);
  mouth.scaling.set(1.52, .11, .07);

  const teeth = sphere(
    scene,
    rootName + "-unified-teeth",
    .082,
    16,
    headRoot,
    whiteMaterial,
  );
  teeth.position.set(0, -.155, -.432);
  teeth.scaling.set(1.34, .11, .05);

  return {
    sclera,
    irises,
    pupils,
    highlights,
    lids,
    brows,
    blush,
    mouth,
    teeth,
  };
}

function createUnifiedBody(
  scene: Scene,
  rootName: string,
  visualRoot: TransformNode,
  hoodieMaterial: Material,
  skinMaterial: Material,
  trimMaterial: Material,
): void {
  const upperTorso = sphere(
    scene,
    rootName + "-unified-outfit-upper",
    .66,
    22,
    visualRoot,
    hoodieMaterial,
  );
  upperTorso.position.set(0, 1.16, 0);
  upperTorso.scaling.set(.96, .72, .80);

  const lowerTorso = sphere(
    scene,
    rootName + "-unified-outfit-lower",
    .74,
    24,
    visualRoot,
    hoodieMaterial,
  );
  lowerTorso.position.set(0, .86, 0);
  lowerTorso.scaling.set(1, 1, .82);

  const hem = sphere(
    scene,
    rootName + "-unified-outfit-hem",
    .65,
    20,
    visualRoot,
    hoodieMaterial,
  );
  hem.position.set(0, .625, 0);
  hem.scaling.set(1.02, .42, .80);

  const neck = cylinder(
    scene,
    rootName + "-unified-neck",
    .205,
    .18,
    visualRoot,
    skinMaterial,
    20,
  );
  neck.position.set(0, 1.48, 0);

  const hood = torus(
    scene,
    rootName + "-unified-hood",
    .55,
    .075,
    visualRoot,
    hoodieMaterial,
    30,
  );
  hood.position.set(0, 1.37, .055);
  hood.rotation.x = Math.PI / 2;
  hood.scaling.z = .78;

  const collar = torus(
    scene,
    rootName + "-unified-collar",
    .43,
    .037,
    visualRoot,
    trimMaterial,
    28,
  );
  collar.position.set(0, 1.39, -.01);
  collar.rotation.x = Math.PI / 2;
  collar.scaling.z = .76;
}

function createUnifiedShoes(
  scene: Scene,
  rootName: string,
  leftLegRoot: TransformNode | null,
  rightLegRoot: TransformNode | null,
  shoeMaterial: Material,
  soleMaterial: Material,
  trimMaterial: Material,
): void {
  for (const [side, legRoot] of [
    ["left", leftLegRoot],
    ["right", rightLegRoot],
  ] as const) {
    if (!legRoot) continue;

    const shoe = sphere(
      scene,
      rootName + "-unified-shoe-" + side,
      .31,
      20,
      legRoot,
      shoeMaterial,
    );
    shoe.position.set(0, -.575, -.105);
    shoe.scaling.set(.96, .54, 1.28);

    const sole = sphere(
      scene,
      rootName + "-unified-sole-" + side,
      .30,
      18,
      legRoot,
      soleMaterial,
    );
    sole.position.set(0, -.645, -.10);
    sole.scaling.set(1.00, .18, 1.36);

    for (const [index, x] of [-.055, .055].entries()) {
      const lace = box(
        scene,
        rootName + "-unified-lace-" + side + "-" + index,
        .085,
        .014,
        .018,
        legRoot,
        trimMaterial,
      );
      lace.position.set(x, -.505, -.285);
      lace.rotation.z = index === 0 ? -.22 : .22;
    }
  }
}

export function applyKhadijaSculptedHero(
  scene: Scene,
  rig: CharacterRig,
): void {
  const metadata =
    (rig.root.metadata ?? {}) as Record<string, unknown>;

  if (metadata.khadijaHeroBuild === "CHAR4-corrected-hair-shell") {
    return;
  }

  rig.root.metadata = {
    ...metadata,
    khadijaHeroBuild: "CHAR4-corrected-hair-shell",
    khadijaUnifiedHero: true,
  };

  const rootName = rig.root.name;
  const meshes = rig.root.getChildMeshes(false);
  const visualRoot = rig.semantic.root;
  const headRootNode = rig.semantic.head.parent;

  if (!(headRootNode instanceof TransformNode)) {
    throw new Error("Khadija head pivot is missing.");
  }

  const headRoot = headRootNode;

  const legacyPupil = findContaining(meshes, rootName + "-pupil-");
  const legacyCheek = findContaining(meshes, rootName + "-cheek-");
  const legacyMouth = findExact(meshes, rootName + "-mouth");
  const legacyHeadband = findContaining(meshes, "headband");
  const legacyShoe = findExact(meshes, rootName + "-shoe-left");
  const legacySole = findExact(meshes, rootName + "-shoe-sole-left");

  const skinMaterial = materialOrFallback(
    scene,
    rig.semantic.head.material,
    rootName + "-unified-skin-fallback",
    new Color3(.62, .37, .23),
  );
  const hoodieMaterial = materialOrFallback(
    scene,
    rig.semantic.body.material,
    rootName + "-unified-hoodie-fallback",
    new Color3(.91, .28, .47),
  );
  const hairMaterial = createMaterial(
    scene,
    rootName + "-unified-hair-mat",
    new Color3(.15, .070, .045),
    undefined,
    "hair",
  );
  const whiteMaterial = materialOrFallback(
    scene,
    rig.semantic.eyes[0]?.material,
    rootName + "-unified-white-fallback",
    new Color3(.98, .96, .92),
  );
  const pupilMaterial = materialOrFallback(
    scene,
    legacyPupil?.material,
    rootName + "-unified-pupil-fallback",
    new Color3(.055, .035, .045),
  );
  const smileMaterial = materialOrFallback(
    scene,
    legacyMouth?.material,
    rootName + "-unified-smile-fallback",
    new Color3(.42, .07, .11),
  );
  const blushMaterial = materialOrFallback(
    scene,
    legacyCheek?.material,
    rootName + "-unified-blush-fallback",
    new Color3(.94, .43, .50),
  );
  const accentMaterial = materialOrFallback(
    scene,
    legacyHeadband?.material,
    rootName + "-unified-accent-fallback",
    new Color3(.98, .46, .68),
  );
  const shoeMaterial = materialOrFallback(
    scene,
    legacyShoe?.material,
    rootName + "-unified-shoe-fallback",
    new Color3(.73, .25, .48),
  );
  const soleMaterial = materialOrFallback(
    scene,
    legacySole?.material,
    rootName + "-unified-sole-fallback",
    new Color3(.98, .95, .91),
  );

  const irisMaterial = createMaterial(
    scene,
    rootName + "-unified-iris-mat",
    new Color3(.32, .14, .06),
    undefined,
    "glass",
  );
  irisMaterial.specularPower = 72;

  const browMaterial = createMaterial(
    scene,
    rootName + "-unified-brow-mat",
    new Color3(.16, .072, .046),
    undefined,
    "hair",
  );

  const noseMaterial = createMaterial(
    scene,
    rootName + "-unified-nose-mat",
    new Color3(.50, .27, .16),
    undefined,
    "skin",
  );

  hideLegacyVisuals(rootName, meshes);
  rig.semantic.body.setEnabled(false);

  headRoot.position.y = 1.71;
  headRoot.scaling.setAll(1.08);
  rig.semantic.head.scaling.set(1.07, 1.05, .96);

  const [leftArmRoot, rightArmRoot] = rig.semantic.arms;
  leftArmRoot.position.set(-.36, 1.20, 0);
  rightArmRoot.position.set(.36, 1.20, 0);

  for (const armMesh of meshes.filter((mesh) =>
    mesh.name.startsWith(rootName + "-arm-")
  )) {
    armMesh.scaling.x = 1.12;
    armMesh.scaling.z = 1.12;
  }

  for (const legMesh of meshes.filter((mesh) =>
    mesh.name.startsWith(rootName + "-leg-")
  )) {
    legMesh.scaling.x = 1.16;
    legMesh.scaling.z = 1.16;
    legMesh.scaling.y = .96;
  }

  for (const hand of rig.semantic.hands) {
    hand.scaling.setAll(1.16);
    hand.position.y = -.54;
  }

  for (const [side, armRoot] of [
    [-1, leftArmRoot],
    [1, rightArmRoot],
  ] as const) {
    const shoulder = sphere(
      scene,
      rootName + "-unified-shoulder-" + (side < 0 ? "left" : "right"),
      .28,
      18,
      armRoot,
      hoodieMaterial,
    );
    shoulder.position.set(0, -.01, 0);
    shoulder.scaling.set(1.04, .62, .94);

    const thumb = sphere(
      scene,
      rootName + "-unified-thumb-" + (side < 0 ? "left" : "right"),
      .09,
      14,
      armRoot,
      skinMaterial,
    );
    thumb.position.set(side < 0 ? .065 : -.065, -.515, -.015);
    thumb.scaling.set(.62, .82, .72);
  }

  createUnifiedBody(
    scene,
    rootName,
    visualRoot,
    hoodieMaterial,
    skinMaterial,
    whiteMaterial,
  );
  createUnifiedHair(
    scene,
    rootName,
    headRoot,
    hairMaterial,
    accentMaterial,
  );
  const face = createUnifiedFace(
    scene,
    rootName,
    headRoot,
    skinMaterial,
    whiteMaterial,
    irisMaterial,
    pupilMaterial,
    browMaterial,
    noseMaterial,
    blushMaterial,
    smileMaterial,
  );

  createUnifiedShoes(
    scene,
    rootName,
    scene.getTransformNodeByName(rootName + "-left-leg-pivot"),
    scene.getTransformNodeByName(rootName + "-right-leg-pivot"),
    shoeMaterial,
    soleMaterial,
    whiteMaterial,
  );

  const pocket = findExact(meshes, rootName + "-pocket");
  if (pocket) {
    pocket.position.set(0, .80, -.315);
    pocket.scaling.x = 1.08;
  }

  let expression: CharacterExpression = "neutral";
  let faceClock = 1.2;

  const originalSetExpression = rig.setExpression.bind(rig);
  const originalUpdate = rig.update.bind(rig);

  const applyFaceState = (): void => {
    const sleeping = rig.isSleeping();
    const blinking =
      !sleeping
      && expression !== "sleepy"
      && (faceClock % 3.7) < .105;

    const expressionOpen =
      expression === "sleepy"
        ? .22
        : expression === "excited"
          || expression === "surprised"
          ? 1.13
          : 1;

    const eyeOpen =
      sleeping
        ? .07
        : blinking
          ? .08
          : expressionOpen;

    face.sclera.forEach((eye) => {
      eye.scaling.y = 1.05 * eyeOpen;
    });

    face.irises.forEach((iris, index) => {
      iris.scaling.y = 1.06 * eyeOpen;
      iris.setEnabled(eyeOpen > .13);
      face.pupils[index].scaling.y = 1.04 * eyeOpen;
      face.pupils[index].setEnabled(eyeOpen > .13);
      face.highlights[index].setEnabled(eyeOpen > .30);
      face.lids[index].position.y =
        expression === "sleepy" ? .078 : .108;
    });

    face.blush.forEach((blush) => {
      blush.setEnabled(
        expression === "happy"
        || expression === "excited",
      );
    });

    const [leftBrow, rightBrow] = face.brows;
    leftBrow.position.y = .205;
    rightBrow.position.y = .205;
    leftBrow.rotation.z = -.045;
    rightBrow.rotation.z = .045;

    if (expression === "excited") {
      leftBrow.position.y = .228;
      rightBrow.position.y = .228;
      leftBrow.rotation.z = -.085;
      rightBrow.rotation.z = .085;
    } else if (expression === "surprised") {
      leftBrow.position.y = .247;
      rightBrow.position.y = .247;
    } else if (expression === "sleepy") {
      leftBrow.position.y = .180;
      rightBrow.position.y = .180;
      leftBrow.rotation.z = .018;
      rightBrow.rotation.z = -.018;
    }

    face.mouth.position.set(0, -.172, -.421);

    if (
      expression === "happy"
      || expression === "excited"
    ) {
      face.mouth.scaling.set(
        expression === "excited" ? 1.86 : 1.70,
        expression === "excited" ? .34 : .26,
        .07,
      );
      face.mouth.rotation.z = -.028;
      face.teeth.setEnabled(true);
    } else if (expression === "surprised") {
      face.mouth.scaling.set(.72, .72, .08);
      face.mouth.rotation.z = 0;
      face.teeth.setEnabled(false);
    } else if (expression === "sleepy") {
      face.mouth.scaling.set(1.10, .11, .07);
      face.mouth.rotation.z = 0;
      face.teeth.setEnabled(false);
    } else {
      face.mouth.scaling.set(1.52, .11, .07);
      face.mouth.rotation.z = 0;
      face.teeth.setEnabled(false);
    }
  };

  rig.setExpression = (
    nextExpression: CharacterExpression,
  ): void => {
    expression = nextExpression;
    originalSetExpression(nextExpression);
    applyFaceState();
  };

  rig.update = (deltaSeconds: number): void => {
    faceClock += deltaSeconds;
    originalUpdate(deltaSeconds);
    applyFaceState();
  };

  applyFaceState();

  for (const mesh of rig.root.getChildMeshes(false)) {
    mesh.metadata = {
      ...mesh.metadata,
      characterId: "khadija",
      heroRefinement: "CHAR.4-corrected-hair-shell",
    };
  }
}
