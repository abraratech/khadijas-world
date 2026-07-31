import {
  Color3,
  type AbstractMesh,
  Mesh,
  MeshBuilder,
  type Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

const STREET_ARTIFACT_PREFIX =
  "art1j-street-bike-";

const BASE_GROCERY_PREFIXES = [
  "grocery-sign",
  "grocery-shelf-",
  "grocery-aisle-sign-",
  "grocery-fridge",
  "grocery-produce-table",
  "grocery-produce-crate-",
  "grocery-produce-",
  "grocery-bakery",
  "grocery-household",
  "grocery-checkout",
  "grocery-counter-top",
  "grocery-register",
  "grocery-conveyor",
  "grocery-bag-rack",
] as const;

function matchesBaseGrocery(
  mesh: AbstractMesh,
): boolean {
  return BASE_GROCERY_PREFIXES.some(
    (prefix) =>
      mesh.name === prefix
      || mesh.name.startsWith(prefix),
  );
}

function makeMaterial(
  scene: Scene,
  name: string,
  diffuse: Color3,
  emissive?: Color3,
): StandardMaterial {
  const material =
    new StandardMaterial(name, scene);

  material.diffuseColor = diffuse;
  material.specularColor =
    new Color3(.12, .12, .12);

  if (emissive) {
    material.emissiveColor = emissive;
  }

  return material;
}

function decorate(
  mesh: Mesh,
  root: TransformNode,
  details: Mesh[],
): Mesh {
  mesh.parent = root;
  mesh.isPickable = false;
  mesh.receiveShadows = true;
  mesh.metadata = {
    ...mesh.metadata,
    decorativeDetail: true,
    qualityTier: "high",
    scene2aGroceryLively: true,
    fastTrackHidden: false,
  };

  details.push(mesh);
  return mesh;
}

function box(
  scene: Scene,
  name: string,
  size: Vector3,
  position: Vector3,
  material: StandardMaterial,
  root: TransformNode,
  details: Mesh[],
): Mesh {
  const mesh =
    MeshBuilder.CreateBox(
      name,
      {
        width: size.x,
        height: size.y,
        depth: size.z,
      },
      scene,
    );

  mesh.position.copyFrom(position);
  mesh.material = material;

  return decorate(mesh, root, details);
}

function cylinder(
  scene: Scene,
  name: string,
  diameter: number,
  height: number,
  position: Vector3,
  material: StandardMaterial,
  root: TransformNode,
  details: Mesh[],
): Mesh {
  const mesh =
    MeshBuilder.CreateCylinder(
      name,
      {
        diameter,
        height,
        tessellation: 14,
      },
      scene,
    );

  mesh.position.copyFrom(position);
  mesh.material = material;

  return decorate(mesh, root, details);
}

function torus(
  scene: Scene,
  name: string,
  diameter: number,
  thickness: number,
  position: Vector3,
  material: StandardMaterial,
  root: TransformNode,
  details: Mesh[],
): Mesh {
  const mesh =
    MeshBuilder.CreateTorus(
      name,
      {
        diameter,
        thickness,
        tessellation: 18,
      },
      scene,
    );

  mesh.position.copyFrom(position);
  mesh.material = material;

  return decorate(mesh, root, details);
}

function markStreetArtifactHidden(
  mesh: AbstractMesh,
): void {
  mesh.metadata = {
    ...mesh.metadata,
    fastTrackHidden: true,
    scene2aRemovedStreetArtifact: true,
  };

  mesh.setEnabled(false);
}

function markBaseFallback(
  mesh: AbstractMesh,
): void {
  mesh.metadata = {
    ...mesh.metadata,
    scene2aGroceryBaseFallback: true,
  };
}

function markHighGrocery(
  mesh: AbstractMesh,
): void {
  mesh.metadata = {
    ...mesh.metadata,
    fastTrackHidden: false,
    scene2aGroceryHighDetail: true,
  };
}

function addBasketStack(
  scene: Scene,
  offsetX: number,
  materials: {
    coral: StandardMaterial;
    mint: StandardMaterial;
    navy: StandardMaterial;
  },
  root: TransformNode,
  details: Mesh[],
): void {
  for (const [index, y] of [
    [0, .20],
    [1, .37],
    [2, .54],
  ] as const) {
    const basket =
      box(
        scene,
        `scene2a-grocery-basket-${index}`,
        new Vector3(.62, .16, .42),
        new Vector3(
          offsetX - 5.12,
          y,
          -1.35,
        ),
        index % 2 === 0
          ? materials.coral
          : materials.mint,
        root,
        details,
      );

    basket.rotation.y = -.12;

    const handle =
      torus(
        scene,
        `scene2a-grocery-basket-handle-${index}`,
        .42,
        .035,
        new Vector3(
          offsetX - 5.12,
          y + .13,
          -1.35,
        ),
        materials.navy,
        root,
        details,
      );

    handle.rotation.x = Math.PI / 2;
    handle.rotation.z = -.12;
    handle.scaling.z = .68;
  }
}

function addCheckoutActivity(
  scene: Scene,
  offsetX: number,
  materials: {
    coral: StandardMaterial;
    mint: StandardMaterial;
    mustard: StandardMaterial;
    ceramic: StandardMaterial;
    navy: StandardMaterial;
  },
  root: TransformNode,
  details: Mesh[],
  beltItems: Mesh[],
): void {
  const itemMaterials = [
    materials.coral,
    materials.mustard,
    materials.mint,
    materials.ceramic,
  ] as const;

  for (let index = 0; index < 4; index += 1) {
    const item =
      index % 2 === 0
        ? box(
            scene,
            `scene2a-grocery-belt-carton-${index}`,
            new Vector3(.25, .30, .22),
            new Vector3(
              offsetX - .58 + index * .36,
              1.39,
              -2.55,
            ),
            itemMaterials[index],
            root,
            details,
          )
        : cylinder(
            scene,
            `scene2a-grocery-belt-bottle-${index}`,
            .22,
            .36,
            new Vector3(
              offsetX - .58 + index * .36,
              1.41,
              -2.55,
            ),
            itemMaterials[index],
            root,
            details,
          );

    item.metadata = {
      ...item.metadata,
      scene2aBeltIndex: index,
    };

    beltItems.push(item);
  }

  for (const [index, x] of [
    [0, 2.72],
    [1, 2.95],
    [2, 3.18],
  ] as const) {
    const bag =
      box(
        scene,
        `scene2a-grocery-paper-bag-${index}`,
        new Vector3(.20, .34, .16),
        new Vector3(
          offsetX + x,
          .40 + index * .03,
          -2.60,
        ),
        index === 1
          ? materials.coral
          : materials.ceramic,
        root,
        details,
      );

    bag.rotation.y =
      (index - 1) * .08;
  }

  box(
    scene,
    "scene2a-grocery-queue-rail",
    new Vector3(1.85, .055, .055),
    new Vector3(
      offsetX + .70,
      .08,
      -1.55,
    ),
    materials.navy,
    root,
    details,
  );
}

function addSaleMobiles(
  scene: Scene,
  offsetX: number,
  materials: {
    coral: StandardMaterial;
    mint: StandardMaterial;
    mustard: StandardMaterial;
    navy: StandardMaterial;
  },
  root: TransformNode,
  details: Mesh[],
  bobbingMeshes: Mesh[],
): void {
  for (const [index, x, material] of [
    [0, 2.65, materials.coral],
    [1, 3.30, materials.mustard],
    [2, 3.95, materials.mint],
  ] as const) {
    box(
      scene,
      `scene2a-grocery-mobile-string-${index}`,
      new Vector3(.025, .72, .025),
      new Vector3(
        offsetX + x,
        2.82,
        1.32,
      ),
      materials.navy,
      root,
      details,
    );

    const mobile =
      MeshBuilder.CreateSphere(
        `scene2a-grocery-sale-mobile-${index}`,
        {
          diameter: .34,
          segments: 10,
        },
        scene,
      );

    mobile.position.set(
      offsetX + x,
      2.42,
      1.32,
    );
    mobile.scaling.y = .82;
    mobile.material = material;

    decorate(
      mobile,
      root,
      details,
    );

    bobbingMeshes.push(mobile);
  }
}

export function setStreetGroceryRefreshQuality(
  scene: Scene,
  highDetail: boolean,
): void {
  for (const mesh of scene.meshes) {
    if (
      mesh.metadata
        ?.scene2aRemovedStreetArtifact
      === true
    ) {
      mesh.setEnabled(false);
      continue;
    }

    if (
      mesh.metadata
        ?.scene2aGroceryBaseFallback
      === true
    ) {
      mesh.setEnabled(!highDetail);
      continue;
    }

    if (
      mesh.metadata
        ?.scene2aGroceryHighDetail
      === true
      || mesh.metadata
        ?.scene2aGroceryLively
      === true
    ) {
      mesh.setEnabled(highDetail);
    }
  }
}

export function applyStreetGroceryRefresh(
  scene: Scene,
  groceryOffsetX: number,
): Mesh[] {
  for (const mesh of scene.meshes) {
    if (
      mesh.name.startsWith(
        STREET_ARTIFACT_PREFIX,
      )
    ) {
      markStreetArtifactHidden(mesh);
      continue;
    }

    if (matchesBaseGrocery(mesh)) {
      markBaseFallback(mesh);
      continue;
    }

    if (
      mesh.name.startsWith(
        "art1i-grocery-",
      )
    ) {
      markHighGrocery(mesh);
    }
  }

  const root =
    new TransformNode(
      "scene2a-grocery-lively-root",
      scene,
    );

  root.metadata = {
    sceneFeature:
      "SCENE.2A-grocery-lively",
  };

  const details: Mesh[] = [];
  const beltItems: Mesh[] = [];
  const bobbingMeshes: Mesh[] = [];

  const materials = {
    coral: makeMaterial(
      scene,
      "scene2a-grocery-coral",
      new Color3(.92, .30, .47),
    ),
    mint: makeMaterial(
      scene,
      "scene2a-grocery-mint",
      new Color3(.28, .72, .59),
    ),
    mustard: makeMaterial(
      scene,
      "scene2a-grocery-mustard",
      new Color3(.96, .70, .20),
    ),
    ceramic: makeMaterial(
      scene,
      "scene2a-grocery-ceramic",
      new Color3(.98, .95, .87),
    ),
    navy: makeMaterial(
      scene,
      "scene2a-grocery-navy",
      new Color3(.06, .12, .20),
    ),
  };

  addBasketStack(
    scene,
    groceryOffsetX,
    materials,
    root,
    details,
  );

  addCheckoutActivity(
    scene,
    groceryOffsetX,
    materials,
    root,
    details,
    beltItems,
  );

  addSaleMobiles(
    scene,
    groceryOffsetX,
    materials,
    root,
    details,
    bobbingMeshes,
  );

  const beltStarts =
    beltItems.map(
      (mesh) => mesh.position.x,
    );

  const bobStarts =
    bobbingMeshes.map(
      (mesh) => mesh.position.y,
    );

  let elapsed = 0;

  scene.onBeforeRenderObservable.add(
    () => {
      if (
        details[0]
        && !details[0].isEnabled()
      ) {
        return;
      }

      elapsed += Math.min(
        scene.getEngine().getDeltaTime(),
        50,
      ) / 1000;

      for (
        const [index, item]
        of beltItems.entries()
      ) {
        const travel =
          (
            elapsed * .16
            + index * .37
          ) % 1.48;

        item.position.x =
          beltStarts[0] + travel;
      }

      for (
        const [index, mobile]
        of bobbingMeshes.entries()
      ) {
        mobile.position.y =
          bobStarts[index]
          + Math.sin(
            elapsed * 1.15
            + index * .85,
          ) * .045;

        mobile.rotation.y =
          elapsed * (
            .18 + index * .035
          );
      }
    },
  );

  setStreetGroceryRefreshQuality(
    scene,
    true,
  );

  scene.metadata = {
    ...scene.metadata,
    streetGroceryRefresh:
      "SCENE.2A",
  };

  return details;
}
