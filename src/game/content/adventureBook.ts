import type { ContentState } from "../contentState";
import {
  ADVENTURES,
  ADVENTURE_IDS,
  CONTENT_ROOM_IDS,
  type AdventureDefinition,
  type AdventureId,
  type ContentRoomId,
} from "./adventureCatalog";

export { ADVENTURES };

export interface AdventureAction {
  room: ContentRoomId;
  message: string;
  sound?: string;
}

export interface AdventureCompletion {
  id: AdventureId;
  title: string;
  stars: number;
  sticker: string;
  stickerLabel: string;
}

export interface AdventureUpdate {
  changed: boolean;
  completions: AdventureCompletion[];
}

const ALL_ROOMS: readonly ContentRoomId[] = CONTENT_ROOM_IDS;

const definitionById = new Map<AdventureId, AdventureDefinition>(
  ADVENTURES.map((definition) => [definition.id, definition]),
);

function isAdventureId(value: string): value is AdventureId {
  return ADVENTURE_IDS.includes(value as AdventureId);
}

function lower(message: string): string {
  return message.trim().toLowerCase();
}

function actionAdventureIds(action: AdventureAction): AdventureId[] {
  const message = lower(action.message);
  const result: AdventureId[] = [];

  if (
    ["swish, wipe, sparkle", "books are back", "clothes folded", "rubbish is safely", "dish is clean"]
      .some((phrase) => message.includes(phrase))
  ) result.push("home-helper");

  if (message.includes("reads the book")) result.push("story-time");

  if (action.sound === "recipe") result.push("kitchen-creator");

  if (
    ["bubbly hands", "shiny smile", "bath time", "warm, fluffy", "wonderful smile"]
      .some((phrase) => message.includes(phrase))
  ) result.push("self-care-star");

  if (
    message.includes("gave the")
    || message.includes("says thank you")
    || message.includes("high-five")
    || message.includes("together!")
  ) result.push("neighborhood-friend");

  if (message.includes("riding the scooter")) result.push("scooter-story");

  if (
    action.room === "cafe"
    && (
      message.includes("barista")
      || message.includes("ms. sana")
      || message.includes("counter bell")
      || message.includes("return tray")
      || message.includes("tucked away neatly")
    )
  ) result.push("cafe-helper");

  if (
    action.room === "park"
    && ["flowers look refreshed", "birds enjoy", "park is tidy"]
      .some((phrase) => message.includes(phrase))
  ) result.push("park-caretaker");

  if (
    action.room === "park"
    && ["down the slide", "swings back and forth", "sandcastle"]
      .some((phrase) => message.includes(phrase))
  ) result.push("playground-fun");

  if (
    action.room === "park"
    && (message.includes("cheerful picnic") || message.includes("family picnic"))
  ) result.push("picnic-planner");

  if (message.includes("pretend checkout complete")) result.push("smart-shopper");

  if (message.includes("pretend photo for the story album")) result.push("photo-story");

  return result;
}

interface AdventureMemoryContext {
  npcId?: string;
  characterId?: string;
  itemId?: string;
}

export type AdventureMemoryEvent = AdventureMemoryContext & (
  | { kind: "gift" }
  | { kind: "activity"; activityId: string }
  | { kind: "event"; eventId: string }
  | { kind: "visit" }
);

function memoryAdventureIds(event: AdventureMemoryEvent): AdventureId[] {
  if (event.kind === "gift" || event.kind === "activity") {
    return ["neighborhood-friend"];
  }
  return [];
}

function syncDerivedState(state: ContentState): void {
  const completed = state.adventureCompleted.filter(isAdventureId);
  state.adventureCompleted = [...new Set(completed)];
  state.adventureStars = state.adventureCompleted.reduce(
    (total, id) => total + (definitionById.get(id)?.stars ?? 0),
    0,
  );
  state.adventureStickers = state.adventureCompleted.map(
    (id) => definitionById.get(id)?.stickerLabel ?? id,
  );

  if (
    state.adventureActiveId
    && state.adventureCompleted.includes(state.adventureActiveId)
  ) state.adventureActiveId = null;

  if (!state.adventureActiveId) {
    state.adventureActiveId = ADVENTURES.find(
      (definition) => !state.adventureCompleted.includes(definition.id),
    )?.id ?? null;
  }
}

function complete(
  state: ContentState,
  ids: readonly AdventureId[],
  countEncore = true,
): AdventureUpdate {
  let changed = false;
  const completions: AdventureCompletion[] = [];

  for (const id of [...new Set(ids)]) {
    const definition = definitionById.get(id);
    if (!definition) continue;

    if (state.adventureCompleted.includes(id)) {
      if (countEncore) {
        state.adventureEncoreCounts[id] = Math.min(
          999,
          (state.adventureEncoreCounts[id] ?? 0) + 1,
        );
        changed = true;
      }
      continue;
    }

    state.adventureCompleted.push(id);
    completions.push({
      id,
      title: definition.title,
      stars: definition.stars,
      sticker: definition.sticker,
      stickerLabel: definition.stickerLabel,
    });
    changed = true;
  }

  if (changed) syncDerivedState(state);
  return { changed, completions };
}

export function recordAdventureAction(
  state: ContentState,
  action: AdventureAction,
): AdventureUpdate {
  return complete(state, actionAdventureIds(action));
}

export function recordAdventureMemoryEvent(
  state: ContentState,
  event: AdventureMemoryEvent,
): AdventureUpdate {
  return complete(state, memoryAdventureIds(event), false);
}

export function recordAdventureRoom(
  state: ContentState,
  room: ContentRoomId,
): AdventureUpdate {
  let changed = false;
  if (!state.adventureVisitedRooms.includes(room)) {
    state.adventureVisitedRooms.push(room);
    changed = true;
  }

  const completions = ALL_ROOMS.every(
    (roomId) => state.adventureVisitedRooms.includes(roomId),
  )
    ? complete(state, ["world-explorer"], false)
    : { changed: false, completions: [] };

  if (changed && !completions.changed) syncDerivedState(state);
  return {
    changed: changed || completions.changed,
    completions: completions.completions,
  };
}

export function rotateActiveAdventure(state: ContentState): void {
  const incomplete = ADVENTURES.filter(
    (definition) => !state.adventureCompleted.includes(definition.id),
  );

  if (incomplete.length === 0) {
    state.adventureActiveId = null;
    return;
  }

  const currentIndex = incomplete.findIndex(
    (definition) => definition.id === state.adventureActiveId,
  );
  state.adventureActiveId = incomplete[(currentIndex + 1) % incomplete.length].id;
}

export function activeAdventure(
  state: ContentState,
): AdventureDefinition | null {
  syncDerivedState(state);
  return state.adventureActiveId
    ? definitionById.get(state.adventureActiveId) ?? null
    : null;
}

export function adventureById(
  id: AdventureId,
): AdventureDefinition {
  const definition = definitionById.get(id);
  if (!definition) throw new Error(`Unknown adventure: ${id}`);
  return definition;
}

export function adventureProgress(state: ContentState): {
  completed: number;
  total: number;
  stars: number;
  encoreMoments: number;
  visitedRooms: number;
  current: AdventureDefinition | null;
} {
  syncDerivedState(state);
  return {
    completed: state.adventureCompleted.length,
    total: ADVENTURES.length,
    stars: state.adventureStars,
    encoreMoments: Object.values(state.adventureEncoreCounts)
      .reduce((total, count) => total + count, 0),
    visitedRooms: state.adventureVisitedRooms.length,
    current: activeAdventure(state),
  };
}