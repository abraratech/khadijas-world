import { Engine } from "@babylonjs/core";
import "./styles.css";
import {
  createPrototypeRoom,
  type InteractionSound,
  type PlayState,
  type PrototypeRoom,
} from "./game/createPrototypeRoom";
import {
  CHARACTER_DEFINITIONS,
  type CharacterExpression,
  type CharacterId,
} from "./game/characterState";
import { applyQuality, type QualityPreset } from "./game/quality";
import { DialogueController, type DialogueContext } from "./game/dialogue/DialogueController";
import type { DialogueTopic } from "./game/content/dialogue/topicSuggestions";
import type { DialogueIntent } from "./game/dialogue/DialogueIntent";
import type { NpcId } from "./game/livingCharacters";
import { friendshipLevel } from "./game/npc/RelationshipController";
import {
  loadPlayerSettings,
  loadLivingSettings,
  loadAccessibilitySettings,
  loadReleaseSettings,
  loadSave,
  consumeSaveRecoveryNotice,
  exportWorldSave,
  getSaveDebugState,
  hasExistingWorld,
  importWorldSave,
  previewWorldSaveImport,
  savePlayerSettings,
  saveLivingSettings,
  saveDialogueState,
  saveAccessibilitySettings,
  saveReleaseSettings,
  saveQualityPreset,
  startNewWorld,
  type OutfitId,
  type RoomId,
} from "./game/storage";
import { RELEASE } from "./game/release";
import type { InteractionHint } from "./game/readability/interactionReadability";
import {
  ONBOARDING_STEP_IDS,
  completeOnboardingStep,
  dismissOnboarding,
  isOnboardingComplete,
  nextOnboardingStep,
  onboardingStepCopy,
  type OnboardingStepId,
} from "./game/onboarding";
import {
  measureViewportLayout,
  type ViewportLayout,
} from "./game/ui/viewportLayout";

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
const togetherButton = document.querySelector<HTMLButtonElement>("#together-button");
const resetButton = document.querySelector<HTMLButtonElement>("#reset-button");
const helpButton = document.querySelector<HTMLButtonElement>("#help-button");
const settingsButton = document.querySelector<HTMLButtonElement>("#settings-button");
const helpCard = document.querySelector<HTMLElement>("#help-card");
const settingsPanel = document.querySelector<HTMLElement>("#settings-panel");
const soundToggle = document.querySelector<HTMLButtonElement>("#sound-toggle");
const musicToggle = document.querySelector<HTMLButtonElement>("#music-toggle");
const idleAnimationToggle = document.querySelector<HTMLButtonElement>("#idle-animation-toggle");
const smallMovementToggle = document.querySelector<HTMLButtonElement>("#small-movement-toggle");
const reducedMotionToggle = document.querySelector<HTMLButtonElement>("#reduced-motion-toggle");
const largeTextToggle = document.querySelector<HTMLButtonElement>("#large-text-toggle");
const highContrastToggle = document.querySelector<HTMLButtonElement>("#high-contrast-toggle");
const instantDialogueToggle = document.querySelector<HTMLButtonElement>("#instant-dialogue-toggle");
const fullscreenButton = document.querySelector<HTMLButtonElement>("#fullscreen-button");
const loadingScreen = document.querySelector<HTMLElement>("#loading-screen");
const displayRecovery = document.querySelector<HTMLElement>("#display-recovery");
const startupError = document.querySelector<HTMLElement>("#startup-error");
const startupReloadButton = document.querySelector<HTMLButtonElement>("#startup-reload-button");
const restoreDisplayButton = document.querySelector<HTMLButtonElement>("#restore-display-button");
const reloadDisplayButton = document.querySelector<HTMLButtonElement>("#reload-display-button");
const npcChatToggle = document.querySelector<HTMLButtonElement>("#npc-chat-toggle");
const typedChatToggle = document.querySelector<HTMLButtonElement>("#typed-chat-toggle");
const memoryToggle = document.querySelector<HTMLButtonElement>("#memory-toggle");
const clearAllMemoriesButton = document.querySelector<HTMLButtonElement>("#clear-all-memories-button");
const chatPanel = document.querySelector<HTMLElement>("#chat-panel");
const chatNpcPortrait = document.querySelector<HTMLElement>("#chat-npc-portrait");
const chatNpcName = document.querySelector<HTMLElement>("#chat-npc-name");
const chatFriendship = document.querySelector<HTMLElement>("#chat-friendship");
const chatCloseButton = document.querySelector<HTMLButtonElement>("#chat-close-button");
const chatMessages = document.querySelector<HTMLElement>("#chat-messages");
const chatThinking = document.querySelector<HTMLElement>("#chat-thinking");
const chatTopics = document.querySelector<HTMLElement>("#chat-topics");
const chatForm = document.querySelector<HTMLFormElement>("#chat-form");
const chatInput = document.querySelector<HTMLInputElement>("#chat-input");
const chatSendButton = document.querySelector<HTMLButtonElement>("#chat-send-button");
const chatClearButton = document.querySelector<HTMLButtonElement>("#chat-clear-button");
const debugPanel = document.querySelector<HTMLElement>("#debug-panel");
const status = document.querySelector<HTMLOutputElement>("#status");
const fpsValue = document.querySelector<HTMLElement>("#fps-value");
const frameValue = document.querySelector<HTMLElement>("#frame-value");
const meshValue = document.querySelector<HTMLElement>("#mesh-value");
const resolutionValue = document.querySelector<HTMLElement>("#resolution-value");
const livingValue = document.querySelector<HTMLElement>("#living-value");
const dialogueIntentValue = document.querySelector<HTMLElement>("#dialogue-intent-value");
const dialogueEntitiesValue = document.querySelector<HTMLElement>("#dialogue-entities-value");
const dialogueTemplateValue = document.querySelector<HTMLElement>("#dialogue-template-value");
const dialogueMemoryValue = document.querySelector<HTMLElement>("#dialogue-memory-value");
const locationTransition = document.querySelector<HTMLElement>("#location-transition");
const transitionIcon = document.querySelector<HTMLElement>("#transition-icon");
const transitionTitle = document.querySelector<HTMLElement>("#transition-title");
const feedbackSparkles = document.querySelector<HTMLElement>("#feedback-sparkles");
const interactionLabel = document.querySelector<HTMLOutputElement>("#interaction-label");
const interactionLabelIcon = document.querySelector<HTMLElement>("#interaction-label-icon");
const interactionLabelName = document.querySelector<HTMLElement>("#interaction-label-name");
const interactionLabelHint = document.querySelector<HTMLElement>("#interaction-label-hint");
const onboardingCard = document.querySelector<HTMLElement>("#onboarding-card");
const onboardingProgress = document.querySelector<HTMLElement>("#onboarding-progress");
const onboardingIcon = document.querySelector<HTMLElement>("#onboarding-icon");
const onboardingTitle = document.querySelector<HTMLElement>("#onboarding-title");
const onboardingMessage = document.querySelector<HTMLElement>("#onboarding-message");
const onboardingSkipButton = document.querySelector<HTMLButtonElement>("#onboarding-skip-button");
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
const titleScreen = document.querySelector<HTMLElement>("#title-screen");
const continueButton = document.querySelector<HTMLButtonElement>("#continue-button");
const newWorldButton = document.querySelector<HTMLButtonElement>("#new-world-button");
const titleSettingsButton = document.querySelector<HTMLButtonElement>("#title-settings-button");
const grownUpsButton = document.querySelector<HTMLButtonElement>("#grown-ups-button");
const titleCreditsButton = document.querySelector<HTMLButtonElement>("#title-credits-button");
const titleVersion = document.querySelector<HTMLElement>("#title-version");
const firstLaunchPanel = document.querySelector<HTMLElement>("#first-launch-panel");
const setupSound = document.querySelector<HTMLInputElement>("#setup-sound");
const setupMusic = document.querySelector<HTMLInputElement>("#setup-music");
const setupReducedMotion = document.querySelector<HTMLInputElement>("#setup-reduced-motion");
const startWorldButton = document.querySelector<HTMLButtonElement>("#start-world-button");
const parentGatePanel = document.querySelector<HTMLElement>("#parent-gate-panel");
const parentGateAnswer = document.querySelector<HTMLInputElement>("#parent-gate-answer");
const parentGateMessage = document.querySelector<HTMLElement>("#parent-gate-message");
const parentGateSubmit = document.querySelector<HTMLButtonElement>("#parent-gate-submit");
const parentPanel = document.querySelector<HTMLElement>("#parent-panel");
const parentSettingsButton = document.querySelector<HTMLButtonElement>("#parent-settings-button");
const exportSaveButton = document.querySelector<HTMLButtonElement>("#export-save-button");
const importSaveButton = document.querySelector<HTMLButtonElement>("#import-save-button");
const importSaveInput = document.querySelector<HTMLInputElement>("#import-save-input");
const parentPrivacyButton = document.querySelector<HTMLButtonElement>("#parent-privacy-button");
const parentNoticesButton = document.querySelector<HTMLButtonElement>("#parent-notices-button");
const parentCreditsButton = document.querySelector<HTMLButtonElement>("#parent-credits-button");
const parentResetButton = document.querySelector<HTMLButtonElement>("#parent-reset-button");
const parentResult = document.querySelector<HTMLElement>("#parent-result");
const creditsPanel = document.querySelector<HTMLElement>("#credits-panel");
const creditsCopyright = document.querySelector<HTMLElement>("#credits-copyright");
const privacyPanel = document.querySelector<HTMLElement>("#privacy-panel");
const noticesPanel = document.querySelector<HTMLElement>("#notices-panel");
const releaseVersionLabels = Array.from(document.querySelectorAll<HTMLElement>("[data-release-version]"));
const closeReleaseButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-close-release]"));
const menuButton = document.querySelector<HTMLButtonElement>("#menu-button");
const pausePanel = document.querySelector<HTMLElement>("#pause-panel");
const resumeButton = document.querySelector<HTMLButtonElement>("#resume-button");
const pauseSettingsButton = document.querySelector<HTMLButtonElement>("#pause-settings-button");
const returnTitleButton = document.querySelector<HTMLButtonElement>("#return-title-button");
const pauseGrownUpsButton = document.querySelector<HTMLButtonElement>("#pause-grown-ups-button");
const pauseCreditsButton = document.querySelector<HTMLButtonElement>("#pause-credits-button");
const exitFullscreenButton = document.querySelector<HTMLButtonElement>("#exit-fullscreen-button");
const saveStatus = document.querySelector<HTMLOutputElement>("#save-status");
const pauseSaveStatus = document.querySelector<HTMLElement>("#pause-save-status");
const chatPrivacyReminder = document.querySelector<HTMLElement>("#chat-privacy-reminder");
const chatPrivacyAcknowledge = document.querySelector<HTMLButtonElement>("#chat-privacy-acknowledge");

if (
  !app || !canvas || !actionValue || !heldItemValue || !heldItemOwnerLabel || !roomValue
  || !useItemButton || !useItemLabel || !dropItemButton || !togetherButton || !resetButton
  || !helpButton || !settingsButton || !helpCard || !settingsPanel
  || !soundToggle || !musicToggle || !idleAnimationToggle || !smallMovementToggle
  || !reducedMotionToggle || !largeTextToggle || !highContrastToggle
  || !instantDialogueToggle || !fullscreenButton || !loadingScreen
  || !displayRecovery || !restoreDisplayButton || !reloadDisplayButton
  || !startupError || !startupReloadButton
  || !npcChatToggle || !typedChatToggle || !memoryToggle || !clearAllMemoriesButton
  || !chatPanel || !chatNpcPortrait || !chatNpcName || !chatFriendship
  || !chatCloseButton || !chatMessages || !chatThinking || !chatTopics
  || !chatForm || !chatInput || !chatSendButton || !chatClearButton
  || !debugPanel || !status || !fpsValue || !frameValue || !meshValue
  || !resolutionValue || !livingValue || !dialogueIntentValue || !dialogueEntitiesValue
  || !dialogueTemplateValue || !dialogueMemoryValue || !outfitControls
  || !onboardingCard || !onboardingProgress || !onboardingIcon || !onboardingTitle
  || !onboardingMessage || !onboardingSkipButton
  || !locationTransition || !transitionIcon || !transitionTitle || !feedbackSparkles
  || outfitButtons.length === 0 || roomButtons.length === 0 || qualityButtons.length === 0
  || characterButtons.length === 0 || expressionButtons.length === 0
  || characterLocationLabels.length === 0
  || !titleScreen || !continueButton || !newWorldButton || !titleSettingsButton || !grownUpsButton
  || !titleCreditsButton || !titleVersion || !firstLaunchPanel || !setupSound
  || !setupMusic || !setupReducedMotion || !startWorldButton || !parentGatePanel || !parentGateAnswer
  || !parentGateMessage || !parentGateSubmit || !parentPanel || !parentSettingsButton
  || !exportSaveButton || !importSaveButton || !importSaveInput || !parentPrivacyButton
  || !parentNoticesButton || !parentCreditsButton || !parentResetButton || !parentResult
  || !creditsPanel || !creditsCopyright || !privacyPanel || !noticesPanel
  || !menuButton || !pausePanel || !resumeButton || !pauseSettingsButton
  || !returnTitleButton || !pauseGrownUpsButton || !pauseCreditsButton
  || !exitFullscreenButton || !saveStatus || !pauseSaveStatus
  || !chatPrivacyReminder || !chatPrivacyAcknowledge
) {
  throw new Error("Required game UI elements are missing.");
}

const readViewportLayout = (): ViewportLayout => measureViewportLayout(
  window.innerWidth,
  window.innerHeight,
  window.visualViewport
    ? {
      width: window.visualViewport.width,
      height: window.visualViewport.height,
      offsetLeft: window.visualViewport.offsetLeft,
      offsetTop: window.visualViewport.offsetTop,
    }
    : null,
);

let currentViewportLayout = readViewportLayout();

const applyViewportLayout = (): void => {
  currentViewportLayout = readViewportLayout();
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--viewport-width", `${currentViewportLayout.width}px`);
  rootStyle.setProperty("--viewport-height", `${currentViewportLayout.height}px`);
  rootStyle.setProperty("--viewport-offset-left", `${currentViewportLayout.offsetLeft}px`);
  rootStyle.setProperty("--viewport-offset-top", `${currentViewportLayout.offsetTop}px`);
  rootStyle.setProperty("--keyboard-inset", `${currentViewportLayout.keyboardInset}px`);
  app.classList.toggle("is-compact-landscape", currentViewportLayout.compactLandscape);
};

applyViewportLayout();

const showPublicStartupError = (): void => {
  loadingScreen.hidden = true;
  titleScreen.hidden = true;
  startupError.hidden = false;
};
window.addEventListener("error", showPublicStartupError);
window.addEventListener("unhandledrejection", showPublicStartupError);
startupReloadButton.addEventListener("click", () => window.location.reload());

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
    park: [246.94, 329.63, 392],
    grocery: [277.18, 349.23, 415.3],
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
      appliance: { from: 240, to: 620, duration: .26, volume: .032, type: "square" },
      water: { from: 700, to: 430, duration: .24, volume: .026, type: "sine" },
      clean: { from: 540, to: 880, duration: .2, volume: .03, type: "triangle" },
      storage: { from: 330, to: 440, duration: .14, volume: .028, type: "triangle" },
      combine: { from: 420, to: 650, duration: .2, volume: .032, type: "sine" },
      recipe: { from: 620, to: 940, duration: .28, volume: .04, type: "triangle" },
      shared: { from: 520, to: 780, duration: .22, volume: .036, type: "sine" },
      invalid: { from: 260, to: 210, duration: .16, volume: .022, type: "triangle" },
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

  setPageVisible(visible: boolean): void {
    if (!this.context) return;
    if (visible) {
      void this.context.resume();
      if (this.musicEnabled && this.musicOscillators.length === 0) this.startMusic();
    } else {
      void this.context.suspend();
    }
  }
}

const uiPreferences = loadPlayerSettings();
const livingPreferences = loadLivingSettings();
const accessibilityPreferences = loadAccessibilitySettings();
const releasePreferences = loadReleaseSettings();
const gameAudio = new GameAudio(uiPreferences.sound, uiPreferences.music);
let atTitleScreen = true;
let gamePaused = false;

const onboardingInputMode = window.matchMedia("(pointer: coarse)").matches ? "touch" : "pointer";

const renderOnboarding = (): void => {
  const step = nextOnboardingStep(releasePreferences.onboarding);
  if (!step || atTitleScreen || gamePaused) {
    onboardingCard.hidden = true;
    return;
  }

  const copy = onboardingStepCopy(step, onboardingInputMode);
  const stepIndex = ONBOARDING_STEP_IDS.indexOf(step);
  onboardingProgress.textContent = `Tip ${stepIndex + 1} of ${ONBOARDING_STEP_IDS.length}`;
  onboardingIcon.textContent = copy.icon;
  onboardingTitle.textContent = copy.title;
  onboardingMessage.textContent = copy.message;
  onboardingCard.hidden = false;
};

const recordOnboardingStep = (step: OnboardingStepId): void => {
  const next = completeOnboardingStep(releasePreferences.onboarding, step);
  if (next === releasePreferences.onboarding) return;
  releasePreferences.onboarding = next;
  saveReleaseSettings(releasePreferences);
  renderOnboarding();
};

const skipOnboarding = (): void => {
  const next = dismissOnboarding(releasePreferences.onboarding);
  if (next === releasePreferences.onboarding) return;
  releasePreferences.onboarding = next;
  saveReleaseSettings(releasePreferences);
  renderOnboarding();
};

titleVersion.textContent = `Version ${RELEASE.version}`;
creditsCopyright.textContent = RELEASE.copyright;
for (const label of releaseVersionLabels) label.textContent = RELEASE.version;
const worldExistsAtStartup = hasExistingWorld();
continueButton.disabled = !worldExistsAtStartup;
continueButton.title = continueButton.disabled ? "Start a new world first" : "";
newWorldButton.textContent = worldExistsAtStartup ? "New World" : "Play";

const closeReleasePanels = (): void => {
  for (const panel of [
    firstLaunchPanel,
    parentGatePanel,
    parentPanel,
    creditsPanel,
    privacyPanel,
    noticesPanel,
  ]) panel.hidden = true;
};

const enterGame = (): void => {
  closeReleasePanels();
  titleScreen.hidden = true;
  pausePanel.hidden = true;
  atTitleScreen = false;
  gamePaused = false;
  gameAudio.setPageVisible(true);
  gameAudio.resume();
  canvas.focus();
  renderOnboarding();
};

const showTitle = (): void => {
  closeReleasePanels();
  closeChat();
  closePopovers();
  pausePanel.hidden = true;
  titleScreen.hidden = false;
  onboardingCard.hidden = true;
  atTitleScreen = true;
  gamePaused = true;
  continueButton.disabled = !hasExistingWorld();
  gameAudio.setPageVisible(false);
  continueButton.focus();
};

const openReleasePanel = (panel: HTMLElement): void => {
  closeReleasePanels();
  panel.hidden = false;
  panel.querySelector<HTMLElement>("button, input")?.focus();
};

const openParentGate = (): void => {
  parentGateAnswer.value = "";
  parentGateMessage.textContent = "";
  openReleasePanel(parentGatePanel);
};

const openNewWorldSetup = (): void => {
  if (!atTitleScreen) {
    gamePaused = true;
    gameAudio.setPageVisible(false);
  }
  setupSound.checked = uiPreferences.sound;
  setupMusic.checked = uiPreferences.music;
  setupReducedMotion.checked = accessibilityPreferences.reducedMotion;
  openReleasePanel(firstLaunchPanel);
};

function updateSwitch(button: HTMLButtonElement, enabled: boolean): void {
  button.classList.toggle("is-on", enabled);
  button.setAttribute("aria-checked", String(enabled));
}

updateSwitch(soundToggle, uiPreferences.sound);
updateSwitch(musicToggle, uiPreferences.music);
updateSwitch(idleAnimationToggle, livingPreferences.idleAnimations);
updateSwitch(smallMovementToggle, livingPreferences.smallMovements);
updateSwitch(reducedMotionToggle, accessibilityPreferences.reducedMotion);
updateSwitch(largeTextToggle, accessibilityPreferences.largeText);
updateSwitch(highContrastToggle, accessibilityPreferences.highContrast);
updateSwitch(instantDialogueToggle, accessibilityPreferences.instantDialogue);
app.classList.toggle("is-reduced-motion", accessibilityPreferences.reducedMotion);
app.classList.toggle("is-large-text", accessibilityPreferences.largeText);
app.classList.toggle("is-high-contrast", accessibilityPreferences.highContrast);
debugPanel.hidden = !isDebugMode;

const dialogueController = new DialogueController(loadSave().dialogue, saveDialogueState);
let dialoguePreferences = dialogueController.memory.settings();
updateSwitch(npcChatToggle, dialoguePreferences.npcChat);
updateSwitch(typedChatToggle, dialoguePreferences.typedMessages);
updateSwitch(memoryToggle, dialoguePreferences.rememberConversations);
chatForm.hidden = !dialoguePreferences.typedMessages;

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

const visualViewport = window.visualViewport;
let viewportSyncFrame = 0;

const scheduleViewportSync = (): void => {
  if (viewportSyncFrame !== 0) window.cancelAnimationFrame(viewportSyncFrame);
  viewportSyncFrame = window.requestAnimationFrame(() => {
    viewportSyncFrame = 0;
    applyViewportLayout();
    engine.resize();
    if (!chatPanel.hidden) chatMessages.scrollTop = chatMessages.scrollHeight;
  });
};

window.addEventListener("resize", scheduleViewportSync);
visualViewport?.addEventListener("resize", scheduleViewportSync);
visualViewport?.addEventListener("scroll", scheduleViewportSync);
scheduleViewportSync();

let actionTimer = 0;
let feedbackTimer = 0;
const showAction = (message: string, sound: InteractionSound = "success"): void => {
  actionValue.value = message;
  actionValue.classList.add("is-visible");
  gameAudio.playEffect(sound);
  const sparkles = Array.from(
    { length: accessibilityPreferences.reducedMotion ? 0 : 7 },
    (_, index) => {
    const sparkle = document.createElement("span");
    sparkle.style.setProperty("--sparkle-angle", `${index * (360 / 7)}deg`);
    sparkle.style.setProperty("--sparkle-distance", `${34 + (index % 3) * 8}px`);
    sparkle.style.setProperty("--sparkle-delay", `${index * .012}s`);
    return sparkle;
    },
  );
  feedbackSparkles.replaceChildren(...sparkles);
  feedbackSparkles.classList.remove("is-playing");
  void feedbackSparkles.offsetWidth;
  feedbackSparkles.classList.add("is-playing");
  if (
    !accessibilityPreferences.reducedMotion
    && window.matchMedia("(pointer: coarse)").matches
  ) navigator.vibrate?.(12);
  window.clearTimeout(actionTimer);
  window.clearTimeout(feedbackTimer);
  actionTimer = window.setTimeout(() => actionValue.classList.remove("is-visible"), 2400);
  feedbackTimer = window.setTimeout(() => feedbackSparkles.classList.remove("is-playing"), 650);
};

const updateInteractionLabel = (hint: InteractionHint | null): void => {
  if (!hint || !interactionLabel || !interactionLabelIcon || !interactionLabelName || !interactionLabelHint) {
    if (interactionLabel) interactionLabel.hidden = true;
    return;
  }
  interactionLabelIcon.textContent = hint.icon;
  interactionLabelName.textContent = hint.label;
  interactionLabelHint.textContent = hint.hint;
  interactionLabel.hidden = false;

  const estimatedWidth = Math.min(260, Math.max(154, hint.label.length * 8 + 82));
  const estimatedHeight = 62;
  const minimumLeft = currentViewportLayout.offsetLeft + 8;
  const minimumTop = currentViewportLayout.offsetTop + 8;
  const maximumLeft = currentViewportLayout.offsetLeft
    + currentViewportLayout.width
    - estimatedWidth
    - 12;
  const maximumTop = currentViewportLayout.offsetTop
    + currentViewportLayout.height
    - estimatedHeight
    - 12;
  const left = Math.min(maximumLeft, Math.max(minimumLeft, hint.x));
  const top = Math.min(maximumTop, Math.max(minimumTop, hint.y));
  interactionLabel.style.left = `${left}px`;
  interactionLabel.style.top = `${top}px`;
};

let room: PrototypeRoom;
let activeChatNpc: NpcId | null = null;
let activeChatCharacter: CharacterId | null = null;
let chatReplyTimer = 0;

const dialogueContext = (npcId: NpcId): DialogueContext | null => {
  const worldContext = room?.getDialogueContext(npcId);
  if (!worldContext) return null;
  const memory = dialogueController.memory.get(npcId);
  return {
    ...worldContext,
    relationshipLevel: memory.friendship,
    recentTopics: [...memory.recentTopics],
  };
};

const renderConversation = (npcId: NpcId): void => {
  const memory = dialogueController.memory.get(npcId);
  const bubbles = memory.recentConversation.map((turn) => {
    const bubble = document.createElement("p");
    bubble.className = `chat-bubble is-${turn.speaker}`;
    bubble.textContent = turn.text;
    return bubble;
  });
  chatMessages.replaceChildren(...bubbles);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  chatFriendship.textContent = friendshipLevel(memory.friendship);
  if (isDebugMode) dialogueMemoryValue.textContent = `${memory.summaryFacts.length} facts`;
};

const renderTopics = (topics: readonly DialogueTopic[]): void => {
  chatTopics.replaceChildren(...topics.map((topic) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = topic.label;
    button.addEventListener("click", () => submitChat(topic.message, topic.intent));
    return button;
  }));
};

const closeChat = (): void => {
  window.clearTimeout(chatReplyTimer);
  activeChatNpc = null;
  activeChatCharacter = null;
  chatPanel.hidden = true;
  chatThinking.hidden = true;
  app.classList.remove("is-chat-open", "is-chat-input-active");
  scheduleViewportSync();
};

const submitChat = (message: string, forcedIntent?: DialogueIntent): void => {
  const npcId = activeChatNpc;
  if (!npcId || !message.trim()) return;
  const context = dialogueContext(npcId);
  if (!context || context.activeCharacterId !== activeChatCharacter) {
    closeChat();
    showAction("That friend is waiting in another place.", "invalid");
    return;
  }
  chatInput.value = "";
  chatInput.disabled = true;
  chatSendButton.disabled = true;
  chatThinking.hidden = false;
  window.clearTimeout(chatReplyTimer);
  chatReplyTimer = window.setTimeout(() => {
    if (activeChatNpc !== npcId) return;
    const reply = dialogueController.reply(message, context, forcedIntent);
    renderConversation(npcId);
    renderTopics(reply.suggestions);
    chatFriendship.textContent = reply.friendshipLabel;
    chatThinking.hidden = true;
    chatInput.disabled = false;
    chatSendButton.disabled = false;
    if (dialoguePreferences.typedMessages) chatInput.focus();
    gameAudio.playEffect("tap");
    if (isDebugMode) {
      dialogueIntentValue.textContent = reply.intent;
      dialogueEntitiesValue.textContent = reply.entities.map((entity) => entity.id).join(", ") || "none";
      dialogueTemplateValue.textContent = reply.templateId;
    }
  }, accessibilityPreferences.instantDialogue || accessibilityPreferences.reducedMotion ? 0 : 240);
};

const openNpcChat = (npcId: NpcId): void => {
  if (!dialoguePreferences.npcChat) return;
  const context = dialogueContext(npcId);
  if (!context) {
    showAction("That friend is waiting in another place.", "invalid");
    return;
  }
  const state = dialogueController.open(context);
  activeChatNpc = npcId;
  activeChatCharacter = context.activeCharacterId;
  chatNpcPortrait.textContent = state.portrait;
  chatNpcName.textContent = state.npcName;
  chatFriendship.textContent = state.friendshipLabel;
  chatPanel.hidden = false;
  app.classList.add("is-chat-open");
  chatForm.hidden = !dialoguePreferences.typedMessages;
  scheduleViewportSync();
  renderTopics(state.suggestions);
  renderConversation(npcId);
  if (state.conversation.length === 0) submitChat("Hello!", "greeting");
  else if (dialoguePreferences.typedMessages) chatInput.focus();
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
  "prepared-fruit-bowl": "Taste the fruit",
  toast: "Crunch the toast",
  juice: "Sip the juice",
  tea: "Sip the warm tea",
  backpack: "Check the backpack",
  basket: "Check the basket",
  "serving-tray": "Check the tray",
  "shopping-basket": "Check the basket",
  "shopping-bag": "Check the shopping bag",
  "picnic-basket": "Check the picnic basket",
  "watering-can": "Water something",
  camera: "Take a pretend photo",
};

const roomLabels: Record<RoomId, string> = {
  home: "Family home",
  bedroom: "Khadija's bedroom",
  street: "Neighborhood",
  cafe: "Sunny Caf\u00e9",
  park: "Neighborhood park",
  grocery: "Sunny Basket Grocery",
};
const roomIcons: Record<RoomId, string> = {
  home: "\u{1F3E0}",
  bedroom: "\u{1F6CF}\u{FE0F}",
  street: "\u{1F333}",
  cafe: "\u2615",
  park: "\u{1F3DE}\u{FE0F}",
  grocery: "\u{1F6D2}",
};

const updatePlayState = (state: PlayState): void => {
  if (
    activeChatNpc
    && (
      state.selectedCharacter !== activeChatCharacter
      || room?.getDialogueContext(activeChatNpc) === null
    )
  ) closeChat();

  if (lastRoom && lastRoom !== state.activeRoom) {
    recordOnboardingStep("travel");
    transitionIcon.textContent = roomIcons[state.activeRoom];
    transitionTitle.textContent = roomLabels[state.activeRoom];
    app.classList.add("is-room-changing");
    locationTransition.classList.add("is-visible");
    window.clearTimeout(roomTransitionTimer);
    roomTransitionTimer = window.setTimeout(() => {
      app.classList.remove("is-room-changing");
      locationTransition.classList.remove("is-visible");
    }, accessibilityPreferences.reducedMotion ? 0 : 620);
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

room = createPrototypeRoom(engine, {
  onAction: (message, sound) => {
    const isMovementOrTravel = sound === "travel"
      || message === "Off we go!"
      || message.startsWith("We're already at ");

    if (!isMovementOrTravel) recordOnboardingStep("interact");
    showAction(message, sound);
  },
  onPlayerMovement: () => recordOnboardingStep("move"),
  onPlayStateChange: updatePlayState,
  onNpcChat: openNpcChat,
  isNpcChatEnabled: () => dialoguePreferences.npcChat,
  onNpcMemoryEvent: (event) => dialogueController.recordWorldEvent(event),
  onInteractionHint: updateInteractionLabel,
});
room.setLivingSettings(livingPreferences);

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

continueButton.addEventListener("click", enterGame);
newWorldButton.addEventListener("click", () => {
  if (
    hasExistingWorld()
    && !window.confirm("Start a new world? Your current world will be replaced. You can export it first in Grown-Ups.")
  ) return;
  openNewWorldSetup();
});
grownUpsButton.addEventListener("click", openParentGate);
titleCreditsButton.addEventListener("click", () => openReleasePanel(creditsPanel));
titleSettingsButton.addEventListener("click", () => {
  enterGame();
  settingsPanel.hidden = false;
  settingsButton.setAttribute("aria-expanded", "true");
});

startWorldButton.addEventListener("click", () => {
  const selectedQuality = document.querySelector<HTMLInputElement>(
    'input[name="setup-quality"]:checked',
  )?.value;
  const qualityPreset = selectedQuality === "low" || selectedQuality === "balanced"
    ? selectedQuality
    : "adaptive";
  const saved = startNewWorld({
    sound: setupSound.checked,
    music: setupMusic.checked,
    reducedMotion: setupReducedMotion.checked,
    qualityPreset,
  });
  if (!saved) {
    parentResult.textContent = "This browser could not safely create the new world.";
    return;
  }
  window.location.reload();
});

parentGateSubmit.addEventListener("click", () => {
  if (parentGateAnswer.value.trim() !== "7") {
    parentGateMessage.textContent = "That answer did not match. Please ask a grown-up for help.";
    parentGateAnswer.select();
    return;
  }
  openReleasePanel(parentPanel);
});
parentGateAnswer.addEventListener("keydown", (event) => {
  if (event.key === "Enter") parentGateSubmit.click();
});

parentSettingsButton.addEventListener("click", () => {
  enterGame();
  settingsPanel.hidden = false;
  settingsButton.setAttribute("aria-expanded", "true");
  settingsPanel.querySelector<HTMLElement>("button")?.focus();
});
exportSaveButton.addEventListener("click", () => {
  const blob = new Blob([exportWorldSave()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `khadijas-world-save-${RELEASE.version}.json`;
  link.click();
  URL.revokeObjectURL(url);
  parentResult.textContent = "Save exported. Keep the file somewhere safe.";
});
importSaveButton.addEventListener("click", () => importSaveInput.click());
importSaveInput.addEventListener("change", async () => {
  const file = importSaveInput.files?.[0];
  if (!file) return;
  parentResult.textContent = "Checking that save…";
  const raw = await file.text();
  const preview = previewWorldSaveImport(raw);
  if (!preview.accepted) {
    parentResult.textContent = `${preview.message} Your current world has not changed.`;
    importSaveInput.value = "";
    return;
  }
  const confirmed = window.confirm(
    `This ${preview.message.toLowerCase()} Importing it will replace your current world after keeping a safe backup. Continue?`,
  );
  if (!confirmed) {
    parentResult.textContent = "Import cancelled. Your current world is unchanged.";
    importSaveInput.value = "";
    return;
  }
  const result = importWorldSave(raw);
  parentResult.textContent = result.message;
  importSaveInput.value = "";
  if (result.accepted) window.setTimeout(() => window.location.reload(), 500);
});
parentPrivacyButton.addEventListener("click", () => openReleasePanel(privacyPanel));
parentNoticesButton.addEventListener("click", () => openReleasePanel(noticesPanel));
parentCreditsButton.addEventListener("click", () => openReleasePanel(creditsPanel));
parentResetButton.addEventListener("click", () => {
  if (!window.confirm("Start a new world? Export the current world first if you want to keep it.")) return;
  openNewWorldSetup();
});
for (const button of closeReleaseButtons) {
  button.addEventListener("click", () => {
    const panel = button.closest<HTMLElement>(".release-modal");
    if (panel) panel.hidden = true;
    if (gamePaused && !atTitleScreen) {
      pausePanel.hidden = false;
      resumeButton.focus();
    }
  });
}

menuButton.addEventListener("click", () => {
  closeChat();
  closePopovers();
  gamePaused = true;
  gameAudio.setPageVisible(false);
  pausePanel.hidden = false;
  resumeButton.focus();
});
resumeButton.addEventListener("click", enterGame);
pauseSettingsButton.addEventListener("click", () => {
  enterGame();
  settingsPanel.hidden = false;
  settingsButton.setAttribute("aria-expanded", "true");
});
returnTitleButton.addEventListener("click", showTitle);
pauseGrownUpsButton.addEventListener("click", () => {
  pausePanel.hidden = true;
  openParentGate();
});
pauseCreditsButton.addEventListener("click", () => {
  pausePanel.hidden = true;
  openReleasePanel(creditsPanel);
});
exitFullscreenButton.addEventListener("click", () => {
  if (document.fullscreenElement) void document.exitFullscreen();
  else showAction("Full screen is already off.", "toggle");
});

helpButton.addEventListener("click", () => {
  const opening = helpCard.hidden;
  togglePopover(helpCard, helpButton);
  if (opening) recordOnboardingStep("help");
});
onboardingSkipButton.addEventListener("click", skipOnboarding);
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

npcChatToggle.addEventListener("click", () => {
  dialoguePreferences = { ...dialoguePreferences, npcChat: !dialoguePreferences.npcChat };
  dialogueController.memory.setSettings(dialoguePreferences);
  updateSwitch(npcChatToggle, dialoguePreferences.npcChat);
  if (!dialoguePreferences.npcChat) closeChat();
  showAction(dialoguePreferences.npcChat
    ? "Neighborhood chats are ready!"
    : "Neighborhood chats are off.", "toggle");
});

typedChatToggle.addEventListener("click", () => {
  dialoguePreferences = {
    ...dialoguePreferences,
    typedMessages: !dialoguePreferences.typedMessages,
  };
  dialogueController.memory.setSettings(dialoguePreferences);
  updateSwitch(typedChatToggle, dialoguePreferences.typedMessages);
  chatForm.hidden = !dialoguePreferences.typedMessages;
  showAction(dialoguePreferences.typedMessages
    ? "Typed messages are on!"
    : "Topic buttons are ready instead.", "toggle");
});

memoryToggle.addEventListener("click", () => {
  dialoguePreferences = {
    ...dialoguePreferences,
    rememberConversations: !dialoguePreferences.rememberConversations,
  };
  dialogueController.memory.setSettings(dialoguePreferences);
  updateSwitch(memoryToggle, dialoguePreferences.rememberConversations);
  showAction(dialoguePreferences.rememberConversations
    ? "Friends can remember kind moments."
    : "New chats will not be saved.", "toggle");
});

clearAllMemoriesButton.addEventListener("click", () => {
  if (!window.confirm("Clear every friend's conversation memories? Your world and activities will stay safe.")) return;
  dialogueController.clearAll();
  closeChat();
  showAction("Conversation memories cleared. Your world is unchanged.", "toggle");
});

chatCloseButton.addEventListener("click", closeChat);
chatInput.addEventListener("focus", () => {
  chatPrivacyReminder.hidden = releasePreferences.chatPrivacyAcknowledged;
  app.classList.add("is-chat-input-active");
  scheduleViewportSync();
});
chatInput.addEventListener("blur", () => {
  app.classList.remove("is-chat-input-active");
  scheduleViewportSync();
});
chatPrivacyAcknowledge.addEventListener("click", () => {
  releasePreferences.chatPrivacyAcknowledged = true;
  saveReleaseSettings(releasePreferences);
  chatPrivacyReminder.hidden = true;
  chatInput.focus();
});
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!releasePreferences.chatPrivacyAcknowledged) chatPrivacyReminder.hidden = false;
  submitChat(chatInput.value);
});
chatClearButton.addEventListener("click", () => {
  const npcId = activeChatNpc;
  if (!npcId) return;
  if (!window.confirm("Clear this friend's conversation memories?")) return;
  dialogueController.clearNpc(npcId);
  const context = dialogueContext(npcId);
  if (!context) return closeChat();
  const state = dialogueController.open(context);
  renderConversation(npcId);
  renderTopics(state.suggestions);
  showAction("This conversation can begin fresh.", "toggle");
});

idleAnimationToggle.addEventListener("click", () => {
  livingPreferences.idleAnimations = !livingPreferences.idleAnimations;
  updateSwitch(idleAnimationToggle, livingPreferences.idleAnimations);
  room.setLivingSettings(livingPreferences);
  saveLivingSettings(livingPreferences);
  showAction(livingPreferences.idleAnimations
    ? "Character wiggles are on!"
    : "Characters will hold still.", "toggle");
});

smallMovementToggle.addEventListener("click", () => {
  livingPreferences.smallMovements = !livingPreferences.smallMovements;
  updateSwitch(smallMovementToggle, livingPreferences.smallMovements);
  room.setLivingSettings(livingPreferences);
  saveLivingSettings(livingPreferences);
  showAction(livingPreferences.smallMovements
    ? "Little walks are on!"
    : "Everyone will stay in their spot.", "toggle");
});

const persistAccessibility = (): void => {
  saveAccessibilitySettings(accessibilityPreferences);
};

reducedMotionToggle.addEventListener("click", () => {
  accessibilityPreferences.reducedMotion = !accessibilityPreferences.reducedMotion;
  updateSwitch(reducedMotionToggle, accessibilityPreferences.reducedMotion);
  app.classList.toggle("is-reduced-motion", accessibilityPreferences.reducedMotion);
  persistAccessibility();
  showAction(accessibilityPreferences.reducedMotion
    ? "Gentle motion is on."
    : "Playful motion is on.", "toggle");
});

largeTextToggle.addEventListener("click", () => {
  accessibilityPreferences.largeText = !accessibilityPreferences.largeText;
  updateSwitch(largeTextToggle, accessibilityPreferences.largeText);
  app.classList.toggle("is-large-text", accessibilityPreferences.largeText);
  persistAccessibility();
  showAction(accessibilityPreferences.largeText
    ? "Words are a little larger."
    : "Words are back to regular size.", "toggle");
});

highContrastToggle.addEventListener("click", () => {
  accessibilityPreferences.highContrast = !accessibilityPreferences.highContrast;
  updateSwitch(highContrastToggle, accessibilityPreferences.highContrast);
  app.classList.toggle("is-high-contrast", accessibilityPreferences.highContrast);
  persistAccessibility();
  showAction(accessibilityPreferences.highContrast
    ? "Control outlines are stronger."
    : "Control colors are back to normal.", "toggle");
});

instantDialogueToggle.addEventListener("click", () => {
  accessibilityPreferences.instantDialogue = !accessibilityPreferences.instantDialogue;
  updateSwitch(instantDialogueToggle, accessibilityPreferences.instantDialogue);
  persistAccessibility();
  showAction(accessibilityPreferences.instantDialogue
    ? "Neighborhood replies will appear right away."
    : "Neighborhood replies will use a short pause.", "toggle");
});

fullscreenButton.addEventListener("click", () => {
  const action = document.fullscreenElement
    ? document.exitFullscreen()
    : app.requestFullscreen();
  void action.catch(() => showAction("Full screen is not available here.", "invalid"));
});

for (const button of qualityButtons) {
  button.addEventListener("click", () => {
    const playerQuality = button.dataset.quality as PlayerQuality | undefined;
    if (playerQuality) setQuality(playerQuality);
  });
}

resetButton.addEventListener("click", () => {
  const shouldReset = window.confirm("Start a new world? Export the current world first if you want to keep it.");
  if (!shouldReset) return;
  closePopovers();
  openNewWorldSetup();
});

useItemButton.addEventListener("click", () => room.useHeldItem());
dropItemButton.addEventListener("click", () => room.dropHeldItem());
togetherButton.addEventListener("click", () => room.playTogether());

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
  if (event.key !== "Escape") return;
  const openRelease = [
    firstLaunchPanel,
    parentGatePanel,
    parentPanel,
    creditsPanel,
    privacyPanel,
    noticesPanel,
  ].find((panel) => !panel.hidden);
  if (openRelease) {
    openRelease.hidden = true;
    return;
  }
  if (!pausePanel.hidden) {
    enterGame();
    return;
  }
  if (!chatPanel.hidden) {
    closeChat();
    return;
  }
  if (!helpCard.hidden || !settingsPanel.hidden) {
    closePopovers();
    return;
  }
  if (!atTitleScreen) menuButton.click();
});

let displayPaused = false;
let firstFrameShown = false;
engine.runRenderLoop(() => {
  if (
    displayPaused
    || document.hidden
    || ((gamePaused || atTitleScreen) && firstFrameShown)
  ) return;
  room.scene.render();
  if (!firstFrameShown) {
    firstFrameShown = true;
    loadingScreen.classList.add("is-ready");
    window.setTimeout(() => { loadingScreen.hidden = true; }, accessibilityPreferences.reducedMotion ? 0 : 400);
  }
});

canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  displayPaused = true;
  displayRecovery.hidden = false;
});

canvas.addEventListener("webglcontextrestored", () => {
  displayPaused = false;
  displayRecovery.hidden = true;
  engine.resize();
});

restoreDisplayButton.addEventListener("click", () => {
  displayPaused = false;
  displayRecovery.hidden = true;
  engine.resize();
});
reloadDisplayButton.addEventListener("click", () => window.location.reload());

document.addEventListener("visibilitychange", () => {
  gameAudio.setPageVisible(!document.hidden && !gamePaused && !atTitleScreen);
});

let saveStatusTimer = 0;
window.addEventListener("khadijas-world:save-status", (event) => {
  const saved = (event as CustomEvent<{ saved: boolean }>).detail.saved;
  window.clearTimeout(saveStatusTimer);
  saveStatus.textContent = "Saving…";
  pauseSaveStatus.textContent = "Saving…";
  saveStatus.classList.add("is-visible");
  saveStatusTimer = window.setTimeout(() => {
    const message = saved ? "Saved" : "Saving is unavailable";
    saveStatus.textContent = message;
    pauseSaveStatus.textContent = message;
    saveStatus.classList.toggle("is-error", !saved);
    saveStatusTimer = window.setTimeout(() => saveStatus.classList.remove("is-visible"), 1800);
  }, 160);
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
    const livingDebug = room.getLivingDebugState();
    livingValue.textContent = `${livingDebug.activePlayable}/${livingDebug.activeNpcs}`
      + ` \u00b7 ${livingDebug.decisions} decisions`;
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

window.setTimeout(() => {
  const recoveryNotice = consumeSaveRecoveryNotice();
  if (recoveryNotice) showAction(recoveryNotice, "invalid");
  else if (isOnboardingComplete(releasePreferences.onboarding)) {
    showAction("Tap around and make your own story!", "success");
  }
  if (isDebugMode) {
    const saveDebug = getSaveDebugState();
    dialogueMemoryValue.textContent = saveDebug.validationFailures.length > 0
      ? `${saveDebug.validationFailures.length} save warnings`
      : "save ready";
  }
}, 350);
window.addEventListener("beforeunload", () => {
  window.removeEventListener("resize", scheduleViewportSync);
  visualViewport?.removeEventListener("resize", scheduleViewportSync);
  visualViewport?.removeEventListener("scroll", scheduleViewportSync);
  if (viewportSyncFrame !== 0) window.cancelAnimationFrame(viewportSyncFrame);
  room.dispose();
  gameAudio.dispose();
  engine.dispose();
});
