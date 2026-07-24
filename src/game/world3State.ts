export interface ParkState {
  flowersWatered: boolean;
  birdsFed: boolean;
  rubbishBinned: boolean;
  picnicReady: boolean;
  signReads: number;
  playgroundUses: number;
  photosTaken: number;
}

export interface GroceryState {
  visits: number;
  checkoutCount: number;
  bagsPacked: number;
  productsSelected: Record<string, number>;
}

export interface World3State {
  park: ParkState;
  grocery: GroceryState;
  recentEvents: string[];
}

export function createDefaultWorld3State(): World3State {
  return {
    park: {
      flowersWatered: false,
      birdsFed: false,
      rubbishBinned: false,
      picnicReady: false,
      signReads: 0,
      playgroundUses: 0,
      photosTaken: 0,
    },
    grocery: {
      visits: 0,
      checkoutCount: 0,
      bagsPacked: 0,
      productsSelected: {},
    },
    recentEvents: [],
  };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

export function normalizeWorld3State(value: unknown): World3State {
  const fallback = createDefaultWorld3State();
  if (!value || typeof value !== "object") return fallback;
  const candidate = record(value);
  const park = record(candidate.park);
  const grocery = record(candidate.grocery);
  const products = record(grocery.productsSelected);
  fallback.park = {
    flowersWatered: park.flowersWatered === true,
    birdsFed: park.birdsFed === true,
    rubbishBinned: park.rubbishBinned === true,
    picnicReady: park.picnicReady === true,
    signReads: safeCount(park.signReads),
    playgroundUses: safeCount(park.playgroundUses),
    photosTaken: safeCount(park.photosTaken),
  };
  fallback.grocery.visits = safeCount(grocery.visits);
  fallback.grocery.checkoutCount = safeCount(grocery.checkoutCount);
  fallback.grocery.bagsPacked = safeCount(grocery.bagsPacked);
  for (const [id, count] of Object.entries(products)) {
    if (!/^[a-z0-9-]{1,48}$/.test(id)) continue;
    fallback.grocery.productsSelected[id] = safeCount(count);
  }
  if (Array.isArray(candidate.recentEvents)) {
    fallback.recentEvents = candidate.recentEvents
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 64))
      .filter(Boolean)
      .slice(-12);
  }
  return fallback;
}

function safeCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(999, Math.floor(value)))
    : 0;
}

export function recordWorld3Event(state: World3State, event: string): void {
  state.recentEvents = [...state.recentEvents.filter((entry) => entry !== event), event].slice(-12);
}

