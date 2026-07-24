import type { OutfitId, RoomId } from "./storage";

export const CHARACTER_IDS = ["khadija", "sister", "brother"] as const;

export type CharacterId = typeof CHARACTER_IDS[number];
export type CharacterExpression = "happy" | "excited" | "sleepy" | "surprised" | "neutral";
export type CharacterActivity = "standing" | "sitting" | "sleeping";
export type CharacterInteraction =
  | "idle"
  | "walking"
  | "hugging"
  | "reading"
  | "eating"
  | "drinking";

export interface StoredVector {
  x: number;
  y: number;
  z: number;
}

export interface CharacterState {
  id: CharacterId;
  room: RoomId;
  position: StoredVector;
  rotationY: number;
  outfit: OutfitId;
  expression: CharacterExpression;
  heldItem: string | null;
  activity: CharacterActivity;
  interaction: CharacterInteraction;
  seatId: string | null;
  sleeping: boolean;
}

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  shortName: string;
  scale: number;
  initialOutfit: OutfitId;
  initialExpression: CharacterExpression;
}

export const CHARACTER_DEFINITIONS: Record<CharacterId, CharacterDefinition> = {
  khadija: {
    id: "khadija",
    name: "Khadija",
    shortName: "Khadija",
    scale: 1,
    initialOutfit: "pink",
    initialExpression: "happy",
  },
  sister: {
    id: "sister",
    name: "Khadija's little sister",
    shortName: "Little sister",
    scale: .72,
    initialOutfit: "yellow",
    initialExpression: "excited",
  },
  brother: {
    id: "brother",
    name: "Khadija's brother",
    shortName: "Brother",
    scale: .88,
    initialOutfit: "teal",
    initialExpression: "neutral",
  },
};

export function createDefaultCharacterStates(): Record<CharacterId, CharacterState> {
  return {
    khadija: {
      id: "khadija",
      room: "home",
      position: { x: -.1, y: 0, z: -.85 },
      rotationY: 0,
      outfit: "pink",
      expression: "happy",
      heldItem: null,
      activity: "standing",
      interaction: "idle",
      seatId: null,
      sleeping: false,
    },
    sister: {
      id: "sister",
      room: "home",
      position: { x: 1.3, y: 0, z: -1.65 },
      rotationY: 0,
      outfit: "yellow",
      expression: "excited",
      heldItem: null,
      activity: "standing",
      interaction: "idle",
      seatId: null,
      sleeping: false,
    },
    brother: {
      id: "brother",
      room: "home",
      position: { x: -3.15, y: 0, z: .1 },
      rotationY: 0,
      outfit: "teal",
      expression: "neutral",
      heldItem: null,
      activity: "standing",
      interaction: "idle",
      seatId: null,
      sleeping: false,
    },
  };
}

export function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === "string" && CHARACTER_IDS.includes(value as CharacterId);
}

export function isCharacterExpression(value: unknown): value is CharacterExpression {
  return value === "happy"
    || value === "excited"
    || value === "sleepy"
    || value === "surprised"
    || value === "neutral";
}
