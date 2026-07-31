import {
  Color3,
  MeshBuilder,
  type Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import type { CharacterId } from "../characterState";
import type { CharacterRig } from "./createCharacterVisual";

export const AVATAR_OUTFIT_STYLES = [
  "hoodie",
  "dress",
  "tunic",
  "sport",
] as const;

export const AVATAR_OUTFIT_COLORS = [
  "rose",
  "teal",
  "sunshine",
  "violet",
  "sky",
  "mint",
] as const;

export const AVATAR_SHOE_STYLES = [
  "sneakers",
  "boots",
  "flats",
] as const;

export const AVATAR_SHOE_COLORS = [
  "berry",
  "navy",
  "gold",
  "white",
  "mint",
] as const;

export const AVATAR_HAIR_STYLES = [
  "curls",
  "bob",
  "double-buns",
  "ponytail",
] as const;

export const AVATAR_HAIR_COLORS = [
  "espresso",
  "black",
  "chestnut",
  "auburn",
] as const;

export const AVATAR_ACCESSORIES = [
  "bow",
  "headband",
  "flowers",
  "none",
] as const;

export const AVATAR_LIP_COLORS = [
  "natural",
  "rose",
  "berry",
  "coral",
] as const;

export type AvatarOutfitStyle = typeof AVATAR_OUTFIT_STYLES[number];
export type AvatarOutfitColor = typeof AVATAR_OUTFIT_COLORS[number];
export type AvatarShoeStyle = typeof AVATAR_SHOE_STYLES[number];
export type AvatarShoeColor = typeof AVATAR_SHOE_COLORS[number];
export type AvatarHairStyle = typeof AVATAR_HAIR_STYLES[number];
export type AvatarHairColor = typeof AVATAR_HAIR_COLORS[number];
export type AvatarAccessory = typeof AVATAR_ACCESSORIES[number];
export type AvatarLipColor = typeof AVATAR_LIP_COLORS[number];

export interface AvatarCustomization {
  outfitStyle: AvatarOutfitStyle;
  outfitColor: AvatarOutfitColor;
  shoeStyle: AvatarShoeStyle;
  shoeColor: AvatarShoeColor;
  hairStyle: AvatarHairStyle;
  hairColor: AvatarHairColor;
  accessory: AvatarAccessory;
  lipColor: AvatarLipColor;
}

export type AvatarCustomizationField = keyof AvatarCustomization;

export const DEFAULT_AVATAR_CUSTOMIZATION: AvatarCustomization = {
  outfitStyle: "hoodie",
  outfitColor: "rose",
  shoeStyle: "sneakers",
  shoeColor: "berry",
  hairStyle: "curls",
  hairColor: "espresso",
  accessory: "bow",
  lipColor: "natural",
};

const STORAGE_KEY = "khadijas-world.avatar.v1";

const OUTFIT_COLORS: Record<AvatarOutfitColor, Color3> = {
  rose: new Color3(.91, .27, .48),
  teal: new Color3(.12, .54, .49),
  sunshine: new Color3(.96, .65, .16),
  violet: new Color3(.52, .31, .72),
  sky: new Color3(.24, .63, .83),
  mint: new Color3(.42, .78, .65),
};

const SHOE_COLORS: Record<AvatarShoeColor, Color3> = {
  berry: new Color3(.71, .20, .43),
  navy: new Color3(.08, .19, .35),
  gold: new Color3(.88, .56, .12),
  white: new Color3(.94, .93, .89),
  mint: new Color3(.23, .62, .54),
};

const HAIR_COLORS: Record<AvatarHairColor, Color3> = {
  espresso: new Color3(.15, .07, .045),
  black: new Color3(.035, .028, .04),
  chestnut: new Color3(.30, .12, .07),
  auburn: new Color3(.47, .15, .08),
};

const LIP_COLORS: Record<AvatarLipColor, Color3> = {
  natural: new Color3(.42, .07, .11),
  rose: new Color3(.73, .19, .35),
  berry: new Color3(.48, .08, .25),
  coral: new Color3(.89, .28, .27),
};

const isOneOf = <T extends string>(
  value: unknown,
  choices: readonly T[],
): value is T => (
  typeof value === "string"
  && choices.includes(value as T)
);

export function sanitizeAvatarCustomization(
  value: unknown,
): AvatarCustomization {
  const candidate = value && typeof value === "object"
    ? value as Partial<Record<AvatarCustomizationField, unknown>>
    : {};

  return {
    outfitStyle: isOneOf(candidate.outfitStyle, AVATAR_OUTFIT_STYLES)
      ? candidate.outfitStyle
      : DEFAULT_AVATAR_CUSTOMIZATION.outfitStyle,
    outfitColor: isOneOf(candidate.outfitColor, AVATAR_OUTFIT_COLORS)
      ? candidate.outfitColor
      : DEFAULT_AVATAR_CUSTOMIZATION.outfitColor,
    shoeStyle: isOneOf(candidate.shoeStyle, AVATAR_SHOE_STYLES)
      ? candidate.shoeStyle
      : DEFAULT_AVATAR_CUSTOMIZATION.shoeStyle,
    shoeColor: isOneOf(candidate.shoeColor, AVATAR_SHOE_COLORS)
      ? candidate.shoeColor
      : DEFAULT_AVATAR_CUSTOMIZATION.shoeColor,
    hairStyle: isOneOf(candidate.hairStyle, AVATAR_HAIR_STYLES)
      ? candidate.hairStyle
      : DEFAULT_AVATAR_CUSTOMIZATION.hairStyle,
    hairColor: isOneOf(candidate.hairColor, AVATAR_HAIR_COLORS)
      ? candidate.hairColor
      : DEFAULT_AVATAR_CUSTOMIZATION.hairColor,
    accessory: isOneOf(candidate.accessory, AVATAR_ACCESSORIES)
      ? candidate.accessory
      : DEFAULT_AVATAR_CUSTOMIZATION.accessory,
    lipColor: isOneOf(candidate.lipColor, AVATAR_LIP_COLORS)
      ? candidate.lipColor
      : DEFAULT_AVATAR_CUSTOMIZATION.lipColor,
  };
}

interface AvatarStorageShape {
  version: 1;
  characters: Partial<Record<CharacterId, AvatarCustomization>>;
}

function readAvatarStore(): AvatarStorageShape {
  if (typeof window === "undefined") {
    return { version: 1, characters: {} };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, characters: {} };

    const parsed = JSON.parse(raw) as Partial<AvatarStorageShape>;
    const characters = parsed.characters && typeof parsed.characters === "object"
      ? parsed.characters
      : {};

    return {
      version: 1,
      characters,
    };
  } catch {
    return { version: 1, characters: {} };
  }
}

export function loadAvatarCustomization(
  characterId: CharacterId = "khadija",
): AvatarCustomization {
  return sanitizeAvatarCustomization(
    readAvatarStore().characters[characterId],
  );
}

export function saveAvatarCustomization(
  customization: AvatarCustomization,
  characterId: CharacterId = "khadija",
): boolean {
  if (typeof window === "undefined") return false;

  try {
    const store = readAvatarStore();
    store.characters[characterId] = sanitizeAvatarCustomization(customization);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent("khadijas-world:save-status", {
      detail: { saved: true },
    }));
    return true;
  } catch {
    window.dispatchEvent(new CustomEvent("khadijas-world:save-status", {
      detail: { saved: false },
    }));
    return false;
  }
}

function colorMaterial(
  material: StandardMaterial,
  color: Color3,
): void {
  material.diffuseColor.copyFrom(color);
  material.ambientColor.copyFrom(color.scale(.12));
}

function uniqueStandardMaterials(
  rig: CharacterRig,
  predicate: (name: string) => boolean,
): StandardMaterial[] {
  const result: StandardMaterial[] = [];
  const seen = new Set<StandardMaterial>();

  for (const mesh of rig.root.getChildMeshes(false)) {
    if (!predicate(mesh.name.toLowerCase())) continue;
    if (!(mesh.material instanceof StandardMaterial)) continue;
    if (seen.has(mesh.material)) continue;
    seen.add(mesh.material);
    result.push(mesh.material);
  }

  return result;
}

function namedMeshes(
  rig: CharacterRig,
  marker: string,
) {
  return rig.root.getChildMeshes(false).filter((mesh) => (
    mesh.name.includes(marker)
  ));
}

function findNode(
  scene: Scene,
  name: string,
): TransformNode | null {
  return scene.getTransformNodeByName(name);
}

export interface AvatarCustomizer {
  apply(customization: AvatarCustomization): AvatarCustomization;
  current(): AvatarCustomization;
}

export function createAvatarCustomizer(
  scene: Scene,
  rig: CharacterRig,
): AvatarCustomizer {
  const rootName = rig.root.name;
  const visualRoot = rig.semantic.root;
  const headRoot = rig.semantic.head.parent;

  if (!(headRoot instanceof TransformNode)) {
    throw new Error("Avatar customization requires Khadija's head pivot.");
  }

  const outfitMaterial = new StandardMaterial(
    `${rootName}-avatar-outfit-mat`,
    scene,
  );
  const shoeMaterial = new StandardMaterial(
    `${rootName}-avatar-shoe-mat`,
    scene,
  );
  const hairMaterial = new StandardMaterial(
    `${rootName}-avatar-hair-mat`,
    scene,
  );
  const accessoryMaterial = new StandardMaterial(
    `${rootName}-avatar-accessory-mat`,
    scene,
  );
  const lipMaterial = new StandardMaterial(
    `${rootName}-avatar-lip-mat`,
    scene,
  );

  outfitMaterial.specularPower = 42;
  shoeMaterial.specularPower = 52;
  hairMaterial.specularPower = 64;
  accessoryMaterial.specularPower = 48;
  lipMaterial.specularPower = 72;

  const dressSkirt = MeshBuilder.CreateCylinder(
    `${rootName}-avatar-dress-skirt`,
    {
      diameterTop: .54,
      diameterBottom: .88,
      height: .56,
      tessellation: 24,
    },
    scene,
  );
  dressSkirt.position.set(0, .73, 0);
  dressSkirt.material = outfitMaterial;
  dressSkirt.parent = visualRoot;
  dressSkirt.isPickable = false;

  const tunicHem = MeshBuilder.CreateCylinder(
    `${rootName}-avatar-tunic-hem`,
    {
      diameterTop: .58,
      diameterBottom: .76,
      height: .32,
      tessellation: 24,
    },
    scene,
  );
  tunicHem.position.set(0, .76, 0);
  tunicHem.material = outfitMaterial;
  tunicHem.parent = visualRoot;
  tunicHem.isPickable = false;

  const sportStripe = MeshBuilder.CreateTorus(
    `${rootName}-avatar-sport-stripe`,
    {
      diameter: .57,
      thickness: .035,
      tessellation: 28,
    },
    scene,
  );
  sportStripe.position.set(0, 1.07, -.01);
  sportStripe.rotation.x = Math.PI / 2;
  sportStripe.material = accessoryMaterial;
  sportStripe.parent = visualRoot;
  sportStripe.isPickable = false;

  const bunLeft = MeshBuilder.CreateSphere(
    `${rootName}-avatar-bun-left`,
    { diameter: .34, segments: 16 },
    scene,
  );
  bunLeft.position.set(-.36, .32, .08);
  bunLeft.material = hairMaterial;
  bunLeft.parent = headRoot;
  bunLeft.isPickable = false;

  const bunRight = MeshBuilder.CreateSphere(
    `${rootName}-avatar-bun-right`,
    { diameter: .34, segments: 16 },
    scene,
  );
  bunRight.position.set(.36, .32, .08);
  bunRight.material = hairMaterial;
  bunRight.parent = headRoot;
  bunRight.isPickable = false;

  const ponytailRoot = new TransformNode(
    `${rootName}-avatar-ponytail-root`,
    scene,
  );
  ponytailRoot.position.set(.31, .08, .24);
  ponytailRoot.rotation.z = -.18;
  ponytailRoot.parent = headRoot;

  for (const [index, y, size] of [
    [0, .02, .30],
    [1, -.22, .27],
    [2, -.43, .23],
  ] as const) {
    const segment = MeshBuilder.CreateSphere(
      `${rootName}-avatar-ponytail-${index}`,
      { diameter: size, segments: 14 },
      scene,
    );
    segment.position.set(0, y, 0);
    segment.material = hairMaterial;
    segment.parent = ponytailRoot;
    segment.isPickable = false;
  }

  const flowerRoot = new TransformNode(
    `${rootName}-avatar-flowers-root`,
    scene,
  );
  flowerRoot.position.set(-.29, .42, -.18);
  flowerRoot.rotation.z = .10;
  flowerRoot.parent = headRoot;

  for (const [flowerIndex, x] of [-.08, .08].entries()) {
    const flower = new TransformNode(
      `${rootName}-avatar-flower-${flowerIndex}`,
      scene,
    );
    flower.position.x = x;
    flower.parent = flowerRoot;

    for (let petalIndex = 0; petalIndex < 5; petalIndex += 1) {
      const angle = petalIndex / 5 * Math.PI * 2;
      const petal = MeshBuilder.CreateSphere(
        `${rootName}-avatar-flower-${flowerIndex}-petal-${petalIndex}`,
        { diameter: .075, segments: 8 },
        scene,
      );
      petal.position.set(
        Math.cos(angle) * .055,
        Math.sin(angle) * .055,
        0,
      );
      petal.scaling.set(1.2, .72, .38);
      petal.material = accessoryMaterial;
      petal.parent = flower;
      petal.isPickable = false;
    }
  }

  const leftBoot = MeshBuilder.CreateCylinder(
    `${rootName}-avatar-boot-left`,
    {
      diameterTop: .25,
      diameterBottom: .27,
      height: .30,
      tessellation: 18,
    },
    scene,
  );
  const rightBoot = MeshBuilder.CreateCylinder(
    `${rootName}-avatar-boot-right`,
    {
      diameterTop: .25,
      diameterBottom: .27,
      height: .30,
      tessellation: 18,
    },
    scene,
  );

  const leftLeg = findNode(scene, `${rootName}-left-leg-pivot`);
  const rightLeg = findNode(scene, `${rootName}-right-leg-pivot`);

  leftBoot.position.set(0, -.46, -.02);
  leftBoot.material = shoeMaterial;
  leftBoot.parent = leftLeg;
  leftBoot.isPickable = false;

  rightBoot.position.copyFrom(leftBoot.position);
  rightBoot.material = shoeMaterial;
  rightBoot.parent = rightLeg;
  rightBoot.isPickable = false;

  const originalHairMaterials = uniqueStandardMaterials(
    rig,
    (name) => (
      name.includes("unified-hair")
      || name.includes("unified-curl")
      || name.includes("unified-brow")
    ),
  );

  const originalOutfitMaterials = uniqueStandardMaterials(
    rig,
    (name) => (
      name.includes("unified-outfit")
      || name.includes("unified-hood")
      || name.includes("unified-shoulder")
      || name.includes("-arm-")
    ),
  );

  const originalShoeMaterials = uniqueStandardMaterials(
    rig,
    (name) => (
      name.includes("unified-shoe")
      && !name.includes("sole")
    ),
  );

  const originalLipMaterials = uniqueStandardMaterials(
    rig,
    (name) => name.includes("unified-mouth"),
  );

  const curls = namedMeshes(rig, `${rootName}-unified-curl-`);
  const shoes = namedMeshes(rig, `${rootName}-unified-shoe-`);
  const hood = namedMeshes(rig, `${rootName}-unified-hood`);
  const lower = namedMeshes(rig, `${rootName}-unified-outfit-lower`);
  const hem = namedMeshes(rig, `${rootName}-unified-outfit-hem`);
  const headband = scene.getMeshByName(`${rootName}-unified-headband-tube`);
  const bowRoot = findNode(scene, `${rootName}-unified-bow-root`);

  let active = { ...DEFAULT_AVATAR_CUSTOMIZATION };

  const apply = (next: AvatarCustomization): AvatarCustomization => {
    active = sanitizeAvatarCustomization(next);

    const outfitColor = OUTFIT_COLORS[active.outfitColor];
    const shoeColor = SHOE_COLORS[active.shoeColor];
    const hairColor = HAIR_COLORS[active.hairColor];
    const lipColor = LIP_COLORS[active.lipColor];
    const accessoryColor = active.outfitColor === "sunshine"
      ? new Color3(.96, .35, .56)
      : new Color3(
          Math.min(1, outfitColor.r + .12),
          Math.min(1, outfitColor.g + .12),
          Math.min(1, outfitColor.b + .12),
        );

    colorMaterial(outfitMaterial, outfitColor);
    colorMaterial(shoeMaterial, shoeColor);
    colorMaterial(hairMaterial, hairColor);
    colorMaterial(accessoryMaterial, accessoryColor);
    colorMaterial(lipMaterial, lipColor);

    for (const material of originalOutfitMaterials) colorMaterial(material, outfitColor);
    for (const material of originalShoeMaterials) colorMaterial(material, shoeColor);
    for (const material of originalHairMaterials) colorMaterial(material, hairColor);
    for (const material of originalLipMaterials) colorMaterial(material, lipColor);

    dressSkirt.setEnabled(active.outfitStyle === "dress");
    tunicHem.setEnabled(active.outfitStyle === "tunic");
    sportStripe.setEnabled(active.outfitStyle === "sport");

    for (const mesh of hood) {
      mesh.setEnabled(active.outfitStyle === "hoodie");
    }

    for (const mesh of lower) {
      mesh.scaling.set(
        active.outfitStyle === "sport" ? .90 : 1,
        active.outfitStyle === "dress" ? .82 : 1,
        .82,
      );
    }

    for (const mesh of hem) {
      mesh.setEnabled(
        active.outfitStyle !== "dress"
        && active.outfitStyle !== "tunic"
      );
      mesh.scaling.set(
        active.outfitStyle === "sport" ? .92 : 1.02,
        active.outfitStyle === "tunic" ? .30 : .42,
        .80,
      );
    }

    const showCurls = active.hairStyle === "curls";
    const showBob = active.hairStyle === "bob";

    curls.forEach((curl, index) => {
      curl.setEnabled(showCurls || (showBob && index < 4));
      curl.scaling.setAll(showBob ? .88 : 1);
    });

    bunLeft.setEnabled(active.hairStyle === "double-buns");
    bunRight.setEnabled(active.hairStyle === "double-buns");
    ponytailRoot.setEnabled(active.hairStyle === "ponytail");

    const showBow = active.accessory === "bow";
    const showHeadband = showBow || active.accessory === "headband";
    headband?.setEnabled(showHeadband);
    bowRoot?.setEnabled(showBow);
    flowerRoot.setEnabled(active.accessory === "flowers");

    leftBoot.setEnabled(active.shoeStyle === "boots");
    rightBoot.setEnabled(active.shoeStyle === "boots");

    for (const shoe of shoes) {
      const styleScale = active.shoeStyle === "flats"
        ? new Vector3(.92, .34, 1.13)
        : active.shoeStyle === "boots"
          ? new Vector3(.98, .48, 1.20)
          : new Vector3(.96, .54, 1.28);
      shoe.scaling.copyFrom(styleScale);
      shoe.position.y = active.shoeStyle === "flats" ? -.61 : -.575;
    }

    rig.root.metadata = {
      ...rig.root.metadata,
      avatarCustomization: { ...active },
    };

    return { ...active };
  };

  return {
    apply,
    current: () => ({ ...active }),
  };
}
