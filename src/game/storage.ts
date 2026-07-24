import type { AbstractMesh, Vector3 } from "@babylonjs/core";

const STORAGE_KEY = "khadijas-world:world-2";
const WORLD_1_STORAGE_KEY = "khadijas-world:world-1";
const PLAY_1_STORAGE_KEY = "khadijas-world:play-1";
const FOUNDATION_2_STORAGE_KEY = "khadijas-world:foundation-2";
const FOUNDATION_1_STORAGE_KEY = "khadijas-world:foundation-1";

interface StoredPosition {
  x: number;
  y: number;
  z: number;
}

export type OutfitId = "pink" | "teal" | "yellow";
export type RoomId = "home" | "bedroom" | "street" | "cafe";

export interface PrototypeSave {
  version: 5;
  props: Record<string, StoredPosition>;
  cupboardOpen: boolean;
  lampOn: boolean;
  bedroomLampOn: boolean;
  khadijaPosition: StoredPosition;
  qualityPreset: "adaptive" | "low" | "balanced";
  outfit: OutfitId;
  heldItem: string | null;
  seated: boolean;
  activeRoom: RoomId;
}

const fallbackSave = (): PrototypeSave => ({
  version: 5,
  props: {},
  cupboardOpen: false,
  lampOn: true,
  bedroomLampOn: true,
  khadijaPosition: { x: -0.1, y: 0, z: -0.85 },
  qualityPreset: "adaptive",
  outfit: "pink",
  heldItem: null,
  seated: false,
  activeRoom: "home",
});

function readJson(key: string): Partial<PrototypeSave> | null {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as Partial<PrototypeSave> : null;
  } catch {
    return null;
  }
}

function inferRoomFromX(x: number): RoomId {
  if (x > 56) return "cafe";
  if (x > 34) return "street";
  if (x > 12) return "bedroom";
  return "home";
}

export function loadSave(): PrototypeSave {
  const parsed = readJson(STORAGE_KEY)
    ?? readJson(WORLD_1_STORAGE_KEY)
    ?? readJson(PLAY_1_STORAGE_KEY)
    ?? readJson(FOUNDATION_2_STORAGE_KEY)
    ?? readJson(FOUNDATION_1_STORAGE_KEY);
  const fallback = fallbackSave();
  if (!parsed) return fallback;

  const savedX = parsed.khadijaPosition?.x ?? fallback.khadijaPosition.x;
  const inferredRoom = inferRoomFromX(savedX);
  const storedRoom = parsed.activeRoom;
  const activeRoom: RoomId = storedRoom === "home"
    || storedRoom === "bedroom"
    || storedRoom === "street"
    || storedRoom === "cafe"
    ? storedRoom
    : inferredRoom;

  return {
    version: 5,
    props: parsed.props ?? {},
    cupboardOpen: parsed.cupboardOpen ?? false,
    lampOn: parsed.lampOn ?? true,
    bedroomLampOn: parsed.bedroomLampOn ?? true,
    khadijaPosition: parsed.khadijaPosition ?? fallback.khadijaPosition,
    qualityPreset: parsed.qualityPreset === "low" || parsed.qualityPreset === "balanced"
      ? parsed.qualityPreset
      : "adaptive",
    outfit: parsed.outfit === "teal" || parsed.outfit === "yellow" ? parsed.outfit : "pink",
    heldItem: typeof parsed.heldItem === "string" ? parsed.heldItem : null,
    seated: parsed.seated ?? false,
    activeRoom,
  };
}

function writeSave(save: PrototypeSave): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

export function saveProp(mesh: AbstractMesh): void {
  const save = loadSave();
  save.props[mesh.name] = {
    x: mesh.position.x,
    y: mesh.position.y,
    z: mesh.position.z,
  };
  writeSave(save);
}

export function saveRoomState(
  state: Pick<PrototypeSave, "cupboardOpen" | "lampOn" | "bedroomLampOn">,
): void {
  const save = loadSave();
  save.cupboardOpen = state.cupboardOpen;
  save.lampOn = state.lampOn;
  save.bedroomLampOn = state.bedroomLampOn;
  writeSave(save);
}

export function saveKhadijaPosition(position: Vector3): void {
  const save = loadSave();
  save.khadijaPosition = { x: position.x, y: 0, z: position.z };
  writeSave(save);
}

export function saveQualityPreset(preset: PrototypeSave["qualityPreset"]): void {
  const save = loadSave();
  save.qualityPreset = preset;
  writeSave(save);
}

export function savePlayState(
  state: Pick<PrototypeSave, "outfit" | "heldItem" | "seated" | "activeRoom">,
): void {
  const save = loadSave();
  save.outfit = state.outfit;
  save.heldItem = state.heldItem;
  save.seated = state.seated;
  save.activeRoom = state.activeRoom;
  writeSave(save);
}

export function restoreProp(mesh: AbstractMesh): void {
  const position = loadSave().props[mesh.name];
  if (!position) return;
  mesh.position.set(position.x, position.y, position.z);
}

export function resetSave(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(WORLD_1_STORAGE_KEY);
  localStorage.removeItem(PLAY_1_STORAGE_KEY);
  localStorage.removeItem(FOUNDATION_2_STORAGE_KEY);
  localStorage.removeItem(FOUNDATION_1_STORAGE_KEY);
}
