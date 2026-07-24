import {
  acceptsCombinationInput,
  findCompletedCombination,
  type CombinationDefinition,
} from "./combinationRegistry";
import {
  CONTAINER_IDS,
  STORAGE_IDS,
  type ContainerId,
  type EverydayState,
  type StationId,
  type StorageId,
} from "./everydayState";

const CONTAINER_CAPACITY: Record<ContainerId, number> = {
  backpack: 3,
  basket: 3,
  "serving-tray": 3,
  "shopping-basket": 6,
  "shopping-bag": 8,
  "picnic-basket": 4,
  "prep-plate": 2,
  "mixing-bowl": 2,
  "toy-box": 4,
};

const STORAGE_CAPACITY: Record<StorageId, number> = {
  "kitchen-cupboard": 8,
  "kitchen-drawer": 3,
  "fridge-shelves": 12,
  "wardrobe-shelves": 4,
  "toy-box": 4,
  "cafe-display": 5,
  "return-tray": 4,
};

export interface PutResult {
  accepted: boolean;
  message: string;
}

export class EverydayStorageController {
  constructor(private readonly state: EverydayState) {}

  toggle(id: StorageId): boolean {
    this.state.storageOpen[id] = !this.state.storageOpen[id];
    return this.state.storageOpen[id];
  }

  put(id: StorageId, itemId: string): PutResult {
    const contents = this.state.storageContents[id];
    if (contents.length >= STORAGE_CAPACITY[id]) {
      return { accepted: false, message: "That spot is full. Try another place!" };
    }
    if (id === "toy-box" && !["teddy", "toy-block"].includes(itemId)) {
      return { accepted: false, message: "Only toys belong in the toy box." };
    }
    if (id === "wardrobe-shelves" && !["towel", "clothes"].includes(itemId)) {
      return { accepted: false, message: "Clothes and towels fit here best." };
    }
    if (id === "return-tray" && !["cup", "prep-plate", "mixing-bowl"].includes(itemId)) {
      return { accepted: false, message: "The return tray is for cups and dishes." };
    }
    contents.push(itemId);
    return { accepted: true, message: "Tucked away neatly!" };
  }

  take(id: StorageId): string | null {
    return this.state.storageContents[id].shift() ?? null;
  }
}

export class ContainerController {
  constructor(private readonly state: EverydayState) {}

  isContainer(id: string): id is ContainerId {
    return CONTAINER_IDS.includes(id as ContainerId);
  }

  put(id: ContainerId, itemId: string): PutResult {
    if (id === itemId) return { accepted: false, message: "That cannot go inside itself." };
    const contents = this.state.containerContents[id];
    if (contents.length >= CONTAINER_CAPACITY[id]) {
      return { accepted: false, message: "This is full. Take something out first!" };
    }
    if (id === "toy-box" && !["teddy", "toy-block"].includes(itemId)) {
      return { accepted: false, message: "The toy box is saving room for toys." };
    }
    contents.push(itemId);
    return { accepted: true, message: `Placed in the ${friendlyName(id)}.` };
  }

  take(id: ContainerId): string | null {
    return this.state.containerContents[id].shift() ?? null;
  }

  capacity(id: ContainerId): number {
    return CONTAINER_CAPACITY[id];
  }
}

export class RecipeSystem {
  constructor(private readonly state: EverydayState) {}

  addInput(station: StationId, itemId: string): PutResult {
    const inputs = this.state.stationInputs[station];
    if (!acceptsCombinationInput(station, inputs, itemId)) {
      return { accepted: false, message: "That ingredient belongs somewhere else." };
    }
    inputs.push(itemId);
    return { accepted: true, message: "Ingredient placed. What comes next?" };
  }

  completed(station: StationId): CombinationDefinition | null {
    return findCompletedCombination(station, this.state.stationInputs[station]);
  }

  finish(recipe: CombinationDefinition): void {
    if (recipe.consumeInputs) this.state.stationInputs[recipe.station as StationId] = [];
    this.state.preparedCounts[recipe.result] = (this.state.preparedCounts[recipe.result] ?? 0) + 1;
  }
}

export function isStorageId(value: string): value is StorageId {
  return STORAGE_IDS.includes(value as StorageId);
}

export function friendlyName(value: string): string {
  return value.replace(/^prepared-/, "").replaceAll("-", " ");
}
