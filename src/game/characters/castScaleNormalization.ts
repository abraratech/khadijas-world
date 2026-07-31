import type { CharacterId } from "../characterState";
import type { NpcId } from "../livingCharacters";

const COMPANION_SCENE_SCALE: Partial<
  Record<CharacterId, number>
> = {
  khadija: .94,
  sister: .94,
  brother: .94,
};

const NPC_SCENE_SCALE: Record<NpcId, number> = {
  parent: .92,
  neighbor: .92,
  "cafe-worker": .92,
  "park-keeper": .92,
  "park-parent": .92,
  shopkeeper: .92,
  "grocery-shopper": .92,
};

export function companionSceneScale(
  characterId: CharacterId,
): number {
  return COMPANION_SCENE_SCALE[characterId] ?? 1;
}

export function npcSceneScale(
  npcId: NpcId,
): number {
  return NPC_SCENE_SCALE[npcId];
}
