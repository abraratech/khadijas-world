import type { CharacterId } from "./characterState";

export const STORAGE_IDS = [
  "kitchen-cupboard",
  "kitchen-drawer",
  "fridge-shelves",
  "wardrobe-shelves",
  "toy-box",
  "cafe-display",
  "return-tray",
] as const;
export type StorageId = typeof STORAGE_IDS[number];

export const CONTAINER_IDS = [
  "backpack",
  "basket",
  "serving-tray",
  "shopping-basket",
  "shopping-bag",
  "picnic-basket",
  "prep-plate",
  "mixing-bowl",
  "toy-box",
] as const;
export type ContainerId = typeof CONTAINER_IDS[number];

export const STATION_IDS = [
  "mixing-bowl",
  "prep-plate",
  "toaster",
  "blender",
  "oven",
  "kettle",
] as const;
export type StationId = typeof STATION_IDS[number];

export interface HygieneState {
  handsWashed: boolean;
  teethBrushed: boolean;
  bathBubblesReady: boolean;
  towelDry: boolean;
  mirrorSmiles: number;
}

export interface EverydayState {
  storageOpen: Record<StorageId, boolean>;
  storageContents: Record<StorageId, string[]>;
  containerContents: Record<ContainerId, string[]>;
  stationInputs: Record<StationId, string[]>;
  preparedCounts: Record<string, number>;
  dishClean: Record<string, boolean>;
  appliances: {
    fridgeOpen: boolean;
    kettleWarm: boolean;
    ovenWarm: boolean;
  };
  cleaning: {
    homeTableClean: boolean;
    kitchenCounterClean: boolean;
    toysTidy: boolean;
    booksTidy: boolean;
    clothesTidy: boolean;
    rubbishBinned: boolean;
  };
  hygiene: Record<CharacterId, HygieneState>;
}

const storageDefaults = (): Record<StorageId, string[]> => ({
  "kitchen-cupboard": ["tea-leaves", "cup"],
  "kitchen-drawer": ["sponge"],
  "fridge-shelves": ["bread", "cheese", "berries", "cake-mix", "banana", "apple"],
  "wardrobe-shelves": ["towel"],
  "toy-box": [],
  "cafe-display": [],
  "return-tray": [],
});

const containerDefaults = (): Record<ContainerId, string[]> => ({
  backpack: [],
  basket: [],
  "serving-tray": [],
  "shopping-basket": [],
  "shopping-bag": [],
  "picnic-basket": [],
  "prep-plate": [],
  "mixing-bowl": [],
  "toy-box": [],
});

const stationDefaults = (): Record<StationId, string[]> => ({
  "mixing-bowl": [],
  "prep-plate": [],
  toaster: [],
  blender: [],
  oven: [],
  kettle: [],
});

const hygieneDefault = (): HygieneState => ({
  handsWashed: false,
  teethBrushed: false,
  bathBubblesReady: false,
  towelDry: true,
  mirrorSmiles: 0,
});

export function createDefaultEverydayState(): EverydayState {
  return {
    storageOpen: {
      "kitchen-cupboard": false,
      "kitchen-drawer": false,
      "fridge-shelves": false,
      "wardrobe-shelves": false,
      "toy-box": false,
      "cafe-display": false,
      "return-tray": false,
    },
    storageContents: storageDefaults(),
    containerContents: containerDefaults(),
    stationInputs: stationDefaults(),
    preparedCounts: {},
    dishClean: { cup: true, "prep-plate": true, "mixing-bowl": true },
    appliances: { fridgeOpen: false, kettleWarm: false, ovenWarm: false },
    cleaning: {
      homeTableClean: false,
      kitchenCounterClean: false,
      toysTidy: false,
      booksTidy: false,
      clothesTidy: false,
      rubbishBinned: false,
    },
    hygiene: {
      khadija: hygieneDefault(),
      sister: hygieneDefault(),
      brother: hygieneDefault(),
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function cleanItems(value: unknown, seen: Set<string>): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || item.length > 48 || seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }
  return result;
}

export function normalizeEverydayState(value: unknown): EverydayState {
  const fallback = createDefaultEverydayState();
  if (!value || typeof value !== "object") return fallback;
  const candidate = asRecord(value);
  const open = asRecord(candidate.storageOpen);
  const storage = asRecord(candidate.storageContents);
  const containers = asRecord(candidate.containerContents);
  const stations = asRecord(candidate.stationInputs);
  const appliances = asRecord(candidate.appliances);
  const cleaning = asRecord(candidate.cleaning);
  const dishClean = asRecord(candidate.dishClean);
  const preparedCounts = asRecord(candidate.preparedCounts);
  const hygiene = asRecord(candidate.hygiene);
  const seen = new Set<string>();

  for (const id of STORAGE_IDS) {
    fallback.storageOpen[id] = open[id] === true;
    const stored = cleanItems(storage[id], seen);
    if (Array.isArray(storage[id])) fallback.storageContents[id] = stored;
  }
  for (const id of CONTAINER_IDS) {
    const stored = cleanItems(containers[id], seen);
    if (Array.isArray(containers[id])) fallback.containerContents[id] = stored;
  }
  for (const id of STATION_IDS) {
    const stored = cleanItems(stations[id], seen);
    if (Array.isArray(stations[id])) fallback.stationInputs[id] = stored;
  }

  fallback.dishClean = {
    cup: dishClean.cup !== false,
    "prep-plate": dishClean["prep-plate"] !== false,
    "mixing-bowl": dishClean["mixing-bowl"] !== false,
  };
  for (const [itemId, count] of Object.entries(preparedCounts)) {
    if (typeof count !== "number" || !Number.isFinite(count)) continue;
    fallback.preparedCounts[itemId] = Math.max(0, Math.min(999, Math.floor(count)));
  }
  fallback.appliances.fridgeOpen = appliances.fridgeOpen === true;
  fallback.appliances.kettleWarm = appliances.kettleWarm === true;
  fallback.appliances.ovenWarm = appliances.ovenWarm === true;
  fallback.cleaning.homeTableClean = cleaning.homeTableClean === true;
  fallback.cleaning.kitchenCounterClean = cleaning.kitchenCounterClean === true;
  fallback.cleaning.toysTidy = cleaning.toysTidy === true;
  fallback.cleaning.booksTidy = cleaning.booksTidy === true;
  fallback.cleaning.clothesTidy = cleaning.clothesTidy === true;
  fallback.cleaning.rubbishBinned = cleaning.rubbishBinned === true;

  for (const id of ["khadija", "sister", "brother"] as const) {
    const stored = asRecord(hygiene[id]);
    fallback.hygiene[id] = {
      handsWashed: stored.handsWashed === true,
      teethBrushed: stored.teethBrushed === true,
      bathBubblesReady: stored.bathBubblesReady === true,
      towelDry: stored.towelDry !== false,
      mirrorSmiles: typeof stored.mirrorSmiles === "number"
        ? Math.max(0, Math.min(999, Math.floor(stored.mirrorSmiles)))
        : 0,
    };
  }
  return fallback;
}
