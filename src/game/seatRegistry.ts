import { Vector3 } from "@babylonjs/core";
import type { CharacterId, CharacterState } from "./characterState";
import type { RoomId } from "./storage";

export type SeatKind = "sofa" | "bed" | "bench" | "cafe-chair";

export interface SeatSlot {
  id: string;
  kind: SeatKind;
  room: RoomId;
  position: Vector3;
  approach: Vector3;
  rotationY: number;
  sleeping: boolean;
}

function occupiedSeatIds(
  characters: Record<CharacterId, CharacterState>,
  exceptCharacter?: CharacterId,
): Set<string> {
  const occupied = new Set<string>();
  for (const character of Object.values(characters)) {
    if (character.id !== exceptCharacter && character.seatId) occupied.add(character.seatId);
  }
  return occupied;
}

export function findAvailableSeat(
  seats: readonly SeatSlot[],
  kind: SeatKind,
  room: RoomId,
  characters: Record<CharacterId, CharacterState>,
  characterId: CharacterId,
): SeatSlot | null {
  const occupied = occupiedSeatIds(characters, characterId);
  return seats.find((seat) => seat.kind === kind && seat.room === room && !occupied.has(seat.id)) ?? null;
}

export function findNearbyAvailableSeat(
  seats: readonly SeatSlot[],
  room: RoomId,
  position: Vector3,
  characters: Record<CharacterId, CharacterState>,
  characterId: CharacterId,
  maximumDistance = 1.35,
): SeatSlot | null {
  const occupied = occupiedSeatIds(characters, characterId);
  let nearest: SeatSlot | null = null;
  let nearestDistance = maximumDistance;

  for (const seat of seats) {
    if (seat.room !== room || occupied.has(seat.id)) continue;
    const distance = Vector3.Distance(
      new Vector3(position.x, 0, position.z),
      new Vector3(seat.approach.x, 0, seat.approach.z),
    );
    if (distance < nearestDistance) {
      nearest = seat;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function getSeatById(seats: readonly SeatSlot[], seatId: string | null): SeatSlot | null {
  return seatId ? seats.find((seat) => seat.id === seatId) ?? null : null;
}
