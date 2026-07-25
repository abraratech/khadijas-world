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
import {
  readReliableJson,
  writeReliableJson,
  type ReliableSaveKeys,
} from "./saveReliability";

const STORAGE_KEY = "khadijas-world:world-2";
const BACKUP_STORAGE_KEY = "khadijas-world:world-2:backup";
const TEMP_STORAGE_KEY = "khadijas-world:world-2:temporary";
const MIGRATION_STORAGE_KEY = "khadijas-world:world-2:pre-migration";
const RELIABLE_SAVE_KEYS: ReliableSaveKeys = {
  primary: STORAGE_KEY,
  backup: BACKUP_STORAGE_KEY,
  temporary: TEMP_STORAGE_KEY,
};
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

export interface AccessibilitySettings {
  reducedMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
  instantDialogue: boolean;
}

export interface ReleaseSettings {
  firstLaunchComplete: boolean;
  chatPrivacyAcknowledged: boolean;
}

export interface PrototypeSave {
  version: 12;
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
  accessibility: AccessibilitySettings;
  release: ReleaseSettings;

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
  accessibility?: unknown;
  release?: unknown;
}

const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  reducedMotion: false,
  largeText: false,
  highContrast: false,
  instantDialogue: false,
};

const DEFAULT_RELEASE_SETTINGS: ReleaseSettings = {
  firstLaunchComplete: false,
  chatPrivacyAcknowledged: false,
};

let saveRecoveryNotice: string | null = null;
let saveAvailable = true;
let saveValidationFailures: string[] = [];

export function createDefaultWorldSave(): PrototypeSave {
  const characters = createDefaultCharacterStates();
  return {
    version: 12,
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
    accessibility: { ...DEFAULT_ACCESSIBILITY },
    release: { ...DEFAULT_RELEASE_SETTINGS },
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

function normalizeAccessibility(value: unknown): AccessibilitySettings {
  if (!value || typeof value !== "object") return { ...DEFAULT_ACCESSIBILITY };
  const candidate = value as Partial<AccessibilitySettings>;
  return {
    reducedMotion: candidate.reducedMotion === true,
    largeText: candidate.largeText === true,
    highContrast: candidate.highContrast === true,
    instantDialogue: candidate.instantDialogue === true,
  };
}

function normalizeReleaseSettings(value: unknown): ReleaseSettings {
  if (!value || typeof value !== "object") return { ...DEFAULT_RELEASE_SETTINGS };
  const candidate = value as Partial<ReleaseSettings>;
  return {
    firstLaunchComplete: candidate.firstLaunchComplete === true,
    chatPrivacyAcknowledged: candidate.chatPrivacyAcknowledged === true,
  };
}

function readPrimaryOrBackup(): LegacySave | null {
  const result = readReliableJson<LegacySave>(localStorage, RELIABLE_SAVE_KEYS);
  saveValidationFailures = result.invalidKeys;
  if (!result.value) {
    if (result.invalidKeys.length > 0) {
      saveRecoveryNotice = "We could not load a safe copy, so a fresh world is ready. Your old data was not deleted.";
    }
    return null;
  }
  if (result.source !== "primary") {
    saveRecoveryNotice = "We found a problem loading your world, so we restored the most recent safe copy.";
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.value));
    } catch {
      saveAvailable = false;
    }
  }
  return result.value;
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

function reconcileExclusiveState(
  characters: Record<CharacterId, CharacterState>,
  npcs: Record<NpcId, StoredNpcState>,
  everyday: EverydayState,
): void {
  const occupiedSeats = new Set<string>();
  for (const id of CHARACTER_IDS) {
    const character = characters[id];
    if (!character.seatId) continue;
    if (occupiedSeats.has(character.seatId)) {
      character.seatId = null;
      character.activity = "standing";
      character.sleeping = false;
    } else {
      occupiedSeats.add(character.seatId);
    }
  }

  const ownedItems = new Set<string>();
  for (const id of CHARACTER_IDS) {
    const itemId = characters[id].heldItem;
    if (!itemId) continue;
    if (ownedItems.has(itemId)) characters[id].heldItem = null;
    else ownedItems.add(itemId);
  }
  for (const id of NPC_IDS) {
    const itemId = npcs[id].heldItem;
    if (!itemId) continue;
    if (ownedItems.has(itemId)) npcs[id].heldItem = null;
    else ownedItems.add(itemId);
  }

  const dedupeList = (items: string[]): string[] => items.filter((itemId) => {
    if (!itemId || ownedItems.has(itemId)) return false;
    ownedItems.add(itemId);
    return true;
  });
  for (const id of Object.keys(everyday.storageContents) as Array<keyof typeof everyday.storageContents>) {
    everyday.storageContents[id] = dedupeList(everyday.storageContents[id]);
  }
  for (const id of Object.keys(everyday.containerContents) as Array<keyof typeof everyday.containerContents>) {
    everyday.containerContents[id] = dedupeList(everyday.containerContents[id]);
  }
  for (const id of Object.keys(everyday.stationInputs) as Array<keyof typeof everyday.stationInputs>) {
    everyday.stationInputs[id] = dedupeList(everyday.stationInputs[id]);
  }
}

export function loadSave(): PrototypeSave {
  const parsed = readPrimaryOrBackup()
    ?? readJson(WORLD_1_STORAGE_KEY)
    ?? readJson(PLAY_1_STORAGE_KEY)
    ?? readJson(FOUNDATION_2_STORAGE_KEY)
    ?? readJson(FOUNDATION_1_STORAGE_KEY);
  const fallback = createDefaultWorldSave();
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
      || parsed.version === 11
      || parsed.version === 12
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
  const npcs = normalizeNpcStates(parsed.npcs);
  const everyday = normalizeEverydayState(parsed.everyday);
  const release = normalizeReleaseSettings(parsed.release);
  if (parsed.version !== 12) release.firstLaunchComplete = true;
  reconcileExclusiveState(characters, npcs, everyday);

  if (typeof parsed.version === "number" && parsed.version < 12) {
    try {
      if (!localStorage.getItem(MIGRATION_STORAGE_KEY)) {
        localStorage.setItem(MIGRATION_STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch {
      saveAvailable = false;
    }
  }

  return {
    version: 12,
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
    npcs,
    everyday,
    world3: normalizeWorld3State(parsed.world3),
    dialogue: normalizeDialogueState(parsed.dialogue, NPC_IDS),
    accessibility: normalizeAccessibility(parsed.accessibility),
    release,
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
  saveAvailable = writeReliableJson(localStorage, RELIABLE_SAVE_KEYS, save);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("khadijas-world:save-status", {
      detail: { saved: saveAvailable },
    }));
  }
  if (!saveAvailable) {
    saveRecoveryNotice = "Your browser is not allowing the game to save progress right now.";
  }
}

export function consumeSaveRecoveryNotice(): string | null {
  const notice = saveRecoveryNotice;
  saveRecoveryNotice = null;
  return notice;
}

export function getSaveDebugState(): {
  available: boolean;
  validationFailures: string[];
} {
  return {
    available: saveAvailable,
    validationFailures: [...saveValidationFailures],
  };
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

export function loadAccessibilitySettings(): AccessibilitySettings {
  return { ...loadSave().accessibility };
}

export function saveAccessibilitySettings(settings: AccessibilitySettings): void {
  const save = loadSave();
  save.accessibility = normalizeAccessibility(settings);
  writeSave(save);
}

export function loadReleaseSettings(): ReleaseSettings {
  return { ...loadSave().release };
}

export function saveReleaseSettings(settings: ReleaseSettings): void {
  const save = loadSave();
  save.release = normalizeReleaseSettings(settings);
  writeSave(save);
}

export function hasExistingWorld(): boolean {
  try {
    const reliable = readReliableJson<LegacySave>(localStorage, RELIABLE_SAVE_KEYS).value;
    if (reliable) {
      return reliable.version !== 12
        || normalizeReleaseSettings(reliable.release).firstLaunchComplete;
    }
    return [
      WORLD_1_STORAGE_KEY,
      PLAY_1_STORAGE_KEY,
      FOUNDATION_2_STORAGE_KEY,
      FOUNDATION_1_STORAGE_KEY,
    ].some((key) => readJson(key) !== null);
  } catch {
    return false;
  }
}

export function exportWorldSave(): string {
  return JSON.stringify(loadSave(), null, 2);
}

export interface SaveImportPreview {
  accepted: boolean;
  message: string;
  schemaVersion?: number;
}

export function previewWorldSaveImport(raw: string): SaveImportPreview {
  if (raw.length > 1_000_000) {
    return { accepted: false, message: "That save file is too large to be a Khadija's World save." };
  }
  try {
    const parsed = JSON.parse(raw) as LegacySave;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { accepted: false, message: "That file is not a Khadija's World save." };
    }
    const version = parsed.version;
    if (
      typeof version !== "number"
      || !Number.isInteger(version)
      || version < 1
      || version > 12
    ) {
      return { accepted: false, message: "That save file is not supported by this version." };
    }
    if (version >= 6) {
      if (!parsed.characters || typeof parsed.characters !== "object") {
        return { accepted: false, message: "That save file is missing its family characters." };
      }
      const characterKeys = Object.keys(parsed.characters);
      if (
        CHARACTER_IDS.some((id) => !characterKeys.includes(id))
        || characterKeys.some((id) => !CHARACTER_IDS.includes(id as CharacterId))
      ) {
        return { accepted: false, message: "That save file has an unfamiliar character record." };
      }
    }
    if (parsed.npcs && typeof parsed.npcs === "object") {
      if (Object.keys(parsed.npcs).some((id) => !NPC_IDS.includes(id as NpcId))) {
        return { accepted: false, message: "That save file has an unfamiliar neighborhood friend." };
      }
    }
    if (parsed.props && Object.entries(parsed.props).some(([id, position]) => (
      id.length > 128
      || !/^[a-zA-Z0-9:_-]+$/.test(id)
      || !position
      || typeof position.x !== "number"
      || typeof position.y !== "number"
      || typeof position.z !== "number"
      || !Number.isFinite(position.x + position.y + position.z)
    ))) {
      return { accepted: false, message: "That save file has an unfamiliar room object." };
    }
    const ownedItemIds: string[] = [];
    const collectHeldItems = (records: unknown): boolean => {
      if (!records || typeof records !== "object") return true;
      for (const record of Object.values(records)) {
        if (!record || typeof record !== "object") return false;
        const heldItem = (record as { heldItem?: unknown }).heldItem;
        if (heldItem !== undefined && heldItem !== null && typeof heldItem !== "string") return false;
        if (typeof heldItem === "string") ownedItemIds.push(heldItem);
      }
      return true;
    };
    if (!collectHeldItems(parsed.characters) || !collectHeldItems(parsed.npcs)) {
      return { accepted: false, message: "That save file has a malformed held item." };
    }
    if (parsed.everyday && typeof parsed.everyday === "object") {
      for (const groupName of ["storageContents", "containerContents", "stationInputs"] as const) {
        const group = (parsed.everyday as Record<string, unknown>)[groupName];
        if (!group || typeof group !== "object") continue;
        for (const items of Object.values(group)) {
          if (!Array.isArray(items) || items.some((item) => typeof item !== "string")) {
            return { accepted: false, message: "That save file has malformed stored items." };
          }
          ownedItemIds.push(...items);
        }
      }
    }
    if (new Set(ownedItemIds).size !== ownedItemIds.length) {
      return { accepted: false, message: "That save file gives the same item to more than one place." };
    }
    return {
      accepted: true,
      message: `Save format ${version} is ready to import.`,
      schemaVersion: version,
    };
  } catch {
    return { accepted: false, message: "We could not read that save file." };
  }
}

export function importWorldSave(raw: string): { accepted: boolean; message: string } {
  const preview = previewWorldSaveImport(raw);
  if (!preview.accepted) return preview;
  try {
    const parsed = JSON.parse(raw) as LegacySave;
    parsed.release = {
      ...normalizeReleaseSettings(parsed.release),
      firstLaunchComplete: true,
    };
    if (!writeReliableJson(localStorage, RELIABLE_SAVE_KEYS, parsed)) {
      return { accepted: false, message: "The browser could not safely store that save." };
    }
    return { accepted: true, message: "Your world is ready to continue!" };
  } catch {
    return { accepted: false, message: "We could not read that save file." };
  }
}

export function startNewWorld(options?: {
  sound?: boolean;
  music?: boolean;
  reducedMotion?: boolean;
  qualityPreset?: PrototypeSave["qualityPreset"];
}): boolean {
  const current = loadSave();
  const save = createDefaultWorldSave();
  save.release.firstLaunchComplete = true;
  save.sound = options?.sound ?? current.sound;
  save.music = options?.music ?? current.music;
  save.qualityPreset = options?.qualityPreset ?? current.qualityPreset;
  save.accessibility = {
    ...current.accessibility,
    reducedMotion: options?.reducedMotion ?? current.accessibility.reducedMotion,
  };
  save.livingSettings = { ...current.livingSettings };
  save.dialogue.settings = { ...current.dialogue.settings };
  writeSave(save);
  return saveAvailable;
}

export function restoreProp(mesh: AbstractMesh): void {
  const position = loadSave().props[mesh.name];
  if (!position) return;
  mesh.position.set(position.x, position.y, position.z);
}

export function resetSave(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(BACKUP_STORAGE_KEY);
  localStorage.removeItem(TEMP_STORAGE_KEY);
  localStorage.removeItem(MIGRATION_STORAGE_KEY);
  localStorage.removeItem(WORLD_1_STORAGE_KEY);
  localStorage.removeItem(PLAY_1_STORAGE_KEY);
  localStorage.removeItem(FOUNDATION_2_STORAGE_KEY);
  localStorage.removeItem(FOUNDATION_1_STORAGE_KEY);
  localStorage.removeItem(PLAYER_SETTINGS_KEY);
}
