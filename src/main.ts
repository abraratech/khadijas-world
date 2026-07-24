import { Engine } from "@babylonjs/core";
import "./styles.css";
import { createPrototypeRoom, type PlayState } from "./game/createPrototypeRoom";
import { applyQuality, type QualityPreset } from "./game/quality";
import {
  loadSave,
  resetSave,
  saveQualityPreset,
  type OutfitId,
  type RoomId,
} from "./game/storage";

type PlayerQuality = "low" | "medium" | "high";

interface UiPreferences {
  sound: boolean;
  music: boolean;
}

const UI_STORAGE_KEY = "khadijas-world:player-settings";
const isDebugMode = new URLSearchParams(window.location.search).get("debug") === "1";

const app = document.querySelector<HTMLElement>("#app");
const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
const actionValue = document.querySelector<HTMLOutputElement>("#action-value");
const heldItemValue = document.querySelector<HTMLOutputElement>("#held-item-value");
const roomValue = document.querySelector<HTMLOutputElement>("#room-value");
const useItemButton = document.querySelector<HTMLButtonElement>("#use-item-button");
const useItemLabel = useItemButton?.querySelector<HTMLSpanElement>("span:last-child");
const dropItemButton = document.querySelector<HTMLButtonElement>("#drop-item-button");
const resetButton = document.querySelector<HTMLButtonElement>("#reset-button");
const helpButton = document.querySelector<HTMLButtonElement>("#help-button");
const settingsButton = document.querySelector<HTMLButtonElement>("#settings-button");
const helpCard = document.querySelector<HTMLElement>("#help-card");
const settingsPanel = document.querySelector<HTMLElement>("#settings-panel");
const soundToggle = document.querySelector<HTMLButtonElement>("#sound-toggle");
const musicToggle = document.querySelector<HTMLButtonElement>("#music-toggle");
const debugPanel = document.querySelector<HTMLElement>("#debug-panel");
const status = document.querySelector<HTMLOutputElement>("#status");
const fpsValue = document.querySelector<HTMLElement>("#fps-value");
const frameValue = document.querySelector<HTMLElement>("#frame-value");
const meshValue = document.querySelector<HTMLElement>("#mesh-value");
const resolutionValue = document.querySelector<HTMLElement>("#resolution-value");
const outfitButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-outfit]"));
const roomButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-room]"));
const qualityButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-quality]"));
const closePopoverButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-close-popover]"));

if (
  !app || !canvas || !actionValue || !heldItemValue || !roomValue
  || !useItemButton || !useItemLabel || !dropItemButton || !resetButton
  || !helpButton || !settingsButton || !helpCard || !settingsPanel
  || !soundToggle || !musicToggle || !debugPanel || !status
  || !fpsValue || !frameValue || !meshValue || !resolutionValue
  || outfitButtons.length === 0 || roomButtons.length === 0 || qualityButtons.length === 0
) {
  throw new Error("Required game UI elements are missing.");
}

function loadUiPreferences(): UiPreferences {
  try {
    const parsed = JSON.parse(localStorage.getItem(UI_STORAGE_KEY) ?? "{}") as Partial<UiPreferences>;
    return {
      sound: parsed.sound ?? true,
      music: parsed.music ?? false,
    };
  } catch {
    return { sound: true, music: false };
  }
}

function saveUiPreferences(preferences: UiPreferences): void {
  try {
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // The game remains fully playable when browser storage is unavailable.
  }
}

class GameAudio {
  private context: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];

  constructor(
    public soundEnabled: boolean,
    public musicEnabled: boolean,
  ) {}

  private getContext(): AudioContext {
    this.context ??= new AudioContext();
    return this.context;
  }

  resume(): void {
    if (!this.soundEnabled && !this.musicEnabled) return;
    const context = this.getContext();
    void context.resume();
    if (this.musicEnabled && this.musicOscillators.length === 0) this.startMusic();
  }

  playChime(): void {
    if (!this.soundEnabled) return;
    const context = this.getContext();
    void context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(560, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(740, context.currentTime + .12);
    gain.gain.setValueAtTime(.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.045, context.currentTime + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .18);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .2);
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (enabled) {
      this.resume();
      this.playChime();
    }
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (enabled) {
      this.resume();
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  private startMusic(): void {
    if (!this.musicEnabled || this.musicOscillators.length > 0) return;
    const context = this.getContext();
    const masterGain = context.createGain();
    masterGain.gain.setValueAtTime(.0001, context.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(.018, context.currentTime + .8);
    masterGain.connect(context.destination);

    const notes = [
      { frequency: 261.63, volume: .68 },
      { frequency: 329.63, volume: .42 },
      { frequency: 392, volume: .32 },
    ];
    this.musicOscillators = notes.map(({ frequency, volume }) => {
      const oscillator = context.createOscillator();
      const noteGain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      noteGain.gain.value = volume;
      oscillator.connect(noteGain).connect(masterGain);
      oscillator.start();
      return oscillator;
    });
    this.musicGain = masterGain;
  }

  private stopMusic(): void {
    for (const oscillator of this.musicOscillators) oscillator.stop();
    this.musicOscillators = [];
    this.musicGain?.disconnect();
    this.musicGain = null;
  }

  dispose(): void {
    this.stopMusic();
    void this.context?.close();
    this.context = null;
  }
}

const uiPreferences = loadUiPreferences();
const gameAudio = new GameAudio(uiPreferences.sound, uiPreferences.music);

function updateSwitch(button: HTMLButtonElement, enabled: boolean): void {
  button.classList.toggle("is-on", enabled);
  button.setAttribute("aria-checked", String(enabled));
}

updateSwitch(soundToggle, uiPreferences.sound);
updateSwitch(musicToggle, uiPreferences.music);
debugPanel.hidden = !isDebugMode;

const engine = new Engine(
  canvas,
  false,
  {
    preserveDrawingBuffer: false,
    stencil: false,
    powerPreference: "high-performance",
    adaptToDeviceRatio: false,
  },
  false,
);

let actionTimer = 0;
const showAction = (message: string): void => {
  actionValue.value = message;
  actionValue.classList.add("is-visible");
  gameAudio.playChime();
  window.clearTimeout(actionTimer);
  actionTimer = window.setTimeout(() => actionValue.classList.remove("is-visible"), 2400);
};

let lastRoom: RoomId | null = null;
let roomTransitionTimer = 0;

const itemActionLabels: Record<string, string> = {
  teddy: "Give teddy a hug",
  book: "Read the book",
  apple: "Eat the apple",
  cup: "Take a sip",
  cupcake: "Enjoy the cupcake",
  sandwich: "Take a bite",
};

const roomLabels: Record<RoomId, string> = {
  home: "Family home",
  bedroom: "Khadija's bedroom",
  street: "Neighborhood",
  cafe: "Sunny Caf\u00e9",
};

const updatePlayState = (state: PlayState): void => {
  if (lastRoom && lastRoom !== state.activeRoom) {
    app.classList.add("is-room-changing");
    window.clearTimeout(roomTransitionTimer);
    roomTransitionTimer = window.setTimeout(() => app.classList.remove("is-room-changing"), 260);
  }
  lastRoom = state.activeRoom;

  heldItemValue.value = state.heldItem ?? "Nothing yet";
  roomValue.value = roomLabels[state.activeRoom];
  useItemButton.disabled = !state.heldItem;
  useItemLabel.textContent = state.heldItem
    ? itemActionLabels[state.heldItem] ?? "Play with it"
    : "Pick something up";
  dropItemButton.disabled = !state.heldItem;

  for (const button of outfitButtons) {
    const isActive = button.dataset.outfit === state.outfit;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }

  for (const button of roomButtons) {
    const isActive = button.dataset.room === state.activeRoom;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
};

const room = createPrototypeRoom(engine, {
  onAction: showAction,
  onPlayStateChange: updatePlayState,
});

const playerQualityToPreset: Record<PlayerQuality, QualityPreset> = {
  low: "low",
  medium: "adaptive",
  high: "balanced",
};

const presetToPlayerQuality: Record<QualityPreset, PlayerQuality> = {
  low: "low",
  adaptive: "medium",
  balanced: "high",
};

let activePreset: QualityPreset = loadSave().qualityPreset;
let adaptiveTimer = 0;
let fpsAccumulator = 0;
let fpsSamples = 0;

function setQuality(playerQuality: PlayerQuality, announce = true): void {
  activePreset = playerQualityToPreset[playerQuality];
  const settings = applyQuality(engine, activePreset);
  room.setQuality(settings);
  saveQualityPreset(activePreset);
  engine.resize();

  for (const button of qualityButtons) {
    const isActive = button.dataset.quality === playerQuality;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }

  if (announce) {
    const label = playerQuality[0].toUpperCase() + playerQuality.slice(1);
    showAction(`Picture detail set to ${label}`);
  }
}

setQuality(presetToPlayerQuality[activePreset], false);

function closePopovers(): void {
  helpCard!.hidden = true;
  settingsPanel!.hidden = true;
  helpButton!.setAttribute("aria-expanded", "false");
  settingsButton!.setAttribute("aria-expanded", "false");
}

function togglePopover(target: HTMLElement, button: HTMLButtonElement): void {
  const shouldOpen = target.hidden;
  closePopovers();
  target.hidden = !shouldOpen;
  button.setAttribute("aria-expanded", String(shouldOpen));
}

helpButton.addEventListener("click", () => togglePopover(helpCard, helpButton));
settingsButton.addEventListener("click", () => togglePopover(settingsPanel, settingsButton));
for (const button of closePopoverButtons) button.addEventListener("click", closePopovers);

soundToggle.addEventListener("click", () => {
  uiPreferences.sound = !uiPreferences.sound;
  gameAudio.setSoundEnabled(uiPreferences.sound);
  updateSwitch(soundToggle, uiPreferences.sound);
  saveUiPreferences(uiPreferences);
});

musicToggle.addEventListener("click", () => {
  uiPreferences.music = !uiPreferences.music;
  gameAudio.setMusicEnabled(uiPreferences.music);
  updateSwitch(musicToggle, uiPreferences.music);
  saveUiPreferences(uiPreferences);
});

for (const button of qualityButtons) {
  button.addEventListener("click", () => {
    const playerQuality = button.dataset.quality as PlayerQuality | undefined;
    if (playerQuality) setQuality(playerQuality);
  });
}

resetButton.addEventListener("click", () => {
  const shouldReset = window.confirm("Start Khadija's World fresh? Your room changes and outfits will be reset.");
  if (!shouldReset) return;
  resetSave();
  window.location.reload();
});

useItemButton.addEventListener("click", () => room.useHeldItem());
dropItemButton.addEventListener("click", () => room.dropHeldItem());

for (const button of outfitButtons) {
  button.addEventListener("click", () => {
    const outfit = button.dataset.outfit as OutfitId | undefined;
    if (outfit) room.setOutfit(outfit);
  });
}

for (const button of roomButtons) {
  button.addEventListener("click", () => {
    const nextRoom = button.dataset.room as RoomId | undefined;
    if (nextRoom) room.switchRoom(nextRoom);
  });
}

canvas.addEventListener("pointerdown", () => {
  closePopovers();
  gameAudio.resume();
}, { passive: true });

window.addEventListener("pointerdown", () => gameAudio.resume(), { once: true, passive: true });
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePopovers();
});

engine.runRenderLoop(() => {
  room.scene.render();
});

let metricsTimer = 0;
room.scene.onAfterRenderObservable.add(() => {
  const delta = engine.getDeltaTime();
  metricsTimer += delta;
  adaptiveTimer += delta;
  fpsAccumulator += engine.getFps();
  fpsSamples += 1;

  if (isDebugMode && metricsTimer >= 500) {
    metricsTimer = 0;
    const fps = Math.round(engine.getFps());
    const frameMs = engine.getFps() > 0 ? 1000 / engine.getFps() : 0;
    const width = engine.getRenderWidth();
    const height = engine.getRenderHeight();

    fpsValue.textContent = String(fps);
    frameValue.textContent = `${frameMs.toFixed(1)} ms`;
    meshValue.textContent = String(room.scene.getActiveMeshes().length);
    resolutionValue.textContent = `${width}\u00d7${height}`;
    status.value = `${activePreset} \u00b7 WebGL \u00b7 Babylon.js`;
  }

  if (activePreset !== "adaptive" || adaptiveTimer < 4000 || fpsSamples === 0) return;

  adaptiveTimer = 0;
  const averageFps = fpsAccumulator / fpsSamples;
  fpsAccumulator = 0;
  fpsSamples = 0;

  const currentScale = engine.getHardwareScalingLevel();
  let nextScale = currentScale;
  if (averageFps < 28) nextScale = Math.min(2, currentScale + .15);
  if (averageFps > 48) nextScale = Math.max(1.15, currentScale - .1);

  if (Math.abs(nextScale - currentScale) >= .05) {
    engine.setHardwareScalingLevel(nextScale);
    engine.resize();
  }
});

window.setTimeout(() => showAction("Tap around and make your own story!"), 350);
window.addEventListener("resize", () => engine.resize());
window.addEventListener("beforeunload", () => {
  gameAudio.dispose();
  engine.dispose();
});
