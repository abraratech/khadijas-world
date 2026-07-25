import type {
  Mesh,
  Scene,
  StandardMaterial,
} from "@babylonjs/core";
import { buildGroceryLocation } from "./locations/grocery/buildGroceryLocation";
import { buildParkLocation } from "./locations/park/buildParkLocation";
import type { GroceryLocationBuild } from "./locations/grocery/buildGroceryLocation";
import type { ParkLocationBuild } from "./locations/park/buildParkLocation";

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
  hotspot: StandardMaterial;
}

export interface World3LocationBuild {
  locations: {
    park: ParkLocationBuild;
    grocery: GroceryLocationBuild;
  };
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

/**
 * Compatibility aggregator for the existing runtime. Geometry ownership lives
 * in the individual park and grocery builders.
 */
export function createWorld3Locations(
  scene: Scene,
  parkOffsetX: number,
  groceryOffsetX: number,
  materials: World3LocationMaterials,
): World3LocationBuild {
  const park = buildParkLocation(scene, parkOffsetX, materials);
  const grocery = buildGroceryLocation(scene, groceryOffsetX, materials);
  return {
    locations: { park, grocery },
    doors: {
      parkToStreet: park.parkToStreet,
      groceryToStreet: grocery.groceryToStreet,
    },
    hotspots: {
      ...park.hotspots,
      ...grocery.hotspots,
    },
    productHotspots: grocery.productHotspots,
    containerMeshes: {
      shoppingBasket: grocery.containers.shoppingBasket,
      shoppingBag: grocery.containers.shoppingBag,
      picnicBasket: park.containers.picnicBasket,
      wateringCan: park.containers.wateringCan,
      camera: park.containers.camera,
    },
    detailMeshes: [
      ...park.detailMeshes,
      ...grocery.detailMeshes,
    ],
  };
}
