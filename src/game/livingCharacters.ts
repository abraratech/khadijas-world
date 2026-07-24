import type { RoomId } from "./storage";

export interface LivingSettings {
  idleAnimations: boolean;
  smallMovements: boolean;
}

export type LivingAction =
  | "idle"
  | "look-around"
  | "react"
  | "relax"
  | "sleep"
  | "use-item"
  | "social"
  | "short-wander"
  | "work";

export interface LivingController {
  action: LivingAction;
  nextDecisionAt: number;
  actionEndsAt: number;
  seed: number;
  decisionCount: number;
}

export const NPC_IDS = ["parent", "neighbor", "cafe-worker"] as const;
export type NpcId = typeof NPC_IDS[number];

export interface StoredNpcState {
  id: NpcId;
  room: RoomId;
  position: { x: number; y: number; z: number };
  rotationY: number;
  heldItem: string | null;
  stationId: string | null;
  activity: "relax" | "work" | "greet";
}

export interface NpcDefinition {
  id: NpcId;
  displayName: string;
  homeLocation: RoomId;
  position: { x: number; y: number; z: number };
  outfit: "pink" | "teal" | "yellow";
  role: "guardian" | "neighbor" | "cafe-worker";
  idleBehaviorSet: readonly LivingAction[];
  interactionPrompt: string;
  dialogue: readonly string[];
  workStation?: string;
  seatId?: string;
  scale: number;
}

export const LIVING_SETTINGS_DEFAULTS: LivingSettings = {
  idleAnimations: true,
  smallMovements: true,
};

export const NPC_DEFINITIONS: Record<NpcId, NpcDefinition> = {
  parent: {
    id: "parent",
    displayName: "Mama",
    homeLocation: "home",
    position: { x: 1.75, y: 0, z: 1.45 },
    outfit: "pink",
    role: "guardian",
    idleBehaviorSet: ["look-around", "relax", "use-item", "social"],
    interactionPrompt: "Say hello to Mama",
    dialogue: [
      "What a lovely story you are making!",
      "Hello, sunshine!",
      "I love seeing everyone play together.",
    ],
    workStation: "home-reading-corner",
    seatId: "home-sofa-2",
    scale: 1.02,
  },
  neighbor: {
    id: "neighbor",
    displayName: "Auntie Noor",
    homeLocation: "street",
    position: { x: 40.35, y: 0, z: -.85 },
    outfit: "yellow",
    role: "neighbor",
    idleBehaviorSet: ["look-around", "relax", "social", "short-wander"],
    interactionPrompt: "Wave to Auntie Noor",
    dialogue: [
      "What a sunny day!",
      "Hello, neighbors!",
      "The flowers are looking happy today.",
    ],
    workStation: "street-flowers",
    seatId: "street-bench-2",
    scale: .9,
  },
  "cafe-worker": {
    id: "cafe-worker",
    displayName: "Ms. Sana",
    homeLocation: "cafe",
    position: { x: 69.55, y: 0, z: 2.75 },
    outfit: "teal",
    role: "cafe-worker",
    idleBehaviorSet: ["look-around", "work", "social", "react"],
    interactionPrompt: "Ask Ms. Sana for a treat",
    dialogue: [
      "Welcome to Sunny Caf\u00e9!",
      "Something tasty is coming right up!",
      "I hope you are having a lovely day.",
    ],
    workStation: "cafe-counter",
    scale: .94,
  },
};

export function createDefaultNpcStates(): Record<NpcId, StoredNpcState> {
  return Object.fromEntries(NPC_IDS.map((id) => {
    const definition = NPC_DEFINITIONS[id];
    return [id, {
      id,
      room: definition.homeLocation,
      position: { ...definition.position },
      rotationY: id === "cafe-worker" ? Math.PI : 0,
      heldItem: null,
      stationId: definition.workStation ?? null,
      activity: id === "cafe-worker" ? "work" : "relax",
    } satisfies StoredNpcState];
  })) as Record<NpcId, StoredNpcState>;
}

export function normalizeLivingSettings(value: unknown): LivingSettings {
  if (!value || typeof value !== "object") return { ...LIVING_SETTINGS_DEFAULTS };
  const candidate = value as Partial<LivingSettings>;
  return {
    idleAnimations: candidate.idleAnimations !== false,
    smallMovements: candidate.smallMovements !== false,
  };
}

function safeNpcPosition(
  id: NpcId,
  value: unknown,
): StoredNpcState["position"] {
  const fallback = NPC_DEFINITIONS[id].position;
  if (!value || typeof value !== "object") return { ...fallback };
  const candidate = value as Partial<StoredNpcState["position"]>;
  const maximumDistance = id === "parent" ? .75 : id === "cafe-worker" ? 1.25 : 1.35;
  const x = typeof candidate.x === "number" && Number.isFinite(candidate.x)
    ? candidate.x
    : fallback.x;
  const z = typeof candidate.z === "number" && Number.isFinite(candidate.z)
    ? candidate.z
    : fallback.z;
  const distance = Math.hypot(x - fallback.x, z - fallback.z);
  if (distance > maximumDistance) return { ...fallback };
  return { x, y: 0, z };
}

export function normalizeNpcStates(
  value: unknown,
): Record<NpcId, StoredNpcState> {
  const defaults = createDefaultNpcStates();
  if (!value || typeof value !== "object") return defaults;
  const candidates = value as Partial<Record<NpcId, Partial<StoredNpcState>>>;

  for (const id of NPC_IDS) {
    const candidate = candidates[id];
    if (!candidate) continue;
    defaults[id] = {
      id,
      room: NPC_DEFINITIONS[id].homeLocation,
      position: safeNpcPosition(id, candidate.position),
      rotationY: typeof candidate.rotationY === "number" && Number.isFinite(candidate.rotationY)
        ? candidate.rotationY
        : defaults[id].rotationY,
      heldItem: typeof candidate.heldItem === "string" ? candidate.heldItem : null,
      stationId: candidate.stationId
        && (candidate.stationId === NPC_DEFINITIONS[id].workStation
          || candidate.stationId === NPC_DEFINITIONS[id].seatId)
        ? candidate.stationId
        : defaults[id].stationId,
      activity: candidate.activity === "work" || candidate.activity === "greet"
        ? candidate.activity
        : "relax",
    };
  }
  return defaults;
}

export function createLivingController(seed: number, now = performance.now()): LivingController {
  return {
    action: "idle",
    nextDecisionAt: now + 2600 + seed * 730,
    actionEndsAt: now,
    seed,
    decisionCount: 0,
  };
}

export function scheduleNextDecision(
  controller: LivingController,
  now: number,
  minimumDelay = 3600,
  maximumDelay = 7600,
): void {
  const span = maximumDelay - minimumDelay;
  const stagger = ((controller.seed * 9301 + controller.decisionCount * 49297) % 2333) / 2333;
  controller.nextDecisionAt = now + minimumDelay + span * stagger;
  controller.decisionCount += 1;
}

export function chooseLivingAction(
  controller: LivingController,
  choices: readonly LivingAction[],
): LivingAction {
  if (choices.length === 0) return "idle";
  const index = (controller.seed * 7 + controller.decisionCount * 5) % choices.length;
  return choices[index];
}
