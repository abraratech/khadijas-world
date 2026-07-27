import {
  Color3,
  Mesh,
  MeshBuilder,
  type Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { applyMaterialFinish, type MaterialFinish } from "../shared/createMaterials";
import type { CharacterRig } from "./createCharacterVisual";
import type { HeroCharacterProfile } from "./heroCharacterProfiles";

const color = (value: readonly [number, number, number]): Color3 => new Color3(...value);

function heroMaterial(
  scene: Scene,
  name: string,
  diffuse: readonly [number, number, number],
  finish: MaterialFinish = "soft-toy",
): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = color(diffuse);
  material.ambientColor = color(diffuse).scale(.10);
  applyMaterialFinish(material, finish);
  return material;
}

function sphere(
  scene: Scene,
  name: string,
  diameter: number,
  position: Vector3,
  scale: Vector3,
  material: StandardMaterial,
  parent: TransformNode,
  segments = 10,
): Mesh {
  const mesh = MeshBuilder.CreateSphere(name, { diameter, segments }, scene);
  mesh.position.copyFrom(position);
  mesh.scaling.copyFrom(scale);
  mesh.material = material;
  mesh.parent = parent;
  mesh.isPickable = false;
  return mesh;
}

function box(
  scene: Scene,
  name: string,
  size: Vector3,
  position: Vector3,
  material: StandardMaterial,
  parent: TransformNode,
): Mesh {
  const mesh = MeshBuilder.CreateBox(name, {
    width: size.x,
    height: size.y,
    depth: size.z,
  }, scene);
  mesh.position.copyFrom(position);
  mesh.material = material;
  mesh.parent = parent;
  mesh.isPickable = false;
  return mesh;
}

function cylinder(
  scene: Scene,
  name: string,
  diameter: number,
  height: number,
  position: Vector3,
  material: StandardMaterial,
  parent: TransformNode,
  tessellation = 14,
): Mesh {
  const mesh = MeshBuilder.CreateCylinder(name, {
    diameter,
    height,
    tessellation,
  }, scene);
  mesh.position.copyFrom(position);
  mesh.material = material;
  mesh.parent = parent;
  mesh.isPickable = false;
  return mesh;
}

function torus(
  scene: Scene,
  name: string,
  diameter: number,
  thickness: number,
  position: Vector3,
  material: StandardMaterial,
  parent: TransformNode,
): Mesh {
  const mesh = MeshBuilder.CreateTorus(name, { diameter, thickness, tessellation: 18 }, scene);
  mesh.position.copyFrom(position);
  mesh.material = material;
  mesh.parent = parent;
  mesh.isPickable = false;
  return mesh;
}

function setExistingMaterialColor(
  rig: CharacterRig,
  matcher: (name: string) => boolean,
  next: Color3,
): void {
  const seen = new Set<StandardMaterial>();
  for (const mesh of rig.root.getChildMeshes(false)) {
    if (!matcher(mesh.name)) continue;
    if (!(mesh.material instanceof StandardMaterial) || seen.has(mesh.material)) continue;
    seen.add(mesh.material);
    mesh.material.diffuseColor.copyFrom(next);
    mesh.material.ambientColor.copyFrom(next.scale(.10));
    applyMaterialFinish(mesh.material, "auto");
  }
}

function hideLegacyHair(rig: CharacterRig): void {
  for (const mesh of rig.root.getChildMeshes(false)) {
    const name = mesh.name.toLowerCase();
    if (
      name.includes("hair-cap")
      || name.includes("front-curl")
      || name.includes("-curl-")
      || name.includes("-bun-")
      || name.includes("bun-band")
      || name.includes("headband")
      || name.includes("-bow-")
    ) {
      mesh.setEnabled(false);
    }
  }
}

function applyProfileProportions(
  scene: Scene,
  rig: CharacterRig,
  profile: HeroCharacterProfile,
  bodyRoot: TransformNode,
  headRoot: TransformNode,
): void {
  const torsoDelta = profile.torsoHeight - 1;

  // Scale the complete head pivot rather than the head mesh alone. This keeps
  // hair, eyes, ears, and accessories registered to the same facial volume.
  headRoot.scaling.x *= profile.headScale * profile.faceWidth;
  headRoot.scaling.y *= profile.headScale * profile.headHeight;
  headRoot.scaling.z *= profile.headScale * profile.headDepth;
  headRoot.position.y += torsoDelta * .44;

  rig.semantic.body.scaling.x *= profile.bodyWidth;
  rig.semantic.body.scaling.y *= profile.torsoHeight;

  for (const [index, arm] of rig.semantic.arms.entries()) {
    const side = index === 0 ? -1 : 1;
    arm.position.x = side * .34 * profile.shoulderWidth;
    arm.position.y += torsoDelta * .38;
    arm.scaling.y *= profile.armLength;
  }

  for (const hand of rig.semantic.hands) {
    hand.scaling.scaleInPlace(profile.handScale);
  }

  for (const mesh of rig.root.getChildMeshes(false)) {
    const name = mesh.name.toLowerCase();
    const side = mesh.position.x < 0 ? -1 : 1;

    if (name.includes("-eye-white-") || name.includes("-pupil-")) {
      mesh.position.x = side * .18 * profile.eyeSpacing;
      mesh.scaling.x *= profile.eyeScale;
    } else if (name.includes("-cheek-")) {
      mesh.position.x = side * .285 * profile.faceWidth;
      mesh.scaling.x *= profile.cheekScale;
      mesh.scaling.y *= Math.sqrt(profile.cheekScale);
    } else if (name.includes("-nose")) {
      mesh.scaling.scaleInPlace(profile.noseScale);
    } else if (name.includes("-mouth") || name.includes("smile-highlight")) {
      mesh.scaling.x *= profile.mouthWidth;
    }

    if (name.includes("-shoe-")) {
      mesh.scaling.x *= profile.footScale;
      mesh.scaling.z *= profile.footScale;
    }
  }

  const leftLeg = scene.getTransformNodeByName(`${rig.root.name}-left-leg-pivot`);
  const rightLeg = scene.getTransformNodeByName(`${rig.root.name}-right-leg-pivot`);
  for (const leg of [leftLeg, rightLeg]) {
    if (!leg) continue;
    leg.scaling.y *= profile.legLength;
    // Keep the sole near the ground while changing leg length.
    leg.position.y = .01 + .66 * profile.legLength;
  }

  // Torso-length changes should not alter the root transform or gameplay
  // anchors. Only the visual rig is adjusted.
  bodyRoot.metadata = {
    ...bodyRoot.metadata,
    heroTorsoHeight: profile.torsoHeight,
  };
}

function addHair(
  scene: Scene,
  rootName: string,
  head: TransformNode,
  profile: HeroCharacterProfile,
  hair: StandardMaterial,
  accent: StandardMaterial,
): void {
  const cap = MeshBuilder.CreateSphere(
    `${rootName}-hero-hair-cap`,
    { diameter: .92, segments: 16, slice: .60 },
    scene,
  );
  cap.position.set(0, .18, .025);
  cap.rotation.x = Math.PI;
  cap.material = hair;
  cap.parent = head;
  cap.isPickable = false;

  const addLock = (
    suffix: string,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
  ): void => {
    sphere(
      scene,
      `${rootName}-hero-hair-${suffix}`,
      .32,
      new Vector3(x, y, z),
      new Vector3(sx, sy, sz),
      hair,
      head,
      10,
    );
  };

  switch (profile.hairStyle) {
    case "double-buns":
      for (const x of [-.36, .36]) {
        sphere(
          scene,
          `${rootName}-hero-bun-${x}`,
          .39,
          new Vector3(x, .31, .04),
          new Vector3(1, 1.05, .9),
          hair,
          head,
          12,
        );
        const band = torus(
          scene,
          `${rootName}-hero-bun-band-${x}`,
          .27,
          .045,
          new Vector3(x, .24, .015),
          accent,
          head,
        );
        band.rotation.x = Math.PI / 2;
      }
      addLock("fringe-left", -.13, .32, -.22, 1.15, .72, .55);
      addLock("fringe-right", .13, .32, -.22, 1.15, .72, .55);
      break;
    case "fluffy-crop":
      for (const [index, x] of [-.32, -.20, -.07, .07, .20, .32].entries()) {
        addLock(`fluff-${index}`, x, .31 - Math.abs(x) * .18, -.16, 1.05, .95, .72);
      }
      addLock("side-left", -.39, .10, .02, .66, 1.20, .70);
      addLock("side-right", .39, .10, .02, .66, 1.20, .70);
      break;
    case "layered-bob":
    case "silver-bob":
      for (const [index, values] of [
        [-.39, .02, .02, .68, 1.55, .72],
        [.39, .02, .02, .68, 1.55, .72],
        [-.29, -.27, .12, .84, 1.28, .80],
        [.29, -.27, .12, .84, 1.28, .80],
      ].entries()) {
        addLock(`bob-${index}`, ...values as [number, number, number, number, number, number]);
      }
      addLock("side-fringe", -.19, .31, -.20, 1.10, .68, .56);
      break;
    case "low-bun":
      sphere(
        scene,
        `${rootName}-hero-low-bun`,
        .36,
        new Vector3(0, -.12, .38),
        new Vector3(1.12, 1.06, .86),
        hair,
        head,
        12,
      );
      addLock("temple-left", -.36, .03, -.05, .62, 1.38, .58);
      addLock("temple-right", .36, .03, -.05, .62, 1.38, .58);
      break;
    case "wrapped-scarf": {
      cap.scaling.set(1.04, .95, 1.04);
      cap.material = accent;
      const band = torus(
        scene,
        `${rootName}-hero-scarf-band`,
        .78,
        .075,
        new Vector3(0, .17, -.02),
        accent,
        head,
      );
      band.rotation.x = Math.PI / 2;
      const tail = box(
        scene,
        `${rootName}-hero-scarf-tail`,
        new Vector3(.19, .55, .08),
        new Vector3(.30, -.23, .25),
        accent,
        head,
      );
      tail.rotation.z = -.18;
      break;
    }
    case "garden-crop":
    case "neat-crop":
      cap.scaling.y = profile.hairStyle === "neat-crop" ? .76 : .84;
      addLock("crop-left", -.22, .32, -.18, 1.12, .72, .58);
      addLock("crop-center", 0, .36, -.19, 1.18, .76, .58);
      addLock("crop-right", .22, .32, -.18, 1.12, .72, .58);
      break;
  }
}

function addFaceDetails(
  scene: Scene,
  rootName: string,
  head: TransformNode,
  profile: HeroCharacterProfile,
  skin: StandardMaterial,
  iris: StandardMaterial,
  white: StandardMaterial,
  hair: StandardMaterial,
  dark: StandardMaterial,
  lip: StandardMaterial,
): void {
  const eyeX = .18 * profile.eyeSpacing;

  for (const x of [-eyeX, eyeX]) {
    const side = x < 0 ? -1 : 1;
    sphere(
      scene,
      `${rootName}-hero-ear-${side}`,
      .15,
      new Vector3(side * .43, -.015, -.01),
      new Vector3(.72, 1.05, .56).scale(profile.earScale),
      skin,
      head,
      9,
    );
    sphere(
      scene,
      `${rootName}-hero-iris-${side}`,
      .070,
      new Vector3(x, .025, -.466),
      new Vector3(profile.eyeScale, 1, .34),
      iris,
      head,
      9,
    );
    sphere(
      scene,
      `${rootName}-hero-eye-shine-${side}`,
      .024,
      new Vector3(x - .014, .052, -.489),
      new Vector3(1, 1, .30),
      white,
      head,
      7,
    );

    if (profile.age !== "adult" || profile.accessory === "earrings") {
      const lash = box(
        scene,
        `${rootName}-hero-lash-${side}`,
        new Vector3(.10 * profile.eyeScale, .016, .018),
        new Vector3(x, .105, -.466),
        hair,
        head,
      );
      lash.rotation.z = side * .10;
    }
  }

  // Small nostrils and mouth corners stay readable at gameplay distance without
  // turning the face into a high-detail or texture-dependent asset.
  for (const x of [-.022, .022]) {
    sphere(
      scene,
      `${rootName}-hero-nostril-${x}`,
      .018 * profile.noseScale,
      new Vector3(x, -.068, -.469),
      new Vector3(.78, .55, .30),
      dark,
      head,
      6,
    );
  }

  for (const side of [-1, 1]) {
    sphere(
      scene,
      `${rootName}-hero-mouth-corner-${side}`,
      .028,
      new Vector3(side * .11 * profile.mouthWidth, -.16, -.442),
      new Vector3(.72, .62, .32),
      lip,
      head,
      7,
    );
  }
}

function addBodyDetails(
  scene: Scene,
  rootName: string,
  bodyRoot: TransformNode,
  rig: CharacterRig,
  profile: HeroCharacterProfile,
  skin: StandardMaterial,
): void {
  const torsoDelta = profile.torsoHeight - 1;
  cylinder(
    scene,
    `${rootName}-hero-neck`,
    .22 * profile.neckWidth,
    .18,
    new Vector3(0, 1.49 + torsoDelta * .42, 0),
    skin,
    bodyRoot,
  );

  for (const [index, arm] of rig.semantic.arms.entries()) {
    const inward = index === 0 ? .068 : -.068;
    sphere(
      scene,
      `${rootName}-hero-thumb-${index}`,
      .10,
      new Vector3(inward, -.50, -.015),
      new Vector3(.58, .82, .70).scale(profile.handScale),
      skin,
      arm,
      8,
    );
  }
}

function addClothing(
  scene: Scene,
  rootName: string,
  bodyRoot: TransformNode,
  profile: HeroCharacterProfile,
  primary: StandardMaterial,
  secondary: StandardMaterial,
  accent: StandardMaterial,
  white: StandardMaterial,
): void {
  const collar = torus(
    scene,
    `${rootName}-hero-collar`,
    .49,
    .045,
    new Vector3(0, 1.34, -.01),
    secondary,
    bodyRoot,
  );
  collar.rotation.x = Math.PI / 2;
  collar.scaling.z = .68;

  if (profile.clothingStyle !== "hoodie") {
    for (const mesh of bodyRoot.getChildMeshes(false)) {
      const name = mesh.name.toLowerCase();
      if (
        name.includes("drawstring")
        || name.includes("-pocket")
        || name.includes("-flower-")
        || name.includes("-star-")
        || name.includes("-heart-")
      ) {
        mesh.setEnabled(false);
      }
    }
  }

  if (profile.clothingStyle === "dress" || profile.clothingStyle === "tunic") {
    const hem = MeshBuilder.CreateCylinder(
      `${rootName}-hero-${profile.clothingStyle}-hem`,
      {
        diameterTop: profile.clothingStyle === "dress" ? .58 : .62,
        diameterBottom: profile.clothingStyle === "dress" ? .88 : .76,
        height: profile.clothingStyle === "dress" ? .56 : .42,
        tessellation: 18,
      },
      scene,
    );
    hem.position.set(0, .55, 0);
    hem.material = primary;
    hem.parent = bodyRoot;
    hem.isPickable = false;

    const hemBand = torus(
      scene,
      `${rootName}-hero-hem-band`,
      profile.clothingStyle === "dress" ? .80 : .69,
      .035,
      new Vector3(0, .29, 0),
      accent,
      bodyRoot,
    );
    hemBand.rotation.x = Math.PI / 2;
  }

  if (profile.clothingStyle === "apron") {
    const bib = box(
      scene,
      `${rootName}-hero-apron-bib`,
      new Vector3(.47, .58, .045),
      new Vector3(0, .98, -.325),
      secondary,
      bodyRoot,
    );
    bib.rotation.x = -.03;
    box(
      scene,
      `${rootName}-hero-apron-pocket`,
      new Vector3(.31, .18, .025),
      new Vector3(0, .78, -.355),
      accent,
      bodyRoot,
    );
    for (const x of [-.20, .20]) {
      const strap = box(
        scene,
        `${rootName}-hero-apron-strap-${x}`,
        new Vector3(.045, .45, .025),
        new Vector3(x, 1.25, -.30),
        secondary,
        bodyRoot,
      );
      strap.rotation.z = x < 0 ? -.08 : .08;
    }
  }

  if (profile.clothingStyle === "cardigan") {
    for (const x of [-.14, .14]) {
      const panel = box(
        scene,
        `${rootName}-hero-cardigan-${x}`,
        new Vector3(.22, .68, .035),
        new Vector3(x, .98, -.326),
        primary,
        bodyRoot,
      );
      panel.rotation.z = x < 0 ? -.035 : .035;
    }
    for (const y of [.77, .94, 1.11]) {
      sphere(
        scene,
        `${rootName}-hero-cardigan-button-${y}`,
        .055,
        new Vector3(0, y, -.36),
        new Vector3(1, 1, .32),
        accent,
        bodyRoot,
        7,
      );
    }
  }

  if (profile.clothingStyle === "work-shirt") {
    for (const x of [-.12, .12]) {
      const lapel = box(
        scene,
        `${rootName}-hero-shirt-lapel-${x}`,
        new Vector3(.17, .25, .032),
        new Vector3(x, 1.24, -.326),
        secondary,
        bodyRoot,
      );
      lapel.rotation.z = x < 0 ? -.32 : .32;
    }
    box(
      scene,
      `${rootName}-hero-shirt-pocket`,
      new Vector3(.20, .17, .028),
      new Vector3(.15, 1.02, -.355),
      secondary,
      bodyRoot,
    );
  }

  if (profile.clothingStyle === "hoodie") {
    const hood = torus(
      scene,
      `${rootName}-hero-hood`,
      .62,
      .085,
      new Vector3(0, 1.36, .06),
      primary,
      bodyRoot,
    );
    hood.rotation.x = Math.PI / 2;
    hood.scaling.z = .76;
  }

  // Soft shoulder caps and cuffs make the segmented rig feel intentional.
  for (const [index, arm] of bodyRoot.getChildren().filter((node: { name: string }) => node.name.includes("arm-pivot")).entries()) {
    if (!(arm instanceof TransformNode)) continue;
    sphere(
      scene,
      `${rootName}-hero-shoulder-${index}`,
      .24,
      Vector3.Zero(),
      new Vector3(1.08, .90, .95),
      primary,
      arm,
      9,
    );
    torus(
      scene,
      `${rootName}-hero-cuff-${index}`,
      .18,
      .028,
      new Vector3(0, -.44, 0),
      secondary,
      arm,
    );
  }

  // Thin stitch line for depth at normal gameplay zoom.
  box(
    scene,
    `${rootName}-hero-outfit-stitch`,
    new Vector3(.015, .48, .018),
    new Vector3(0, .98, -.352),
    white,
    bodyRoot,
  );
}

function addAccessory(
  scene: Scene,
  rootName: string,
  head: TransformNode,
  body: TransformNode,
  profile: HeroCharacterProfile,
  accent: StandardMaterial,
  secondary: StandardMaterial,
  white: StandardMaterial,
  dark: StandardMaterial,
): void {
  switch (profile.accessory) {
    case "bow":
      for (const x of [-.07, .07]) {
        sphere(
          scene,
          `${rootName}-hero-bow-${x}`,
          .17,
          new Vector3(.27 + x, .43, -.22),
          new Vector3(1.28, .72, .40),
          accent,
          head,
          8,
        );
      }
      break;
    case "earrings":
      for (const x of [-.44, .44]) {
        sphere(
          scene,
          `${rootName}-hero-earring-${x}`,
          .065,
          new Vector3(x, -.09, -.04),
          new Vector3(1, 1.15, .65),
          accent,
          head,
          8,
        );
      }
      break;
    case "chef-cap": {
      const band = MeshBuilder.CreateCylinder(
        `${rootName}-hero-chef-band`,
        { diameter: .61, height: .14, tessellation: 16 },
        scene,
      );
      band.position.set(0, .48, .01);
      band.material = white;
      band.parent = head;
      band.isPickable = false;
      for (const x of [-.18, 0, .18]) {
        sphere(
          scene,
          `${rootName}-hero-chef-puff-${x}`,
          .31,
          new Vector3(x, .63 + (x === 0 ? .04 : 0), .02),
          new Vector3(1.02, .92, .90),
          white,
          head,
          10,
        );
      }
      break;
    }
    case "garden-hat": {
      const brim = torus(
        scene,
        `${rootName}-hero-hat-brim`,
        .90,
        .12,
        new Vector3(0, .44, .02),
        secondary,
        head,
      );
      brim.scaling.y = .70;
      const crown = MeshBuilder.CreateCylinder(
        `${rootName}-hero-hat-crown`,
        { diameterTop: .48, diameterBottom: .59, height: .30, tessellation: 16 },
        scene,
      );
      crown.position.set(0, .58, .03);
      crown.material = secondary;
      crown.parent = head;
      crown.isPickable = false;
      const ribbon = torus(
        scene,
        `${rootName}-hero-hat-ribbon`,
        .54,
        .035,
        new Vector3(0, .49, .03),
        accent,
        head,
      );
      ribbon.rotation.x = Math.PI / 2;
      break;
    }
    case "scarf": {
      const scarf = torus(
        scene,
        `${rootName}-hero-neck-scarf`,
        .52,
        .075,
        new Vector3(0, 1.35, 0),
        accent,
        body,
      );
      scarf.rotation.x = Math.PI / 2;
      const tail = box(
        scene,
        `${rootName}-hero-neck-scarf-tail`,
        new Vector3(.18, .48, .045),
        new Vector3(.17, 1.09, -.34),
        accent,
        body,
      );
      tail.rotation.z = -.16;
      break;
    }
    case "glasses":
      for (const x of [-.18, .18]) {
        const lens = torus(
          scene,
          `${rootName}-hero-glasses-${x}`,
          .21,
          .025,
          new Vector3(x, .04, -.47),
          dark,
          head,
        );
        lens.rotation.x = Math.PI / 2;
      }
      box(
        scene,
        `${rootName}-hero-glasses-bridge`,
        new Vector3(.15, .025, .02),
        new Vector3(0, .04, -.47),
        dark,
        head,
      );
      break;
    case "name-badge":
      box(
        scene,
        `${rootName}-hero-name-badge`,
        new Vector3(.22, .12, .03),
        new Vector3(.18, 1.12, -.36),
        white,
        body,
      );
      sphere(
        scene,
        `${rootName}-hero-name-badge-dot`,
        .055,
        new Vector3(.18, 1.12, -.385),
        new Vector3(1, 1, .30),
        accent,
        body,
        7,
      );
      break;
    case "none":
      break;
  }
}

export function applyHeroCharacterPolish(
  scene: Scene,
  rig: CharacterRig,
  profile: HeroCharacterProfile,
): void {
  const bodyRoot = rig.semantic.body.parent;
  const headRoot = rig.semantic.head.parent;
  if (!(bodyRoot instanceof TransformNode) || !(headRoot instanceof TransformNode)) return;

  const rootName = rig.root.name;
  const skinColor = color(profile.skin);
  const hairColor = color(profile.hair);
  const primaryColor = color(profile.primary);
  const secondaryColor = color(profile.secondary);
  const accentColor = color(profile.accent);
  const shoeColor = color(profile.shoe);
  const blushColor = Color3.Lerp(skinColor, accentColor, .18);

  setExistingMaterialColor(rig, (name) => (
    name.includes("-head") || name.includes("-hand-") || name.includes("-nose")
  ), skinColor);
  setExistingMaterialColor(rig, (name) => (
    name.includes("hair") || name.includes("curl") || name.includes("bun")
  ), hairColor);
  setExistingMaterialColor(rig, (name) => (
    name.includes("-body") || name.includes("-arm-") || name.includes("-pocket")
  ), primaryColor);
  setExistingMaterialColor(rig, (name) => name.includes("-leg-"), secondaryColor);
  setExistingMaterialColor(rig, (name) => name.includes("-shoe-") && !name.includes("sole"), shoeColor);
  setExistingMaterialColor(rig, (name) => name.includes("-cheek-"), blushColor);
  setExistingMaterialColor(rig, (name) => (
    name.includes("-flower-")
    || name.includes("-star-")
    || name.includes("-heart-")
    || name.includes("headband")
    || name.includes("bow")
    || name.includes("bun-band")
  ), accentColor);

  applyProfileProportions(scene, rig, profile, bodyRoot, headRoot);
  hideLegacyHair(rig);

  const skin = heroMaterial(scene, `${rootName}-hero-skin`, profile.skin, "skin");
  const hair = heroMaterial(scene, `${rootName}-hero-hair`, profile.hair, "hair");
  const iris = heroMaterial(scene, `${rootName}-hero-eye`, profile.eye, "glass");
  const primary = heroMaterial(scene, `${rootName}-hero-primary`, profile.primary, "fabric");
  const secondary = heroMaterial(scene, `${rootName}-hero-secondary`, profile.secondary, "fabric");
  const accent = heroMaterial(scene, `${rootName}-hero-accent`, profile.accent, "soft-toy");
  const shoe = heroMaterial(scene, `${rootName}-hero-shoe`, profile.shoe, "soft-toy");
  const white = heroMaterial(scene, `${rootName}-hero-white`, [.98, .96, .91], "ceramic");
  const dark = heroMaterial(scene, `${rootName}-hero-dark`, [.08, .055, .07], "soft-toy");
  const lip = heroMaterial(scene, `${rootName}-hero-lip`, [.48, .13, .17], "soft-toy");

  addBodyDetails(scene, rootName, bodyRoot, rig, profile, skin);
  addFaceDetails(scene, rootName, headRoot, profile, skin, iris, white, hair, dark, lip);
  addHair(scene, rootName, headRoot, profile, hair, accent);
  addClothing(scene, rootName, bodyRoot, profile, primary, secondary, accent, white);
  addAccessory(scene, rootName, headRoot, bodyRoot, profile, accent, secondary, white, dark);

  // Rounded toe caps and shared shoe material soften the original box shoes
  // without allocating a separate material for every foot.
  for (const mesh of rig.root.getChildMeshes(false)) {
    if (!mesh.name.includes("-shoe-") || mesh.name.includes("sole")) continue;
    if (!(mesh.parent instanceof TransformNode)) continue;
    sphere(
      scene,
      `${mesh.name}-hero-toe`,
      .27,
      new Vector3(0, -.58, -.20),
      new Vector3(1.05 * profile.footScale, .55, 1.32 * profile.footScale),
      shoe,
      mesh.parent,
      10,
    );
    for (const x of [-.055, .055]) {
      const lace = box(
        scene,
        `${mesh.name}-hero-lace-${x}`,
        new Vector3(.025, .015, .16 * profile.footScale),
        new Vector3(x * profile.footScale, -.51, -.22),
        white,
        mesh.parent,
      );
      lace.rotation.x = -.18;
    }
  }

  for (const mesh of rig.root.getChildMeshes(false)) {
    mesh.receiveShadows = true;
    mesh.metadata = {
      ...mesh.metadata,
      heroProcedural: true,
      heroProfileId: profile.id,
      heroRefinement: "ART.1K-B",
    };
  }
}
