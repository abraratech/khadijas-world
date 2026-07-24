import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import type { RoomId } from "./storage";

export interface World3LocationMaterials {
  cream: StandardMaterial;
  white: StandardMaterial;
  wood: StandardMaterial;
  dark: StandardMaterial;
  pink: StandardMaterial;
  yellow: StandardMaterial;
  green: StandardMaterial;
  teal: StandardMaterial;
  mint: StandardMaterial;
  blue: StandardMaterial;
  glass: StandardMaterial;
  grass: StandardMaterial;
  sidewalk: StandardMaterial;
}

export interface World3LocationBuild {
  doors: {
    parkToStreet: Mesh;
    groceryToStreet: Mesh;
  };
  hotspots: Record<string, Mesh>;
  productHotspots: Record<string, Mesh>;
  containerMeshes: {
    shoppingBasket: Mesh;
    shoppingBag: Mesh;
    picnicBasket: Mesh;
    wateringCan: Mesh;
    camera: Mesh;
  };
  detailMeshes: Mesh[];
}

function box(
  scene: Scene,
  name: string,
  size: Vector3,
  position: Vector3,
  material: StandardMaterial,
  parent?: TransformNode,
): Mesh {
  const mesh = MeshBuilder.CreateBox(name, { width: size.x, height: size.y, depth: size.z }, scene);
  mesh.position.copyFrom(position);
  mesh.material = material;
  if (parent) mesh.parent = parent;
  return mesh;
}

function cylinder(
  scene: Scene,
  name: string,
  diameter: number,
  height: number,
  position: Vector3,
  material: StandardMaterial,
): Mesh {
  const mesh = MeshBuilder.CreateCylinder(name, { diameter, height, tessellation: 12 }, scene);
  mesh.position.copyFrom(position);
  mesh.material = material;
  return mesh;
}

function markWalkable(mesh: Mesh, room: RoomId): void {
  mesh.metadata = { walkable: true, room };
}

export function createWorld3Locations(
  scene: Scene,
  parkOffsetX: number,
  groceryOffsetX: number,
  materials: World3LocationMaterials,
): World3LocationBuild {
  const park = (x: number, y: number, z: number): Vector3 => new Vector3(x + parkOffsetX, y, z);
  const grocery = (x: number, y: number, z: number): Vector3 => new Vector3(x + groceryOffsetX, y, z);
  const hotspots: Record<string, Mesh> = {};
  const productHotspots: Record<string, Mesh> = {};
  const detailMeshes: Mesh[] = [];
  const hotspotMaterial = new StandardMaterial("world3-hotspot-material", scene);
  hotspotMaterial.diffuseColor = new Color3(.98, .76, .24);
  hotspotMaterial.alpha = .025;

  const addHotspot = (
    id: string,
    room: RoomId,
    position: Vector3,
    size: Vector3,
  ): Mesh => {
    const mesh = box(scene, `world3-${id}`, size, position, hotspotMaterial);
    mesh.metadata = { world3Action: id, room };
    hotspots[id] = mesh;
    return mesh;
  };

  // Neighborhood park: open center paths keep taps and walking readable.
  const parkGround = box(scene, "park-ground", new Vector3(12, .18, 8), park(0, -.1, 0), materials.grass);
  markWalkable(parkGround, "park");
  const mainPath = box(scene, "park-main-path", new Vector3(3.1, .05, 8), park(0, .01, 0), materials.sidewalk);
  markWalkable(mainPath, "park");
  const crossPath = box(scene, "park-cross-path", new Vector3(12, .04, 1.25), park(0, .02, -.8), materials.sidewalk);
  markWalkable(crossPath, "park");

  for (const [index, x, z] of [
    [0, -4.8, 2.7], [1, 4.75, 2.7], [2, -4.8, -2.4], [3, 4.7, -2.55],
  ] as const) {
    box(scene, `park-tree-trunk-${index}`, new Vector3(.42, 2.05, .42), park(x, 1.02, z), materials.wood);
    const crown = MeshBuilder.CreateSphere(`park-tree-crown-${index}`, { diameter: 1.65, segments: 9 }, scene);
    crown.position.copyFrom(park(x, 2.4, z));
    crown.material = materials.green;
    crown.isPickable = false;
    detailMeshes.push(crown);
  }

  for (const [index, x] of [-4.1, -3.45, 3.45, 4.1].entries()) {
    const planter = box(scene, `park-planter-${index}`, new Vector3(.65, .35, .65), park(x, .18, 1.85), materials.wood);
    planter.isPickable = false;
    for (let flower = 0; flower < 3; flower += 1) {
      const bloom = MeshBuilder.CreateSphere(`park-flower-${index}-${flower}`, { diameter: .18, segments: 6 }, scene);
      bloom.position.copyFrom(park(x + (flower - 1) * .17, .55, 1.85));
      bloom.material = flower % 2 === 0 ? materials.pink : materials.yellow;
      bloom.isPickable = false;
      detailMeshes.push(bloom);
    }
  }

  for (const [id, x] of [["left", -3.6], ["right", 3.6]] as const) {
    box(scene, `park-bench-${id}-seat`, new Vector3(2.0, .18, .7), park(x, .58, -.05), materials.wood);
    box(scene, `park-bench-${id}-back`, new Vector3(2.0, .8, .15), park(x, 1.0, .28), materials.wood);
  }
  addHotspot("park-bench-left", "park", park(-3.6, .8, -.05), new Vector3(1.8, .55, .8));
  addHotspot("park-bench-right", "park", park(3.6, .8, -.05), new Vector3(1.8, .55, .8));

  const blanket = box(scene, "park-picnic-blanket", new Vector3(3.0, .04, 2.1), park(-3.35, .02, -2.2), materials.pink);
  markWalkable(blanket, "park");
  box(scene, "park-picnic-table", new Vector3(2.2, .15, 1.0), park(-3.35, .75, -2.2), materials.wood);
  addHotspot("park-picnic", "park", park(-3.35, .9, -2.2), new Vector3(2.8, 1.0, 2.2));

  // Playground: controlled interactions use these simple silhouettes.
  const slideRoot = new TransformNode("park-slide", scene);
  slideRoot.position.copyFrom(park(3.4, 0, -2.1));
  box(scene, "park-slide-platform", new Vector3(1.1, .16, .9), new Vector3(0, 1.65, .25), materials.yellow, slideRoot);
  const slideRamp = box(scene, "park-slide-ramp", new Vector3(.8, .12, 2.7), new Vector3(0, .92, -.85), materials.pink, slideRoot);
  slideRamp.rotation.x = -.56;
  addHotspot("park-slide", "park", park(3.4, 1.0, -2.1), new Vector3(1.5, 2.4, 3.2));

  for (const x of [1.1, 2.9]) {
    box(scene, `park-swing-post-${x}`, new Vector3(.15, 2.55, .15), park(x, 1.28, 2.45), materials.teal);
  }
  box(scene, "park-swing-top", new Vector3(2.0, .14, .14), park(2.0, 2.5, 2.45), materials.teal);
  for (const x of [1.55, 2.45]) {
    box(scene, `park-swing-rope-${x}`, new Vector3(.05, 1.45, .05), park(x, 1.68, 2.45), materials.dark);
    box(scene, `park-swing-seat-${x}`, new Vector3(.55, .1, .38), park(x, .95, 2.45), materials.wood);
  }
  addHotspot("park-swings", "park", park(2.0, 1.4, 2.45), new Vector3(2.4, 2.8, 1.1));

  cylinder(scene, "park-sandbox", 2.2, .26, park(4.45, .13, .2), materials.yellow);
  addHotspot("park-sandbox", "park", park(4.45, .5, .2), new Vector3(2.3, .8, 2.3));

  const pond = cylinder(scene, "park-pond", 2.0, .08, park(-1.8, .02, 2.45), materials.blue);
  pond.scaling.z = .72;
  pond.isPickable = false;
  cylinder(scene, "park-fountain", .85, .75, park(.55, .38, 2.65), materials.blue);
  addHotspot("park-fountain", "park", park(.55, .8, 2.65), new Vector3(1.0, 1.4, 1.0));
  box(scene, "park-bin", new Vector3(.65, .9, .65), park(-1.5, .45, -.8), materials.teal);
  addHotspot("park-bin", "park", park(-1.5, .55, -.8), new Vector3(.9, 1.1, .9));
  box(scene, "park-signboard", new Vector3(1.9, 1.2, .14), park(1.75, 1.55, -.65), materials.wood);
  box(scene, "park-sign-post", new Vector3(.16, 1.4, .16), park(1.75, .7, -.65), materials.dark);
  addHotspot("park-sign", "park", park(1.75, 1.5, -.65), new Vector3(2.1, 1.6, .6));
  addHotspot("park-flowers", "park", park(-3.8, .6, 1.85), new Vector3(2.0, 1.1, 1.0));
  addHotspot("park-birds", "park", park(-1.8, .45, 2.45), new Vector3(2.2, .9, 1.8));

  const parkToStreet = box(scene, "park-exit-door", new Vector3(.75, 2.5, .3), park(-5.65, 1.25, -3.2), materials.teal);

  const picnicBasket = box(scene, "draggable-picnic-basket", new Vector3(.72, .48, .42), park(-4.55, .3, -2.8), materials.wood);
  const wateringCan = cylinder(scene, "draggable-watering-can", .48, .48, park(-4.55, .3, 1.45), materials.blue);
  const camera = box(scene, "draggable-camera", new Vector3(.52, .36, .28), park(.2, .25, -.75), materials.dark);
  const cameraLens = cylinder(scene, "camera-lens", .18, .08, new Vector3(0, 0, 0), materials.blue);
  cameraLens.parent = camera;
  cameraLens.position.set(0, 0, -.17);

  // Grocery shop: readable aisles around an open center.
  const groceryFloor = box(scene, "grocery-floor", new Vector3(12, .18, 8), grocery(0, -.1, 0), materials.cream);
  markWalkable(groceryFloor, "grocery");
  box(scene, "grocery-back-wall", new Vector3(12, 4.2, .2), grocery(0, 2, 4), materials.mint);
  box(scene, "grocery-left-wall", new Vector3(.2, 4.2, 8), grocery(-6, 2, 0), materials.white);
  box(scene, "grocery-sign", new Vector3(3.6, .75, .14), grocery(0, 3.35, 3.82), materials.pink);
  for (const [index, z] of [2.8, 1.55, .3].entries()) {
    box(scene, `grocery-shelf-${index}`, new Vector3(3.4, 1.7, .55), grocery(-2.6, .85, z), materials.wood);
    for (const y of [.5, 1.05, 1.58]) {
      box(scene, `grocery-shelf-line-${index}-${y}`, new Vector3(3.45, .08, .62), grocery(-2.6, y, z), materials.white);
    }
  }
  box(scene, "grocery-fridge", new Vector3(2.5, 2.55, .75), grocery(4.45, 1.28, 2.9), materials.blue);
  box(scene, "grocery-fridge-glass", new Vector3(2.15, 2.1, .06), grocery(4.45, 1.3, 2.48), materials.glass);
  box(scene, "grocery-produce-table", new Vector3(2.8, .9, 1.2), grocery(3.55, .45, .35), materials.green);
  box(scene, "grocery-bakery", new Vector3(2.5, 1.5, .75), grocery(-4.5, .75, -2.7), materials.yellow);
  box(scene, "grocery-household", new Vector3(2.4, 1.8, .62), grocery(4.45, .9, -2.6), materials.teal);
  box(scene, "grocery-checkout", new Vector3(3.4, 1.05, 1.1), grocery(.8, .52, -2.55), materials.mint);
  box(scene, "grocery-counter-top", new Vector3(3.55, .14, 1.2), grocery(.8, 1.08, -2.55), materials.white);
  const register = box(scene, "grocery-register", new Vector3(.75, .5, .55), grocery(1.65, 1.38, -2.5), materials.dark);
  register.isPickable = false;
  addHotspot("grocery-checkout", "grocery", grocery(.8, 1.2, -2.55), new Vector3(3.7, 1.2, 1.5));
  addHotspot("grocery-stock", "grocery", grocery(5.25, 1.2, 2.85), new Vector3(1.1, 2.6, 1.0));
  const groceryToStreet = box(scene, "grocery-exit-door", new Vector3(.75, 2.5, .3), grocery(-5.65, 1.25, -3.2), materials.teal);

  const productDefinitions: ReadonlyArray<[string, Vector3, StandardMaterial]> = [
    ["shop-bread", grocery(-3.4, 1.15, -2.45), materials.white],
    ["shop-cheese", grocery(3.15, .95, .15), materials.yellow],
    ["shop-apple", grocery(3.55, .95, .15), materials.pink],
    ["shop-banana", grocery(3.95, .95, .15), materials.yellow],
    ["shop-berries", grocery(4.35, .95, .15), materials.pink],
    ["shop-vegetables", grocery(3.15, .95, .55), materials.green],
    ["shop-juice", grocery(3.95, 1.25, 2.45), materials.pink],
    ["shop-milk", grocery(4.45, 1.25, 2.45), materials.white],
    ["shop-tea-leaves", grocery(-3.2, 1.55, 1.55), materials.green],
    ["shop-cupcake", grocery(-4.65, 1.25, -2.45), materials.pink],
    ["shop-cake-mix", grocery(-2.6, 1.55, .3), materials.blue],
    ["shop-cereal", grocery(-2.1, 1.55, 2.8), materials.yellow],
    ["shop-cloth", grocery(4.1, 1.25, -2.3), materials.blue],
    ["shop-soap", grocery(4.5, 1.25, -2.3), materials.pink],
    ["shop-toothbrush", grocery(4.9, 1.25, -2.3), materials.teal],
    ["shop-toothpaste", grocery(4.1, .75, -2.3), materials.white],
    ["shop-flowers", grocery(4.5, .75, -2.3), materials.pink],
    ["shop-gift", grocery(4.9, .75, -2.3), materials.yellow],
  ];
  for (const [id, position, productMaterial] of productDefinitions) {
    const product = id.includes("juice") || id.includes("milk")
      ? cylinder(scene, `draggable-${id}`, .28, .52, position, productMaterial)
      : box(scene, `draggable-${id}`, new Vector3(.38, .34, .3), position, productMaterial);
    productHotspots[id] = product;
    product.metadata = { groceryProduct: id, room: "grocery" satisfies RoomId };
  }

  const shoppingBasket = box(scene, "draggable-shopping-basket", new Vector3(.75, .48, .48), grocery(-4.8, .3, -1.45), materials.yellow);
  const shoppingBag = box(scene, "draggable-shopping-bag", new Vector3(.65, .72, .34), grocery(2.55, .42, -2.55), materials.cream);
  shoppingBag.setEnabled(false);

  return {
    doors: { parkToStreet, groceryToStreet },
    hotspots,
    productHotspots,
    containerMeshes: {
      shoppingBasket,
      shoppingBag,
      picnicBasket,
      wateringCan,
      camera,
    },
    detailMeshes,
  };
}
