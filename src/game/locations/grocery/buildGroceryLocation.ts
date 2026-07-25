import {
  type Mesh,
  type Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import type { RoomId } from "../../storage";
import { box as sharedBox, cylinder as sharedCylinder } from "../../shared/meshHelpers";
import type { World3LocationMaterials } from "../../world3Locations";
import type { LocationBuildResult } from "../../world/LocationBuildResult";

export interface GroceryLocationBuild extends LocationBuildResult {
  groceryToStreet: Mesh;
  hotspots: Record<string, Mesh>;
  productHotspots: Record<string, Mesh>;
  containers: { shoppingBasket: Mesh; shoppingBag: Mesh };
  detailMeshes: Mesh[];
}

function cylinder(scene: Scene, name: string, diameter: number, height: number, position: Vector3, material: StandardMaterial): Mesh {
  return sharedCylinder(scene, name, diameter, height, position, material, 12);
}

function box(
  scene: Scene,
  name: string,
  size: Vector3,
  position: Vector3,
  material: StandardMaterial,
  parent?: TransformNode,
): Mesh {
  const mesh = sharedBox(scene, name, size, position, material, parent);
  mesh.receiveShadows = false;
  return mesh;
}

function markWalkable(mesh: Mesh, room: RoomId): void {
  mesh.metadata = { walkable: true, room };
}

export function buildGroceryLocation(scene: Scene, groceryOffsetX: number, materials: World3LocationMaterials): GroceryLocationBuild {
  const root = new TransformNode("location-grocery-root", scene);
  const meshStart = scene.meshes.length;
  const grocery = (x: number, y: number, z: number): Vector3 => new Vector3(x + groceryOffsetX, y, z);
  const hotspots: Record<string, Mesh> = {};
  const productHotspots: Record<string, Mesh> = {};
  const detailMeshes: Mesh[] = [];
  const hotspotMaterial = materials.hotspot;
  const addHotspot = (id: string, room: RoomId, position: Vector3, size: Vector3): Mesh => {
    const mesh = box(scene, `world3-${id}`, size, position, hotspotMaterial);
    mesh.metadata = { world3Action: id, room };
    hotspots[id] = mesh;
    return mesh;
  };

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

  const ownedMeshes = scene.meshes.slice(meshStart);
  for (const mesh of ownedMeshes) if (!mesh.parent) mesh.parent = root;
  return {
    id: "grocery",
    root,
    groceryToStreet,
    hotspots,
    productHotspots,
    containers: { shoppingBasket, shoppingBag },
    detailMeshes,
    interactiveMeshes: [...Object.values(hotspots), ...Object.values(productHotspots)],
    seats: [],
    placementSlots: [],
    activate: () => undefined,
    deactivate: () => undefined,
    dispose: () => root.dispose(false, false),
  };
}
