import {
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
import type { HeroCharacterProfile } from "./heroCharacterProfiles";

interface NpcFaceParts {
  sclera: readonly Mesh[];
  irises: readonly Mesh[];
  pupils: readonly Mesh[];
  highlights: readonly Mesh[];
  brows: readonly Mesh[];
  blush: readonly Mesh[];
  mouth: Mesh;
  teeth: Mesh;
}

function attachPart(
  mesh: Mesh,
  parent: Node,
  material: Material | null,
  profileId: string,
): Mesh {
  mesh.parent = parent;
  mesh.material = material;
  mesh.isPickable = false;
  mesh.receiveShadows = true;
  mesh.metadata = {
    ...mesh.metadata,
    npcToyProfileId: profileId,
    toyCharacterProfileId: profileId,
    visualRole: "char2c-toy-character",
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
  profileId: string,
): Mesh {
  return attachPart(
    MeshBuilder.CreateSphere(
      name,
      {
        diameter,
        segments,
      },
      scene,
    ),
    parent,
    material,
    profileId,
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
  profileId: string,
): Mesh {
  return attachPart(
    MeshBuilder.CreateBox(
      name,
      {
        width,
        height,
        depth,
      },
      scene,
    ),
    parent,
    material,
    profileId,
  );
}

function tube(
  scene: Scene,
  name: string,
  path: readonly Vector3[],
  radius: number,
  parent: Node,
  material: Material | null,
  profileId: string,
  tessellation = 10,
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
    profileId,
  );
}

function hideReplacedHeadMeshes(
  rootName: string,
  rig: CharacterRig,
): void {
  const exactNames = new Set([
    rootName + "-mouth",
    rootName + "-smile-highlight",
    rootName + "-nose",
    rootName + "-hair-cap",
  ]);

  for (const mesh of rig.root.getChildMeshes(false)) {
    const name = mesh.name;
    const normalized = name.toLowerCase();

    const isLegacyFace =
      exactNames.has(name)
      || name.startsWith(rootName + "-eye-white-")
      || name.startsWith(rootName + "-pupil-")
      || name.startsWith(rootName + "-brow-")
      || name.startsWith(rootName + "-cheek-");

    const isLegacyHair =
      normalized.includes("front-curl")
      || normalized.includes("-curl-")
      || normalized.includes("-bun-")
      || normalized.includes("bun-band")
      || normalized.includes("headband")
      || normalized.includes("-bow-");

    const isHeroFace =
      name.startsWith(rootName + "-hero-iris-")
      || name.startsWith(rootName + "-hero-eye-shine-")
      || name.startsWith(rootName + "-hero-lash-")
      || name.startsWith(rootName + "-hero-nostril-")
      || name.startsWith(rootName + "-hero-mouth-corner-");

    const isHeroHair =
      name === rootName + "-hero-hair-cap"
      || name.startsWith(rootName + "-hero-hair-")
      || name.startsWith(rootName + "-hero-bun-")
      || name.startsWith(rootName + "-hero-bun-band-")
      || name === rootName + "-hero-low-bun"
      || name === rootName + "-hero-scarf-band"
      || name === rootName + "-hero-scarf-tail";

    const isPreviousToyLayer =
      name.startsWith(rootName + "-npc-")
      || name.startsWith(rootName + "-toy-");

    if (
      isLegacyFace
      || isLegacyHair
      || isHeroFace
      || isHeroHair
      || isPreviousToyLayer
    ) {
      mesh.setEnabled(false);
    }
  }
}

interface HairShellOptions {
  width: number;
  height: number;
  depth: number;
  centerY: number;
  centerZ: number;
  maximumPhi: number;
  opening: number;
}

function createHairShell(
  scene: Scene,
  name: string,
  parent: Node,
  material: Material,
  profileId: string,
  options: HairShellOptions,
): Mesh {
  const shell = new Mesh(name, scene);
  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];

  const rowCount = 16;
  const columnCount = 24;
  const minimumPhi = .06;

  for (let row = 0; row <= rowCount; row += 1) {
    const rowRatio = row / rowCount;
    const phi =
      minimumPhi
      + (options.maximumPhi - minimumPhi) * rowRatio;

    const openingProgress =
      Math.max(
        0,
        Math.min(
          1,
          (rowRatio - .36) / .48,
        ),
      );

    const openingRatio =
      openingProgress
      * openingProgress
      * (3 - 2 * openingProgress);

    const halfArc =
      Math.PI - options.opening * openingRatio;

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
        options.width * sinPhi * Math.sin(theta),
        options.centerY + options.height * Math.cos(phi),
        options.centerZ + options.depth * sinPhi * Math.cos(theta),
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
  vertexData.applyToMesh(shell);

  return attachPart(
    shell,
    parent,
    material,
    profileId,
  );
}

function createSurfaceLock(
  scene: Scene,
  rootName: string,
  suffix: string,
  headRoot: TransformNode,
  material: Material,
  profileId: string,
  x: number,
  y: number,
  diameter: number,
  scaleX: number,
  scaleY: number,
  rotationZ = 0,
): Mesh {
  const lock = sphere(
    scene,
    rootName + "-toy-hairline-" + suffix,
    diameter * .82,
    14,
    headRoot,
    material,
    profileId,
  );

  lock.position.set(x, y, -.406);
  lock.scaling.set(
    scaleX * .82,
    scaleY * .58,
    .10,
  );
  lock.rotation.z = rotationZ;
  return lock;
}

function createHairBand(
  scene: Scene,
  name: string,
  diameter: number,
  thickness: number,
  position: Vector3,
  parent: TransformNode,
  material: Material,
  profileId: string,
): Mesh {
  const band = attachPart(
    MeshBuilder.CreateTorus(
      name,
      {
        diameter,
        thickness,
        tessellation: 18,
      },
      scene,
    ),
    parent,
    material,
    profileId,
  );

  band.position.copyFrom(position);
  band.rotation.x = Math.PI / 2;
  return band;
}

function hairShellOptions(
  profile: HeroCharacterProfile,
): HairShellOptions {
  switch (profile.hairStyle) {
    case "garden-crop":
      return {
        width: .468,
        height: .465,
        depth: .432,
        centerY: .085,
        centerZ: .050,
        maximumPhi: 1.96,
        opening: .59,
      };

    case "neat-crop":
      return {
        width: .466,
        height: .455,
        depth: .430,
        centerY: .095,
        centerZ: .050,
        maximumPhi: 1.90,
        opening: .57,
      };

    case "fluffy-crop":
      return {
        width: .472,
        height: .475,
        depth: .438,
        centerY: .085,
        centerZ: .050,
        maximumPhi: 2.02,
        opening: .60,
      };

    case "double-buns":
      return {
        width: .472,
        height: .485,
        depth: .440,
        centerY: .078,
        centerZ: .052,
        maximumPhi: 2.10,
        opening: .62,
      };

    case "wrapped-scarf":
      return {
        width: .480,
        height: .495,
        depth: .445,
        centerY: .074,
        centerZ: .058,
        maximumPhi: 2.27,
        opening: .56,
      };

    case "layered-bob":
    case "silver-bob":
      return {
        width: .480,
        height: .495,
        depth: .448,
        centerY: .072,
        centerZ: .058,
        maximumPhi: 2.28,
        opening: .66,
      };

    case "low-bun":
      return {
        width: .474,
        height: .490,
        depth: .444,
        centerY: .076,
        centerZ: .056,
        maximumPhi: 2.24,
        opening: .64,
      };
  }
}

function createNpcHair(
  scene: Scene,
  rootName: string,
  headRoot: TransformNode,
  profile: HeroCharacterProfile,
  hairMaterial: Material,
  accentMaterial: Material,
): void {
  const profileId = profile.id;
  const scarfStyle =
    profile.hairStyle === "wrapped-scarf";

  createHairShell(
    scene,
    rootName + "-toy-hair-shell",
    headRoot,
    scarfStyle ? accentMaterial : hairMaterial,
    profileId,
    hairShellOptions(profile),
  );

  switch (profile.hairStyle) {
    case "low-bun": {
      createSurfaceLock(
        scene,
        rootName,
        "low-bun-left",
        headRoot,
        hairMaterial,
        profileId,
        -.125,
        .295,
        .25,
        1.35,
        .48,
        .10,
      );

      createSurfaceLock(
        scene,
        rootName,
        "low-bun-right",
        headRoot,
        hairMaterial,
        profileId,
        .175,
        .278,
        .22,
        .88,
        .42,
        -.12,
      );

      const bun = sphere(
        scene,
        rootName + "-toy-hair-low-bun",
        .36,
        14,
        headRoot,
        hairMaterial,
        profileId,
      );
      bun.position.set(0, -.13, .405);
      bun.scaling.set(1.12, 1.05, .86);

      for (const side of [-1, 1] as const) {
        const temple = sphere(
          scene,
          rootName
            + "-toy-hair-temple-"
            + (side < 0 ? "left" : "right"),
          .24,
          12,
          headRoot,
          hairMaterial,
          profileId,
        );
        temple.position.set(side * .365, .005, -.025);
        temple.scaling.set(.60, 1.24, .56);
      }
      break;
    }

    case "layered-bob":
    case "silver-bob": {
      createSurfaceLock(
        scene,
        rootName,
        "bob-sweep",
        headRoot,
        hairMaterial,
        profileId,
        -.105,
        .292,
        .26,
        1.42,
        .48,
        .10,
      );

      for (const [
        side,
        level,
        y,
        diameter,
        scaleY,
      ] of [
        [-1, "upper", -.015, .30, 1.36],
        [1, "upper", -.015, .30, 1.36],
        [-1, "lower", -.265, .27, 1.18],
        [1, "lower", -.265, .27, 1.18],
      ] as const) {
        const lock = sphere(
          scene,
          rootName
            + "-toy-hair-bob-"
            + (side < 0 ? "left" : "right")
            + "-"
            + level,
          diameter,
          14,
          headRoot,
          hairMaterial,
          profileId,
        );
        lock.position.set(
          side * (level === "lower" ? .292 : .370),
          y,
          .065,
        );
        lock.scaling.set(.70, scaleY, .66);
      }
      break;
    }

    case "garden-crop":
    case "neat-crop": {
      for (const [
        suffix,
        x,
        y,
        rotation,
      ] of [
        ["left", -.19, .282, .08],
        ["center", 0, .305, 0],
        ["right", .19, .282, -.08],
      ] as const) {
        createSurfaceLock(
          scene,
          rootName,
          "crop-" + suffix,
          headRoot,
          hairMaterial,
          profileId,
          x,
          y,
          .22,
          .82,
          .54,
          rotation,
        );
      }
      break;
    }

    case "wrapped-scarf": {
      for (const [
        suffix,
        x,
        y,
      ] of [
        ["left", -.18, .276],
        ["center", 0, .300],
        ["right", .18, .276],
      ] as const) {
        createSurfaceLock(
          scene,
          rootName,
          "scarf-" + suffix,
          headRoot,
          accentMaterial,
          profileId,
          x,
          y,
          .23,
          .90,
          .52,
        );
      }

      const tail = box(
        scene,
        rootName + "-toy-hair-scarf-tail",
        .16,
        .48,
        .07,
        headRoot,
        accentMaterial,
        profileId,
      );
      tail.position.set(.29, -.23, .27);
      tail.rotation.z = -.16;
      break;
    }

    case "double-buns": {
      createSurfaceLock(
        scene,
        rootName,
        "double-bun-left",
        headRoot,
        hairMaterial,
        profileId,
        -.12,
        .286,
        .23,
        .94,
        .54,
        .10,
      );

      createSurfaceLock(
        scene,
        rootName,
        "double-bun-right",
        headRoot,
        hairMaterial,
        profileId,
        .12,
        .286,
        .23,
        .94,
        .54,
        -.10,
      );

      for (const side of [-1, 1] as const) {
        const sideName =
          side < 0 ? "left" : "right";

        const bun = sphere(
          scene,
          rootName + "-toy-hair-bun-" + sideName,
          .35,
          14,
          headRoot,
          hairMaterial,
          profileId,
        );
        bun.position.set(side * .35, .275, .055);
        bun.scaling.set(1, 1.04, .92);

        createHairBand(
          scene,
          rootName + "-toy-hair-bun-band-" + sideName,
          .26,
          .043,
          new Vector3(side * .35, .235, .015),
          headRoot,
          accentMaterial,
          profileId,
        );
      }

      for (const side of [-1, 1] as const) {
        const loop = sphere(
          scene,
          rootName
            + "-toy-hair-bow-loop-"
            + (side < 0 ? "left" : "right"),
          .16,
          10,
          headRoot,
          accentMaterial,
          profileId,
        );
        loop.position.set(.285 + side * .065, .435, -.225);
        loop.scaling.set(1.28, .72, .40);
      }

      const knot = sphere(
        scene,
        rootName + "-toy-hair-bow-knot",
        .085,
        10,
        headRoot,
        accentMaterial,
        profileId,
      );
      knot.position.set(.285, .435, -.235);
      knot.scaling.z = .58;
      break;
    }

    case "fluffy-crop": {
      for (const [
        suffix,
        x,
        y,
        rotation,
      ] of [
        ["far-left", -.28, .270, .12],
        ["left", -.14, .292, .07],
        ["center", 0, .305, 0],
        ["right", .14, .292, -.07],
        ["far-right", .28, .270, -.12],
      ] as const) {
        createSurfaceLock(
          scene,
          rootName,
          "fluff-" + suffix,
          headRoot,
          hairMaterial,
          profileId,
          x,
          y,
          .215,
          .76,
          .58,
          rotation,
        );
      }
      break;
    }
  }
}

function createToyFace(
  scene: Scene,
  rootName: string,
  headRoot: TransformNode,
  profile: HeroCharacterProfile,
  skinMaterial: Material,
  whiteMaterial: Material,
  irisMaterial: Material,
  pupilMaterial: Material,
  browMaterial: Material,
  blushMaterial: Material,
  smileMaterial: Material,
  teethMaterial: Material,
): NpcFaceParts {
  const profileId = profile.id;
  const sclera: Mesh[] = [];
  const irises: Mesh[] = [];
  const pupils: Mesh[] = [];
  const highlights: Mesh[] = [];
  const brows: Mesh[] = [];
  const blush: Mesh[] = [];

  const ageEyeScale =
    profile.age === "elder"
      ? .93
      : profile.age === "adult"
        ? .96
        : profile.age === "child"
          ? .99
          : 1.02;

  const eyeX =
    .177 * profile.eyeSpacing;

  for (const side of [-1, 1] as const) {
    const sideName =
      side < 0 ? "left" : "right";

    const eyeWhite = sphere(
      scene,
      rootName + "-toy-eye-white-" + sideName,
      .160 * profile.eyeScale * ageEyeScale,
      16,
      headRoot,
      whiteMaterial,
      profileId,
    );
    eyeWhite.position.set(
      side * eyeX,
      .025,
      -.410,
    );
    eyeWhite.scaling.set(1.17, 1, .10);
    sclera.push(eyeWhite);

    const iris = sphere(
      scene,
      rootName + "-toy-eye-iris-" + sideName,
      .073 * profile.eyeScale,
      14,
      headRoot,
      irisMaterial,
      profileId,
    );
    iris.position.set(
      side * eyeX,
      .021,
      -.430,
    );
    iris.scaling.set(1, 1.04, .08);
    irises.push(iris);

    const pupil = sphere(
      scene,
      rootName + "-toy-eye-pupil-" + sideName,
      .038 * profile.eyeScale,
      12,
      headRoot,
      pupilMaterial,
      profileId,
    );
    pupil.position.set(
      side * eyeX,
      .020,
      -.438,
    );
    pupil.scaling.set(1, 1.03, .06);
    pupils.push(pupil);

    const highlight = sphere(
      scene,
      rootName + "-toy-eye-highlight-" + sideName,
      .016,
      10,
      headRoot,
      whiteMaterial,
      profileId,
    );
    highlight.position.set(
      side * eyeX - .012,
      .044,
      -.444,
    );
    highlight.scaling.z = .045;
    highlight.visibility = .56;
    highlights.push(highlight);

    const brow = tube(
      scene,
      rootName + "-toy-brow-" + sideName,
      [
        new Vector3(-.050, -.004, 0),
        new Vector3(-.016, .006, -.002),
        new Vector3(.016, .006, -.002),
        new Vector3(.050, -.004, 0),
      ],
      .0065,
      headRoot,
      browMaterial,
      profileId,
      8,
    );
    brow.position.set(
      side * eyeX,
      .176,
      -.409,
    );
    brow.rotation.z =
      side < 0 ? -.035 : .035;
    brows.push(brow);

    const cheek = sphere(
      scene,
      rootName + "-toy-blush-" + sideName,
      .050 * profile.cheekScale,
      10,
      headRoot,
      blushMaterial,
      profileId,
    );
    cheek.position.set(
      side * .245 * profile.faceWidth,
      -.090,
      -.410,
    );
    cheek.scaling.set(1.06, .22, .08);
    cheek.visibility = .14;
    blush.push(cheek);
  }

  const nose = sphere(
    scene,
    rootName + "-toy-nose",
    .052 * profile.noseScale,
    12,
    headRoot,
    skinMaterial,
    profileId,
  );
  nose.position.set(0, -.060, -.440);
  nose.scaling.set(.64, .66, .38);

  const mouth = sphere(
    scene,
    rootName + "-toy-mouth",
    .155 * profile.mouthWidth,
    14,
    headRoot,
    smileMaterial,
    profileId,
  );
  mouth.position.set(0, -.160, -.424);
  mouth.scaling.set(1.08, .14, .08);

  const teeth = sphere(
    scene,
    rootName + "-toy-teeth",
    .064,
    12,
    headRoot,
    teethMaterial,
    profileId,
  );
  teeth.position.set(0, -.146, -.435);
  teeth.scaling.set(1.18, .12, .05);
  teeth.setEnabled(false);

  return {
    sclera,
    irises,
    pupils,
    highlights,
    brows,
    blush,
    mouth,
    teeth,
  };
}

export function applyToyCharacterOverhaul(
  scene: Scene,
  rig: CharacterRig,
  profile: HeroCharacterProfile,
): void {
  const metadata =
    (rig.root.metadata ?? {}) as Record<string, unknown>;

  if (metadata.toyCharacterOverhaul === "CHAR.2C") {
    return;
  }

  const headRootNode =
    rig.semantic.head.parent;

  if (!(headRootNode instanceof TransformNode)) {
    throw new Error(
      "Character head pivot is missing for " + profile.id + ".",
    );
  }

  rig.root.metadata = {
    ...metadata,
    npcToyOverhaul: "CHAR.2C",
    npcToyProfileId: profile.id,
    toyCharacterOverhaul: "CHAR.2C",
    toyCharacterProfileId: profile.id,
  };

  const rootName = rig.root.name;
  const headRoot = headRootNode;

  hideReplacedHeadMeshes(rootName, rig);

  const skinColor =
    new Color3(...profile.skin);

  const hairColor =
    new Color3(...profile.hair);

  const accentColor =
    new Color3(...profile.accent);

  const skinMaterial =
    rig.semantic.head.material
    ?? createMaterial(
      scene,
      rootName + "-toy-skin-fallback",
      skinColor,
      undefined,
      "skin",
    );

  const whiteMaterial =
    createMaterial(
      scene,
      rootName + "-toy-eye-white-mat",
      new Color3(.98, .96, .92),
      undefined,
      "ceramic",
    );

  const irisMaterial =
    createMaterial(
      scene,
      rootName + "-toy-iris-mat",
      new Color3(...profile.eye),
      undefined,
      "glass",
    );

  const pupilMaterial =
    createMaterial(
      scene,
      rootName + "-toy-pupil-mat",
      new Color3(.055, .035, .045),
      undefined,
      "glass",
    );

  const browMaterial =
    createMaterial(
      scene,
      rootName + "-toy-brow-mat",
      hairColor.scale(.78),
      undefined,
      "hair",
    );

  const blushMaterial =
    createMaterial(
      scene,
      rootName + "-toy-blush-mat",
      Color3.Lerp(
        skinColor,
        accentColor,
        .24,
      ),
      undefined,
      "skin",
    );

  const smileMaterial =
    createMaterial(
      scene,
      rootName + "-toy-smile-mat",
      new Color3(.42, .09, .13),
      undefined,
      "soft-toy",
    );

  const hairMaterial =
    createMaterial(
      scene,
      rootName + "-toy-hair-mat",
      hairColor,
      undefined,
      "hair",
    );

  const accentMaterial =
    createMaterial(
      scene,
      rootName + "-toy-hair-accent-mat",
      accentColor,
      undefined,
      "soft-toy",
    );

  createNpcHair(
    scene,
    rootName,
    headRoot,
    profile,
    hairMaterial,
    accentMaterial,
  );

  const face = createToyFace(
    scene,
    rootName,
    headRoot,
    profile,
    skinMaterial,
    whiteMaterial,
    irisMaterial,
    pupilMaterial,
    browMaterial,
    blushMaterial,
    smileMaterial,
    whiteMaterial,
  );

  let expression: CharacterExpression =
    "neutral";

  let faceClock =
    rootName
      .split("")
      .reduce(
        (total, character) =>
          total + character.charCodeAt(0),
        0,
      )
      * .037;

  const originalSetExpression =
    rig.setExpression.bind(rig);

  const originalUpdate =
    rig.update.bind(rig);

  const applyFaceState = (): void => {
    const sleeping =
      rig.isSleeping();

    const blinking =
      !sleeping
      && expression !== "sleepy"
      && (faceClock % 3.9) < .10;

    const expressionOpen =
      expression === "sleepy"
        ? .20
        : expression === "excited"
          || expression === "surprised"
          ? 1.12
          : 1;

    const eyeOpen =
      sleeping
        ? .06
        : blinking
          ? .075
          : expressionOpen;

    face.sclera.forEach((eye) => {
      eye.scaling.y = eyeOpen;
    });

    face.irises.forEach((iris, index) => {
      iris.scaling.y =
        1.04 * eyeOpen;

      iris.setEnabled(
        eyeOpen > .13,
      );

      face.pupils[index].scaling.y =
        1.03 * eyeOpen;

      face.pupils[index].setEnabled(
        eyeOpen > .13,
      );

      face.highlights[index].setEnabled(
        eyeOpen > .28,
      );
    });

    face.blush.forEach((cheek) => {
      cheek.setEnabled(
        expression === "happy"
        || expression === "excited",
      );
    });

    const [
      leftBrow,
      rightBrow,
    ] = face.brows;

    leftBrow.position.y = .176;
    rightBrow.position.y = .176;
    leftBrow.rotation.z = -.035;
    rightBrow.rotation.z = .035;

    if (expression === "excited") {
      leftBrow.position.y = .206;
      rightBrow.position.y = .206;
      leftBrow.rotation.z = -.09;
      rightBrow.rotation.z = .09;
    }
    else if (expression === "surprised") {
      leftBrow.position.y = .230;
      rightBrow.position.y = .230;
    }
    else if (expression === "sleepy") {
      leftBrow.position.y = .154;
      rightBrow.position.y = .154;
      leftBrow.rotation.z = .02;
      rightBrow.rotation.z = -.02;
    }

    face.mouth.position.set(
      0,
      -.160,
      -.424,
    );

    if (
      expression === "happy"
      || expression === "excited"
    ) {
      face.mouth.scaling.set(
        expression === "excited"
          ? 1.46
          : 1.32,
        expression === "excited"
          ? .34
          : .26,
        .08,
      );
      face.mouth.rotation.z = -.04;
      face.teeth.setEnabled(true);
    }
    else if (expression === "surprised") {
      face.mouth.scaling.set(.52, .76, .10);
      face.mouth.rotation.z = 0;
      face.teeth.setEnabled(false);
    }
    else if (expression === "sleepy") {
      face.mouth.scaling.set(.82, .11, .07);
      face.mouth.rotation.z = 0;
      face.teeth.setEnabled(false);
    }
    else {
      face.mouth.scaling.set(1.08, .14, .08);
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

  rig.update = (
    deltaSeconds: number,
  ): void => {
    faceClock += deltaSeconds;
    originalUpdate(deltaSeconds);
    applyFaceState();
  };

  applyFaceState();
}

export function applyNpcToyOverhaul(
  scene: Scene,
  rig: CharacterRig,
  profile: HeroCharacterProfile,
): void {
  applyToyCharacterOverhaul(
    scene,
    rig,
    profile,
  );
}
