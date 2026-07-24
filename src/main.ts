import { Engine } from "@babylonjs/core";
import "./styles.css";
import {
  createPrototypeRoom,
  type InteractionSound,
  type PlayState,
} from "./game/createPrototypeRoom";
import {
  CHARACTER_DEFINITIONS,
  type CharacterExpression,
  type CharacterId,
} from "./game/characterState";
import { applyQuality, type QualityPreset } from "./game/quality";
import {
  loadPlayerSettings,
  loadSave,
  resetSave,
  savePlayerSettings,
  saveQualityPreset,
  type OutfitId,
  type RoomId,
} from "./game/storage";

type PlayerQuality = "low" | "medium" | "high";

const isDebugMode = new URLSearchParams(window.location.search).get("debug") === "1";

const app = document.querySelector<HTMLElement>("#app");
const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
const actionValue = document.querySelector<HTMLOutputElement>("#action-value");
const heldItemValue = document.querySelector<HTMLOutputElement>("#held-item-value");
const heldItemOwnerLabel = document.querySelector<HTMLElement>("#held-item-owner-label");
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
const locationTransition = document.querySelector<HTMLElement>("#location-transition");
const transitionIcon = document.querySelector<HTMLElement>("#transition-icon");
const transitionTitle = document.querySelector<HTMLElement>("#transition-title");
const feedbackSparkles = document.querySelector<HTMLElement>("#feedback-sparkles");
const outfitControls = document.querySelector<HTMLElement>("#outfit-controls");
const outfitButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-outfit]"));
const roomButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-room]"));
const qualityButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-quality]"));
const characterButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-character]"));
const expressionButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-expression]"));
const characterLocationLabels = Array.from(
  document.querySelectorAll<HTMLElement>("[data-character-location]"),
);
const closePopoverButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-close-popover]"));

if (
  !app || !canvas || !actionValue || !heldItemValue || !heldItemOwnerLabel || !roomValue
  || !useItemButton || !useItemLabel || !dropItemButton || !resetButton
  || !helpButton || !settingsButton || !helpCard || !settingsPanel
  || !soundToggle || !musicToggle || !debugPanel || !status
  || !fpsValue || !frameValue || !meshValue || !resolutionValue || !outfitControls
  || !locationTransition || !transitionIcon || !transitionTitle || !feedbackSparkles
  || outfitButtons.length === 0 || roomButtons.length === 0 || qualityButtons.length === 0
  || characterButtons.length === 0 || expressionButtons.length === 0
  || characterLocationLabels.length === 0
) {
  throw new Error("Required game UI elements are missing.");
}

class GameAudio {
  private context: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private musicNoteGains: GainNode[] = [];
  private activeRoom: RoomId = "home";

  private readonly roomChords: Record<RoomId, readonly number[]> = {
    home: [261.63, 329.63, 392],
    bedroom: [220, 293.66, 369.99],
    street: [293.66, 369.99, 440],
    cafe: [261.63, 349.23, 440],
  };

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

  playEffect(cue: InteractionSound = "success"): void {
    if (!this.soundEnabled || !this.context) return;
    const context = this.context;
    void context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const effects: Record<InteractionSound, {
      from: number;
      to: number;
      duration: number;
      volume: number;
      type: OscillatorType;
    }> = {
      tap: { from: 460, to: 520, duration: .09, volume: .022, type: "sine" },
      pickup: { from: 520, to: 790, duration: .16, volume: .038, type: "triangle" },
      success: { from: 590, to: 820, duration: .18, volume: .042, type: "sine" },
      travel: { from: 390, to: 650, duration: .24, volume: .036, type: "triangle" },
      sleep: { from: 380, to: 245, duration: .28, volume: .028, type: "sine" },
      bell: { from: 980, to: 720, duration: .22, volume: .035, type: "sine" },
      toggle: { from: 410, to: 470, duration: .11, volume: .026, type: "square" },
    };
    const effect = effects[cue];
    oscillator.type = effect.type;
    oscillator.frequency.setValueAtTime(effect.from, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      effect.to,
      context.currentTime + effect.duration,
    );
    gain.gain.setValueAtTime(.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(effect.volume, context.currentTime + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + effect.duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + effect.duration + .02);
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (enabled) {
      this.resume();
      this.playEffect("success");
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

    const chord = this.roomChords[this.activeRoom];
    const volumes = [.68, .42, .32];
    this.musicOscillators = chord.map((frequency, index) => {
      const oscillator = context.createOscillator();
      const noteGain = context.createGain();
      oscillator.type = index === 1 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      noteGain.gain.value = volumes[index];
      oscillator.connect(noteGain).connect(masterGain);
      oscillator.start();
      this.musicNoteGains.push(noteGain);
      return oscillator;
    });
    this.musicGain = masterGain;
  }

  setLocation(room: RoomId): void {
    this.activeRoom = room;
    if (!this.context || this.musicOscillators.length === 0) return;
    const now = this.context.currentTime;
    const chord = this.roomChords[room];
    this.musicOscillators.forEach((oscillator, index) => {
      oscillator.frequency.cancelScheduledValues(now);
      oscillator.frequency.setValueAtTime(oscillator.frequency.value, now);
      oscillator.frequency.linearRampToValueAtTime(chord[index], now + .45);
    });
  }

  private stopMusic(): void {
    for (const oscillator of this.musicOscillators) oscillator.stop();
    this.musicOscillators = [];
    for (const gain of this.musicNoteGains) gain.disconnect();
    this.musicNoteGains = [];
    this.musicGain?.disconnect();
    this.musicGain = null;
  }

  dispose(): void {
    this.stopMusic();
    void this.context?.close();
    this.context = null;
  }
}

const uiPreferences = loadPlayerSettings();
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
let feedbackTimer = 0;
const showAction = (message: string, sound: InteractionSound = "success"): void => {
  actionValue.value = message;
  actionValue.classList.add("is-visible");
  gameAudio.playEffect(sound);
  const sparkles = Array.from({ length: 7 }, (_, index) => {
    const sparkle = document.createElement("span");
    sparkle.style.setProperty("--sparkle-angle", `${index * (360 / 7)}deg`);
    sparkle.style.setProperty("--sparkle-distance", `${34 + (index % 3) * 8}px`);
    sparkle.style.setProperty("--sparkle-delay", `${index * .012}s`);
    return sparkle;
  });
  feedbackSparkles.replaceChildren(...sparkles);
  feedbackSparkles.classList.remove("is-playing");
  void feedbackSparkles.offsetWidth;
  feedbackSparkles.classList.add("is-playing");
  if (window.matchMedia("(pointer: coarse)").matches) navigator.vibrate?.(12);
  window.clearTimeout(actionTimer);
  window.clearTimeout(feedbackTimer);
  actionTimer = window.setTimeout(() => actionValue.classList.remove("is-visible"), 2400);
  feedbackTimer = window.setTimeout(() => feedbackSparkles.classList.remove("is-playing"), 650);
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
const roomIcons: Record<RoomId, string> = {
  home: "\u{1F3E0}",
  bedroom: "\u{1F6CF}\u{FE0F}",
  street: "\u{1F333}",
  cafe: "\u2615",
};

const updatePlayState = (state: PlayState): void => {
  if (lastRoom && lastRoom !== state.activeRoom) {
    transitionIcon.textContent = roomIcons[state.activeRoom];
    transitionTitle.textContent = roomLabels[state.activeRoom];
    app.classList.add("is-room-changing");
    locationTransition.classList.add("is-visible");
    window.clearTimeout(roomTransitionTimer);
    roomTransitionTimer = window.setTimeout(() => {
      app.classList.remove("is-room-changing");
      locationTransition.classList.remove("is-visible");
    }, 620);
  }
  lastRoom = state.activeRoom;
  gameAudio.setLocation(state.activeRoom);

  const selectedDefinition = CHARACTER_DEFINITIONS[state.selectedCharacter];
  heldItemOwnerLabel.textContent = `In ${selectedDefinition.shortName}'s hand`;
  outfitControls.setAttribute("aria-label", `Choose ${selectedDefinition.shortName}'s outfit`);
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

  for (const button of characterButtons) {
    const isActive = button.dataset.character === state.selectedCharacter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }

  for (const button of expressionButtons) {
    const isActive = button.dataset.expression === state.expression;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }

  for (const label of characterLocationLabels) {
    const characterId = label.dataset.characterLocation as CharacterId | undefined;
    const characterState = state.characters.find((character) => character.id === characterId);
    if (characterState) label.textContent = roomLabels[characterState.room];
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
  savePlayerSettings(uiPreferences);
});

musicToggle.addEventListener("click", () => {
  uiPreferences.music = !uiPreferences.music;
  gameAudio.setMusicEnabled(uiPreferences.music);
  updateSwitch(musicToggle, uiPreferences.music);
  savePlayerSettings(uiPreferences);
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

for (const button of characterButtons) {
  button.addEventListener("click", () => {
    const characterId = button.dataset.character as CharacterId | undefined;
    if (characterId) room.selectCharacter(characterId);
  });
}

for (const button of expressionButtons) {
  button.addEventListener("click", () => {
    const expression = button.dataset.expression as CharacterExpression | undefined;
    if (expression) room.setExpression(expression);
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
