import type { RoomId } from "../storage";

export interface InteractionDescriptor {
  label: string;
  hint: string;
  icon: string;
  room?: RoomId;
}

export interface InteractionHint extends InteractionDescriptor {
  x: number;
  y: number;
}

export interface InteractionMetadata {
  interactionLabel?: unknown;
  interactionHint?: unknown;
  interactionIcon?: unknown;
  room?: unknown;
}

const ROOM_IDS: readonly RoomId[] = ["home", "bedroom", "street", "cafe", "park", "grocery"];

function shortText(value: unknown, maximum: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return undefined;
  return cleaned.slice(0, maximum);
}

export function descriptorFromMetadata(metadata: unknown): InteractionDescriptor | null {
  if (!metadata || typeof metadata !== "object") return null;
  const candidate = metadata as InteractionMetadata;
  const label = shortText(candidate.interactionLabel, 48);
  const hint = shortText(candidate.interactionHint, 72);
  if (!label || !hint) return null;
  const icon = shortText(candidate.interactionIcon, 8) ?? "✦";
  const roomValue = candidate.room;
  const room = typeof roomValue === "string" && ROOM_IDS.includes(roomValue as RoomId)
    ? roomValue as RoomId
    : undefined;
  return { label, hint, icon, room };
}

export function interactionMetadata(
  current: unknown,
  descriptor: InteractionDescriptor,
): Record<string, unknown> {
  const base = current && typeof current === "object"
    ? { ...(current as Record<string, unknown>) }
    : {};
  return {
    ...base,
    interactionLabel: descriptor.label,
    interactionHint: descriptor.hint,
    interactionIcon: descriptor.icon,
    ...(descriptor.room ? { room: descriptor.room } : {}),
  };
}

export function humanizeInteractionId(value: string): string {
  return value
    .replace(/^shop-/, "")
    .replace(/^world3-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
