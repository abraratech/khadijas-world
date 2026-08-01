import {
  ADVENTURE_IDS,
  ADVENTURES,
  CONTENT_ROOM_IDS,
  type AdventureId,
  type ContentRoomId,
} from "./content/adventureCatalog";

export interface ContentState {
  homeTvOn: boolean;
  bedroomMusicBoxOn: boolean;
  streetMailboxOpen: boolean;
  cafeBellCount: number;
  adventureCompleted: AdventureId[];
  adventureVisitedRooms: ContentRoomId[];
  adventureStars: number;
  adventureStickers: string[];
  adventureActiveId: AdventureId | null;
  adventureEncoreCounts: Partial<Record<AdventureId, number>>;
}

export function createDefaultContentState(): ContentState {
  return {
    homeTvOn: false,
    bedroomMusicBoxOn: false,
    streetMailboxOpen: false,
    cafeBellCount: 0,
    adventureCompleted: [],
    adventureVisitedRooms: [],
    adventureStars: 0,
    adventureStickers: [],
    adventureActiveId: ADVENTURES[0]?.id ?? null,
    adventureEncoreCounts: {},
  };
}


function isAdventureId(value: string): value is AdventureId {
  return ADVENTURE_IDS.includes(value as AdventureId);
}

function isRoomId(value: string): value is ContentRoomId {
  return CONTENT_ROOM_IDS.includes(value as ContentRoomId);
}

function cleanStringArray(
  value: unknown,
  predicate: (entry: string) => boolean,
): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value.filter(
      (entry): entry is string => typeof entry === "string" && predicate(entry),
    ),
  )];
}

export function normalizeContentState(value: unknown): ContentState {
  const fallback = createDefaultContentState();
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<ContentState> & {
    adventureEncoreCounts?: unknown;
  };

  fallback.homeTvOn = candidate.homeTvOn === true;
  fallback.bedroomMusicBoxOn = candidate.bedroomMusicBoxOn === true;
  fallback.streetMailboxOpen = candidate.streetMailboxOpen === true;
  fallback.cafeBellCount = typeof candidate.cafeBellCount === "number"
    ? Math.max(0, Math.min(999, Math.floor(candidate.cafeBellCount)))
    : 0;

  fallback.adventureCompleted = cleanStringArray(
    candidate.adventureCompleted,
    isAdventureId,
  ) as AdventureId[];
  fallback.adventureVisitedRooms = cleanStringArray(
    candidate.adventureVisitedRooms,
    isRoomId,
  ) as ContentRoomId[];

  const completedDefinitions = ADVENTURES.filter(
    (definition) => fallback.adventureCompleted.includes(definition.id),
  );
  fallback.adventureStars = completedDefinitions.reduce(
    (total, definition) => total + definition.stars,
    0,
  );
  fallback.adventureStickers = completedDefinitions.map(
    (definition) => definition.stickerLabel,
  );

  const active = candidate.adventureActiveId;
  fallback.adventureActiveId = typeof active === "string"
    && isAdventureId(active)
    && !fallback.adventureCompleted.includes(active)
    ? active
    : ADVENTURES.find(
      (definition) => !fallback.adventureCompleted.includes(definition.id),
    )?.id ?? null;

  const encore = candidate.adventureEncoreCounts;
  if (encore && typeof encore === "object") {
    for (const [id, count] of Object.entries(encore)) {
      if (!isAdventureId(id) || typeof count !== "number" || !Number.isFinite(count)) {
        continue;
      }
      fallback.adventureEncoreCounts[id] = Math.max(
        0,
        Math.min(999, Math.floor(count)),
      );
    }
  }

  return fallback;
}
