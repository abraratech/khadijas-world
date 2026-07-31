import {
  Animation,
  type Mesh,
  MeshBuilder,
  type Scene,
  type StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { box } from "../../shared/meshHelpers";
import {
  addSoftShadow,
  roundedFootprint,
} from "./homeVisualHelpers";

export interface FamilyHomeFridgeMaterials {
  body: StandardMaterial;
  door: StandardMaterial;
  liner: StandardMaterial;
  interior: StandardMaterial;
  metal: StandardMaterial;
  accent: StandardMaterial;
  secondary: StandardMaterial;
  shadow: StandardMaterial;
}

export interface FamilyHomeFridgeVisual {
  root: TransformNode;
  doorPivot: TransformNode;
  door: Mesh;
  interior: TransformNode;
}

function decorative(mesh: Mesh): Mesh {
  mesh.isPickable = false;
  mesh.receiveShadows = true;
  return mesh;
}

export function buildFamilyHomeFridge(
  scene: Scene,
  parent: TransformNode,
  detailMeshes: Mesh[],
  materials: FamilyHomeFridgeMaterials,
): FamilyHomeFridgeVisual {
  addSoftShadow(
    scene,
    "fridge-shadow",
    new Vector3(2.3, .015, 2.95),
    new Vector3(.86, 1, .68),
    materials.shadow,
    detailMeshes,
    parent,
  );

  const root =
    new TransformNode("fridge-root", scene);

  root.position.set(2.3, 0, 2.95);
  root.parent = parent;
  root.metadata = {
    sceneFeature: "SCENE.1H-fridge",
  };

  // Open appliance shell. There is deliberately no full front-facing
  // body panel behind the door.
  decorative(
    roundedFootprint(
      scene,
      "fridge-back-shell",
      new Vector3(1.50, 2.94, .18),
      new Vector3(0, 1.48, .43),
      materials.body,
      .10,
      root,
    ),
  );

  for (const [name, x] of [
    ["left", -.70],
    ["right", .70],
  ] as const) {
    decorative(
      box(
        scene,
        `fridge-side-${name}`,
        new Vector3(.14, 2.78, 1.02),
        new Vector3(x, 1.48, -.03),
        materials.body,
        root,
      ),
    );
  }

  decorative(
    box(
      scene,
      "fridge-top-cap",
      new Vector3(1.40, .14, 1.02),
      new Vector3(0, 2.89, -.03),
      materials.body,
      root,
    ),
  );

  decorative(
    box(
      scene,
      "fridge-bottom-sill",
      new Vector3(1.40, .14, 1.02),
      new Vector3(0, .07, -.03),
      materials.body,
      root,
    ),
  );

  decorative(
    box(
      scene,
      "fridge-toe-kick",
      new Vector3(1.16, .12, .10),
      new Vector3(0, .08, -.55),
      materials.interior,
      root,
    ),
  );

  const interior =
    new TransformNode("fridge-interior", scene);

  interior.parent = root;
  interior.metadata = {
    sceneFeature: "SCENE.1H-fridge-interior",
  };

  decorative(
    roundedFootprint(
      scene,
      "fridge-interior-back",
      new Vector3(1.18, 2.55, .06),
      new Vector3(0, 1.50, .32),
      materials.interior,
      .05,
      interior,
    ),
  );

  for (const [index, y] of [
    [0, 2.18],
    [1, 1.70],
    [2, 1.22],
  ] as const) {
    decorative(
      box(
        scene,
        `fridge-shelf-${index}`,
        new Vector3(1.12, .055, .76),
        new Vector3(0, y, -.04),
        materials.liner,
        interior,
      ),
    );
  }

  decorative(
    roundedFootprint(
      scene,
      "fridge-produce-drawer",
      new Vector3(1.08, .36, .66),
      new Vector3(0, .67, -.01),
      materials.liner,
      .05,
      interior,
    ),
  );

  const doorPivot =
    new TransformNode(
      "fridge-door-pivot",
      scene,
    );

  // Right-side hinge. Negative Y rotation swings the door toward the
  // camera and into the visible kitchen side.
  doorPivot.parent = root;
  doorPivot.position.set(
    .72,
    0,
    -.57,
  );

  const door =
    roundedFootprint(
      scene,
      "fridge-door",
      new Vector3(1.40, 2.80, .18),
      new Vector3(-.70, 1.48, -.06),
      materials.door,
      .10,
      doorPivot,
    );

  door.metadata = {
    everydayTarget: "fridge-shelves",
    room: "home",
    sceneFeature: "SCENE.1H-fridge-door",
  };

  for (const [name, size, position] of [
    [
      "fridge-door-frame-top",
      new Vector3(1.24, .045, .025),
      new Vector3(-.70, 2.82, -.17),
    ],
    [
      "fridge-door-frame-bottom",
      new Vector3(1.24, .045, .025),
      new Vector3(-.70, .14, -.17),
    ],
    [
      "fridge-door-frame-left",
      new Vector3(.045, 2.64, .025),
      new Vector3(-1.30, 1.48, -.17),
    ],
    [
      "fridge-door-frame-right",
      new Vector3(.045, 2.64, .025),
      new Vector3(-.10, 1.48, -.17),
    ],
    [
      "fridge-freezer-seam",
      new Vector3(1.12, .045, .025),
      new Vector3(-.70, 1.50, -.18),
    ],
  ] as const) {
    decorative(
      box(
        scene,
        name,
        size,
        position,
        materials.interior,
        doorPivot,
      ),
    );
  }

  const handle =
    MeshBuilder.CreateCylinder(
      "fridge-door-handle",
      {
        diameter: .10,
        height: 1.18,
        tessellation: 14,
      },
      scene,
    );

  handle.position.set(
    -1.18,
    1.66,
    -.20,
  );
  handle.material = materials.interior;
  handle.parent = doorPivot;
  handle.isPickable = false;
  handle.receiveShadows = true;

  decorative(
    roundedFootprint(
      scene,
      "fridge-water-dispenser",
      new Vector3(.46, .42, .035),
      new Vector3(-.70, 1.00, -.175),
      materials.interior,
      .05,
      doorPivot,
    ),
  );

  decorative(
    box(
      scene,
      "fridge-water-dispenser-slot",
      new Vector3(.26, .05, .025),
      new Vector3(-.70, 1.08, -.205),
      materials.liner,
      doorPivot,
    ),
  );

  decorative(
    roundedFootprint(
      scene,
      "fridge-door-inner-panel",
      new Vector3(1.10, 2.42, .035),
      new Vector3(-.70, 1.48, .055),
      materials.liner,
      .06,
      doorPivot,
    ),
  );

  for (const [index, y] of [
    [0, 1.92],
    [1, 1.30],
    [2, .70],
  ] as const) {
    decorative(
      box(
        scene,
        `fridge-door-bin-${index}`,
        new Vector3(.88, .18, .16),
        new Vector3(-.70, y, .13),
        materials.interior,
        doorPivot,
      ),
    );
  }

  const badge =
    MeshBuilder.CreateDisc(
      "fridge-brand-badge",
      {
        radius: .075,
        tessellation: 14,
      },
      scene,
    );

  badge.position.set(
    -.38,
    2.58,
    -.18,
  );
  badge.rotation.x = Math.PI / 2;
  badge.material = materials.accent;
  badge.parent = doorPivot;
  badge.isPickable = false;

  const note =
    roundedFootprint(
      scene,
      "fridge-family-note",
      new Vector3(.30, .24, .025),
      new Vector3(-.72, 2.28, -.18),
      materials.secondary,
      .025,
      doorPivot,
    );

  note.rotation.z = -.08;
  note.isPickable = false;

  interior.setEnabled(false);

  return {
    root,
    doorPivot,
    door,
    interior,
  };
}

export function setFamilyHomeFridgeOpen(
  scene: Scene,
  fridge: FamilyHomeFridgeVisual,
  open: boolean,
  animated = true,
): void {
  const targetRotation =
    open ? -.82 : 0;

  const targetPosition =
    open
      ? new Vector3(.94, 0, -.74)
      : new Vector3(.72, 0, -.57);

  scene.stopAnimation(fridge.doorPivot);

  if (!animated) {
    fridge.doorPivot.rotation.y =
      targetRotation;

    fridge.doorPivot.position.copyFrom(
      targetPosition,
    );

    fridge.interior.setEnabled(open);
    return;
  }

  if (open) {
    fridge.interior.setEnabled(true);
  }

  Animation.CreateAndStartAnimation(
    "family-home-fridge-door-rotate",
    fridge.doorPivot,
    "rotation.y",
    30,
    22,
    fridge.doorPivot.rotation.y,
    targetRotation,
    Animation.ANIMATIONLOOPMODE_CONSTANT,
  );

  Animation.CreateAndStartAnimation(
    "family-home-fridge-door-shift",
    fridge.doorPivot,
    "position",
    30,
    22,
    fridge.doorPivot.position.clone(),
    targetPosition,
    Animation.ANIMATIONLOOPMODE_CONSTANT,
    undefined,
    () => {
      fridge.doorPivot.rotation.y =
        targetRotation;

      fridge.doorPivot.position.copyFrom(
        targetPosition,
      );

      if (!open) {
        fridge.interior.setEnabled(false);
      }

      scene.stopAnimation(
        fridge.doorPivot,
      );
    },
  );
}
