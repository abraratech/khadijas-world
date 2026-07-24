import type { NpcMemory } from "./NpcMemory";

export type FriendshipLevel = "New friend" | "Friendly" | "Good friend" | "Great friend";

export function friendshipLevel(score: number): FriendshipLevel {
  if (score >= 24) return "Great friend";
  if (score >= 12) return "Good friend";
  if (score >= 4) return "Friendly";
  return "New friend";
}

export function addFriendship(memory: NpcMemory, amount: number): FriendshipLevel {
  memory.friendship = Math.max(0, Math.min(99, memory.friendship + Math.max(0, amount)));
  return friendshipLevel(memory.friendship);
}

