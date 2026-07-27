import type { Scene } from "@babylonjs/core";
import type { QualitySettings } from "../quality";
import type {
  CharacterExpression,
  CharacterId,
} from "../characterState";
import type { LivingSettings, NpcId } from "../livingCharacters";
import type { NpcWorldMemoryEvent } from "../npc/NpcMemoryStore";
import type { OutfitId, RoomId } from "../storage";
import type { InteractionHint } from "../readability/interactionReadability";

export type InteractionSound =
  | "tap"
  | "pickup"
  | "success"
  | "travel"
  | "sleep"
  | "bell"
  | "toggle"
  | "appliance"
  | "water"
  | "clean"
  | "storage"
  | "combine"
  | "recipe"
  | "shared"
  | "invalid";

export interface PlayState {
  heldItem: string | null;
  seated: boolean;
  sleeping: boolean;
  outfit: OutfitId;
  activeRoom: RoomId;
  selectedCharacter: CharacterId;
  expression: CharacterExpression;
  characters: Array<{
    id: CharacterId;
    room: RoomId;
    expression: CharacterExpression;
    heldItem: string | null;
  }>;
}

export interface RoomDialogueContext {
  npcId: NpcId;
  activeCharacterId: CharacterId;
  activeCharacterName: string;
  locationId: RoomId;
  locationName: string;
  nearbyCharacterIds: string[];
  heldItemId?: string;
  recentWorldEvents: string[];
  relationshipLevel: number;
  recentTopics: string[];
}

export interface PrototypeRoom {
  scene: Scene;
  setQuality(settings: QualitySettings): void;
  useHeldItem(): void;
  dropHeldItem(): void;
  setOutfit(outfit: OutfitId): void;
  setExpression(expression: CharacterExpression): void;
  selectCharacter(characterId: CharacterId): void;
  switchRoom(room: RoomId): void;
  setLivingSettings(settings: LivingSettings): void;
  playTogether(): void;
  getDialogueContext(npcId: NpcId): RoomDialogueContext | null;
  getLivingDebugState(): {
    activePlayable: number;
    activeNpcs: number;
    decisions: number;
  };
  dispose(): void;
}

export interface RoomOptions {
  onAction(message: string, sound?: InteractionSound): void;
  onPlayStateChange(state: PlayState): void;
  onNpcChat?(npcId: NpcId): void;
  isNpcChatEnabled?(): boolean;
  onNpcMemoryEvent?(event: NpcWorldMemoryEvent): void;
  onPlayerMovement?(): void;
  onInteractionHint?(hint: InteractionHint | null): void;
}
