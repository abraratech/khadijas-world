import {
  type Mesh,
  MeshBuilder,
  type Scene,
  type StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import type {
  ItemMaterialPalette,
} from "../../items/productionItemVisuals";
import { box } from "../../shared/meshHelpers";

function child(mesh: Mesh): Mesh {
  mesh.isPickable = false;
  mesh.receiveShadows = true;
  return mesh;
}

function sphereChild(
  scene: Scene,
  name: string,
  diameter: number,
  position: Vector3,
  material: StandardMaterial,
  parent: Mesh,
): Mesh {
  const mesh =
    MeshBuilder.CreateSphere(
      name,
      {
        diameter,
        segments: 9,
      },
      scene,
    );

  mesh.position.copyFrom(position);
  mesh.material = material;
  mesh.parent = parent;
  return child(mesh);
}

function createBread(
  scene: Scene,
  position: Vector3,
  materials: ItemMaterialPalette,
): Mesh {
  const loaf = box(
    scene,
    "draggable-bread",
    new Vector3(.46, .20, .32),
    position,
    materials.wood,
  );

  const crown =
    MeshBuilder.CreateSphere(
      "bread-rounded-crown",
      {
        diameter: .43,
        segments: 10,
      },
      scene,
    );

  crown.position.set(0, .10, 0);
  crown.scaling.set(1, .42, .72);
  crown.material = materials.yellow;
  crown.parent = loaf;
  child(crown);

  for (const [index, x] of [
    [0, -.12],
    [1, 0],
    [2, .12],
  ] as const) {
    const score = box(
      scene,
      `bread-score-${index}`,
      new Vector3(.025, .06, .025),
      new Vector3(x, .16, -.155),
      materials.white,
      loaf,
    );

    score.rotation.z = -.25;
    child(score);
  }

  return loaf;
}

function createCheese(
  scene: Scene,
  position: Vector3,
  materials: ItemMaterialPalette,
): Mesh {
  const cheese =
    MeshBuilder.CreateCylinder(
      "draggable-cheese",
      {
        diameter: .38,
        height: .24,
        tessellation: 3,
      },
      scene,
    );

  cheese.position.copyFrom(position);
  cheese.rotation.x = Math.PI / 2;
  cheese.scaling.set(1.08, 1, .88);
  cheese.material = materials.yellow;
  cheese.receiveShadows = true;

  for (const [
    index,
    x,
    localZ,
  ] of [
    [0, -.07, .04],
    [1, .07, -.03],
    [2, .00, .10],
  ] as const) {
    const hole = sphereChild(
      scene,
      `cheese-hole-${index}`,
      .065,
      new Vector3(
        x,
        -.135,
        localZ,
      ),
      materials.wood,
      cheese,
    );

    hole.scaling.y = .24;
  }

  return cheese;
}

function createBerries(
  scene: Scene,
  position: Vector3,
  materials: ItemMaterialPalette,
): Mesh {
  const basket =
    MeshBuilder.CreateCylinder(
      "draggable-berries",
      {
        diameterTop: .36,
        diameterBottom: .30,
        height: .13,
        tessellation: 12,
      },
      scene,
    );

  basket.position.copyFrom(position);
  basket.material = materials.wood;
  basket.receiveShadows = true;

  for (const [
    index,
    x,
    y,
    z,
  ] of [
    [0, -.10, .11, -.03],
    [1, 0, .13, -.05],
    [2, .10, .11, -.03],
    [3, -.05, .20, .02],
    [4, .06, .20, .02],
  ] as const) {
    sphereChild(
      scene,
      `berry-${index}`,
      .13,
      new Vector3(x, y, z),
      materials.pink,
      basket,
    );
  }

  const leaf = sphereChild(
    scene,
    "berries-leaf",
    .12,
    new Vector3(.09, .25, .01),
    materials.green,
    basket,
  );

  leaf.scaling.set(1.25, .32, .65);
  leaf.rotation.z = -.45;

  return basket;
}

function createCakeMix(
  scene: Scene,
  position: Vector3,
  materials: ItemMaterialPalette,
): Mesh {
  const carton = box(
    scene,
    "draggable-cake-mix",
    new Vector3(.34, .48, .18),
    position,
    materials.sky,
  );

  child(
    box(
      scene,
      "cake-mix-label",
      new Vector3(.25, .20, .025),
      new Vector3(0, -.02, -.102),
      materials.white,
      carton,
    ),
  );

  const cake = sphereChild(
    scene,
    "cake-mix-cake-icon",
    .14,
    new Vector3(0, -.02, -.125),
    materials.pink,
    carton,
  );

  cake.scaling.set(1.1, .55, .22);

  child(
    box(
      scene,
      "cake-mix-top-flap",
      new Vector3(.28, .055, .16),
      new Vector3(0, .265, 0),
      materials.yellow,
      carton,
    ),
  );

  return carton;
}

function createBanana(
  scene: Scene,
  position: Vector3,
  materials: ItemMaterialPalette,
): Mesh {
  const banana =
    MeshBuilder.CreateTube(
      "draggable-banana",
      {
        path: [
          new Vector3(-.19, -.02, 0),
          new Vector3(-.13, .07, 0),
          new Vector3(-.03, .12, 0),
          new Vector3(.09, .10, 0),
          new Vector3(.18, .02, 0),
        ],
        radius: .055,
        tessellation: 10,
        updatable: false,
      },
      scene,
    );

  banana.position.copyFrom(position);
  banana.material = materials.yellow;
  banana.receiveShadows = true;

  sphereChild(
    scene,
    "banana-tip-left",
    .075,
    new Vector3(-.20, -.03, 0),
    materials.wood,
    banana,
  );

  sphereChild(
    scene,
    "banana-tip-right",
    .075,
    new Vector3(.19, .01, 0),
    materials.wood,
    banana,
  );

  return banana;
}

function createPacket(
  scene: Scene,
  id: string,
  position: Vector3,
  base: StandardMaterial,
  label: StandardMaterial,
  icon: StandardMaterial,
): Mesh {
  const packet = box(
    scene,
    `draggable-${id}`,
    new Vector3(.34, .42, .13),
    position,
    base,
  );

  child(
    box(
      scene,
      `${id}-label`,
      new Vector3(.24, .20, .025),
      new Vector3(0, -.01, -.077),
      label,
      packet,
    ),
  );

  const emblem = sphereChild(
    scene,
    `${id}-emblem`,
    .13,
    new Vector3(0, -.01, -.095),
    icon,
    packet,
  );

  emblem.scaling.set(1.2, .42, .22);
  emblem.rotation.z = -.35;

  return packet;
}

export function createHomeIngredientVisual(
  scene: Scene,
  id: string,
  position: Vector3,
  materials: ItemMaterialPalette,
  fallback: StandardMaterial,
): Mesh {
  switch (id) {
    case "bread":
      return createBread(
        scene,
        position,
        materials,
      );

    case "cheese":
      return createCheese(
        scene,
        position,
        materials,
      );

    case "berries":
      return createBerries(
        scene,
        position,
        materials,
      );

    case "cake-mix":
      return createCakeMix(
        scene,
        position,
        materials,
      );

    case "banana":
      return createBanana(
        scene,
        position,
        materials,
      );

    case "tea-leaves":
      return createPacket(
        scene,
        id,
        position,
        materials.green,
        materials.white,
        materials.green,
      );

    case "sponge": {
      const sponge = box(
        scene,
        "draggable-sponge",
        new Vector3(.36, .16, .25),
        position,
        materials.yellow,
      );

      child(
        box(
          scene,
          "sponge-scrub-layer",
          new Vector3(.36, .055, .25),
          new Vector3(0, .105, 0),
          materials.green,
          sponge,
        ),
      );

      return sponge;
    }

    case "towel": {
      const towel = box(
        scene,
        "draggable-towel",
        new Vector3(.44, .13, .34),
        position,
        materials.pink,
      );

      child(
        box(
          scene,
          "towel-fold-band",
          new Vector3(.08, .145, .35),
          new Vector3(.06, .01, 0),
          materials.white,
          towel,
        ),
      );

      return towel;
    }

    case "rubbish":
      return createPacket(
        scene,
        id,
        position,
        materials.white,
        materials.pink,
        materials.yellow,
      );

    case "clothes": {
      const clothes = box(
        scene,
        "draggable-clothes",
        new Vector3(.46, .13, .34),
        position,
        materials.teal,
      );

      child(
        box(
          scene,
          "clothes-fold-middle",
          new Vector3(.42, .09, .32),
          new Vector3(0, .11, 0),
          materials.pink,
          clothes,
        ),
      );

      child(
        box(
          scene,
          "clothes-fold-top",
          new Vector3(.38, .08, .29),
          new Vector3(0, .195, 0),
          materials.yellow,
          clothes,
        ),
      );

      return clothes;
    }

    case "toy-block": {
      const block = box(
        scene,
        "draggable-toy-block",
        new Vector3(.34, .34, .34),
        position,
        materials.yellow,
      );

      for (const [index, x] of [
        [0, -.09],
        [1, .09],
      ] as const) {
        sphereChild(
          scene,
          `toy-block-stud-${index}`,
          .095,
          new Vector3(x, .19, 0),
          materials.pink,
          block,
        );
      }

      return block;
    }

    default:
      return box(
        scene,
        `draggable-${id}`,
        new Vector3(.32, .22, .28),
        position,
        fallback,
      );
  }
}
