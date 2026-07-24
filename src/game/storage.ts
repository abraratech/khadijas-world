import type { AbstractMesh, Vector3 } from "@babylonjs/core";
import {
  CHARACTER_IDS,
  createDefaultCharacterStates,
  isCharacterExpression,
  isCharacterId,
  type CharacterId,
  type CharacterState,
} from "./characterState";
import {
  createDefaultContentState,
  normalizeContentState,
  type ContentState,
} from "./contentState";
import {
  createDefaultNpcStates,
  NPC_IDS,
  normalizeLivingSettings,
  normalizeNpcStates,
  type LivingSettings,
  type NpcId,
  type StoredNpcState,
} from "./livingCharacters";
import {
  createDefaultEverydayState,
  normalizeEverydayState,
  type EverydayState,
} from "./everydayState";
import {
  createDefaultDialogueState,
  normalizeDialogueState,
  type DialogueSaveState,
} from "./npc/NpcMemory";
import {
  createDefaultWorld3State,
  normalizeWorld3State,
  type World3State,
} from "./world3State";

const STORAGE_KEY = "khadijas-world:world-2";
const WORLD_1_STORAGE_KEY = "khadijas-world:world-1";
const PLAY_1_STORAGE_KEY = "khadijas-world:play-1";
const FOUNDATION_2_STORAGE_KEY = "khadijas-world:foundation-2";
const FOUNDATION_1_STORAGE_KEY = "khadijas-world:foundation-1";
const PLAYER_SETTINGS_KEY = "khadijas-world:player-settings";

interface StoredPosition {
  x: number;
  y: number;
  z: number;
}

export type OutfitId = "pink" | "teal" | "yellow";
export type RoomId = "home" | "bedroom" | "street" | "cafe" | "park" | "grocery";

export interface PlayerSettings {
  sound: boolean;
  music: boolean;
}

export interface PrototypeSave {
  version: 10;
  props: Record<string, StoredPosition>;
  cupboardOpen: boolean;
  lampOn: boolean;
  bedroomLampOn: boolean;
  qualityPreset: "adaptive" | "low" | "balanced";
  activeRoom: RoomId;
  selectedCharacter: CharacterId;
  characters: Record<CharacterId, CharacterState>;
  sound: boolean;
  music: boolean;
  content: ContentState;
  livingSettings: LivingSettings;
  npcs: Record<NpcId, StoredNpcState>;
  everyday: EverydayState;
  world3: World3State;
  dialogue: DialogueSaveState;

  // Mirrored legacy fields make older code paths and future downgrade tools safe.
  khadijaPosition: StoredPosition;
  outfit: OutfitId;
  heldItem: string | null;
  seated: boolean;
}

interface LegacySave {
  version?: number;
  props?: Record<string, StoredPosition>;
  cupboardOpen?: boolean;
  lampOn?: boolean;
  bedroomLampOn?: boolean;
  khadijaPosition?: StoredPosition;
  qualityPreset?: string;
  outfit?: string;
  heldItem?: unknown;
  seated?: boolean;
  activeRoom?: unknown;
  selectedCharacter?: unknown;
  characters?: Partial<Record<CharacterId, Partial<CharacterState>>>;
  sound?: boolean;
  music?: boolean;
  content?: unknown;
  livingSettings?: unknown;
  npcs?: unknown;
  everyday?: unknown;
  world3?: unknown;
  dialogue?: unknown;
}

function fallbackSave(): PrototypeSave {
  const characters = createDefaultCharacterStates();
  return {
    version: 10,
    props: {},
    cupboardOpen: false,
    lampOn: true,
    bedroomLampOn: true,
    qualityPreset: "adaptive",
    activeRoom: "home",
    selectedCharacter: "khadija",
    characters,
    sound: true,
    music: false,
    content: createDefaultContentState(),
    livingSettings: normalizeLivingSettings(null),
    npcs: createDefaultNpcStates(),
    everyday: createDefaultEverydayState(),
    world3: createDefaultWorld3State(),
    dialogue: createDefaultDialogueState(),
    khadijaPosition: { ...characters.khadija.position },
    outfit: characters.khadija.outfit,
    heldItem: null,
    seated: false,
  };
}

function readJson(key: string): LegacySave | null {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as LegacySave : null;
  } catch {
    return null;
  }
}

function readLegacyPlayerSettings(): Partial<PlayerSettings> {
  try {
    const stored = localStorage.getItem(PLAYER_SETTINGS_KEY);
    return stored ? JSON.parse(stored) as Partial<PlayerSettings> : {};
  } catch {
    return {};
  }
}

function inferRoomFromX(x: number): RoomId {
  if (x > 100) return "grocery";
  if (x > 78) return "park";
  if (x > 56) return "cafe";
  if (x > 34) return "street";
  if (x > 12) return "bedroom";
  return "home";
}

function normalizeRoom(value: unknown, fallback: RoomId): RoomId {
  return value === "home"
    || value === "bedroom"
    || value === "street"
    || value === "cafe"
    || value === "park"
    || value === "grocery"
    ? value
    : fallback;
}

function normalizeOutfit(value: unknown, fallback: OutfitId): OutfitId {
  return value === "pink" || value === "teal" || value === "yellow" ? value : fallback;
}

function normalizePosition(value: unknown, fallback: StoredPosition): StoredPosition {
  if (!value || typeof value !== "object") return { ...fallback };
  const candidate = value as Partial<StoredPosition>;
  return {
    x: typeof candidate.x === "number" && Number.isFinite(candidate.x) ? candidate.x : fallback.x,
    y: 0,
    z: typeof candidate.z === "number" && Number.isFinite(candidate.z) ? candidate.z : fallback.z,
  };
}

function normalizeCharacter(
  id: CharacterId,
  candidate: Partial<CharacterState> | undefined,
  fallback: CharacterState,
): CharacterState {
  const position = normalizePosition(candidate?.position, fallback.position);
  const room = normalizeRoom(candidate?.room, inferRoomFromX(position.x));
  const activity = candidate?.activity === "sitting" || candidate?.activity === "sleeping"
    ? candidate.activity
    : "standing";
  const interaction = candidate?.interaction === "walking"
    || candidate?.interaction === "hugging"
    || candidate?.interaction === "reading"
    || candidate?.interaction === "eating"
    || candidate?.interaction === "drinking"
    ? candidate.interaction
    : "idle";

  return {
    id,
    room,
    position,
    rotationY: typeof candidate?.rotationY === "number" ? candidate.rotationY : fallback.rotationY,
    outfit: normalizeOutfit(candidate?.outfit, fallback.outfit),
    expression: isCharacterExpression(candidate?.expression)
      ? candidate.expression
      : fallback.expression,
    heldItem: typeof candidate?.heldItem === "string" ? candidate.heldItem : null,
    activity,
    interaction,
    seatId: typeof candidate?.seatId === "string" ? candidate.seatId : null,
    sleeping: candidate?.sleeping === true || activity === "sleeping",
  };
}

function seatIdForLegacyRoom(room: RoomId): string {
  if (room === "bedroom") return "bedroom-bed-1";
  if (room === "street") return "street-bench-1";
  if (room === "cafe") return "cafe-chair-1";
  return "home-sofa-1";
}

export function loadSave(): PrototypeSave {
  const parsed = readJson(STORAGE_KEY)
    ?? readJson(WORLD_1_STORAGE_KEY)
    ?? readJson(PLAY_1_STORAGE_KEY)
    ?? readJson(FOUNDATION_2_STORAGE_KEY)
    ?? readJson(FOUNDATION_1_STORAGE_KEY);
  const fallback = fallbackSave();
  if (!parsed) return fallback;

  const legacyPosition = normalizePosition(parsed.khadijaPosition, fallback.khadijaPosition);
  const legacyRoom = normalizeRoom(parsed.activeRoom, inferRoomFromX(legacyPosition.x));
  const characters = createDefaultCharacterStates();

  if (
    (
      parsed.version === 6
      || parsed.version === 7
      || parsed.version === 8
      || parsed.version === 9
      || parsed.version === 10
    )
    && parsed.characters
  ) {
    for (const id of CHARACTER_IDS) {
      characters[id] = normalizeCharacter(id, parsed.characters[id], characters[id]);
    }
  } else {
    const khadija = characters.khadija;
    khadija.position = legacyPosition;
    khadija.room = legacyRoom;
    khadija.outfit = normalizeOutfit(parsed.outfit, khadija.outfit);
    khadija.heldItem = typeof parsed.heldItem === "string" ? parsed.heldItem : null;
    if (parsed.seated) {
      khadija.activity = legacyRoom === "bedroom" ? "sleeping" : "sitting";
      khadija.sleeping = legacyRoom === "bedroom";
      khadija.seatId = seatIdForLegacyRoom(legacyRoom);
    }
  }

  const selectedCharacter = isCharacterId(parsed.selectedCharacter)
    ? parsed.selectedCharacter
    : "khadija";
  const legacyPlayerSettings = readLegacyPlayerSettings();
  const sound = typeof parsed.sound === "boolean"
    ? parsed.sound
    : legacyPlayerSettings.sound ?? true;
  const music = typeof parsed.music === "boolean"
    ? parsed.music
    : legacyPlayerSettings.music ?? false;
  const activeRoom = normalizeRoom(parsed.activeRoom, characters[selectedCharacter].room);

  return {
    version: 10,
    props: parsed.props ?? {},
    cupboardOpen: parsed.cupboardOpen ?? false,
    lampOn: parsed.lampOn ?? true,
    bedroomLampOn: parsed.bedroomLampOn ?? true,
    qualityPreset: parsed.qualityPreset === "low" || parsed.qualityPreset === "balanced"
      ? parsed.qualityPreset
      : "adaptive",
    activeRoom,
    selectedCharacter,
    characters,
    sound,
    music,
    content: normalizeContentState(parsed.content),
    livingSettings: normalizeLivingSettings(parsed.livingSettings),
    npcs: normalizeNpcStates(parsed.npcs),
    everyday: normalizeEverydayState(parsed.everyday),
    world3: normalizeWorld3State(parsed.world3),
    dialogue: normalizeDialogueState(parsed.dialogue, NPC_IDS),
    khadijaPosition: { ...characters.khadija.position },
    outfit: characters.khadija.outfit,
    heldItem: characters.khadija.heldItem,
    seated: characters.khadija.activity !== "standing",
  };
}

function mirrorLegacyFields(save: PrototypeSave): void {
  const khadija = save.characters.khadija;
  save.khadijaPosition = { ...khadija.position };
  save.outfit = khadija.outfit;
  save.heldItem = khadija.heldItem;
  save.seated = khadija.activity !== "standing";
}

function writeSave(save: PrototypeSave): void {
  mirrorLegacyFields(save);
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
  save.characters.khadija.position = { x: position.x, y: 0, z: position.z };
  writeSave(save);
}

export function saveQualityPreset(preset: PrototypeSave["qualityPreset"]): void {
  const save = loadSave();
  save.qualityPreset = preset;
  writeSave(save);
}

export function savePlayState(
  state: {
    outfit: OutfitId;
    heldItem: string | null;
    seated: boolean;
    activeRoom: RoomId;
  },
): void {
  const save = loadSave();
  const khadija = save.characters.khadija;
  khadija.outfit = state.outfit;
  khadija.heldItem = state.heldItem;
  khadija.activity = state.seated ? "sitting" : "standing";
  khadija.sleeping = false;
  khadija.room = state.activeRoom;
  save.activeRoom = state.activeRoom;
  writeSave(save);
}

export function saveCharacterState(character: CharacterState): void {
  const save = loadSave();
  save.characters[character.id] = {
    ...character,
    position: { ...character.position },
  };
  if (save.selectedCharacter === character.id) save.activeRoom = character.room;
  writeSave(save);
}

export function saveSelectedCharacter(characterId: CharacterId): void {
  const save = loadSave();
  save.selectedCharacter = characterId;
  save.activeRoom = save.characters[characterId].room;
  writeSave(save);
}

export function loadPlayerSettings(): PlayerSettings {
  const save = loadSave();
  return { sound: save.sound, music: save.music };
}

export function savePlayerSettings(settings: PlayerSettings): void {
  const save = loadSave();
  save.sound = settings.sound;
  save.music = settings.music;
  writeSave(save);
}

export function loadLivingSettings(): LivingSettings {
  return { ...loadSave().livingSettings };
}

export function saveLivingSettings(settings: LivingSettings): void {
  const save = loadSave();
  save.livingSettings = normalizeLivingSettings(settings);
  writeSave(save);
}

export function saveNpcState(state: StoredNpcState): void {
  const save = loadSave();
  save.npcs[state.id] = normalizeNpcStates({ [state.id]: state })[state.id];
  writeSave(save);
}

export function saveContentState(content: ContentState): void {
  const save = loadSave();
  save.content = normalizeContentState(content);
  writeSave(save);
}

export function saveEverydayState(everyday: EverydayState): void {
  const save = loadSave();
  save.everyday = normalizeEverydayState(everyday);
  writeSave(save);
}

export function saveWorld3State(world3: World3State): void {
  const save = loadSave();
  save.world3 = normalizeWorld3State(world3);
  writeSave(save);
}

export function saveDialogueState(dialogue: DialogueSaveState): void {
  const save = loadSave();
  save.dialogue = normalizeDialogueState(dialogue, NPC_IDS);
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
  localStorage.removeItem(PLAYER_SETTINGS_KEY);
}
