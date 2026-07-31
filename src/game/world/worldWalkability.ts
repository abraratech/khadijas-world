import { Vector3 } from "@babylonjs/core";
import type { NpcId } from "../livingCharacters";
import type { RoomId } from "../storage";

interface WalkRect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

interface RoomWalkProfile {
  offsetX: number;
  bounds: WalkRect;
  obstacles: readonly WalkRect[];
  fallback: readonly [number, number];
}

const ROOM_WALK_PROFILES: Record<RoomId, RoomWalkProfile> = {
  home: {
    offsetX: 0,
    bounds: {
      minX: -5.05,
      maxX: 5.00,
      minZ: -3.08,
      maxZ: 3.18,
    },
    obstacles: [
      { minX: -5.45, maxX: -1.25, minZ: -.66, maxZ: 1.28 },
      { minX: -4.08, maxX: -1.12, minZ: -2.58, maxZ: -1.00 },
      { minX: -5.78, maxX: -3.22, minZ: -3.05, maxZ: -2.00 },
      { minX: 1.55, maxX: 5.45, minZ: -.48, maxZ: 1.32 },
      { minX: 1.10, maxX: 5.62, minZ: 2.08, maxZ: 3.62 },
      { minX: -5.72, maxX: -4.62, minZ: 2.20, maxZ: 3.38 },
    ],
    fallback: [0, -1.65],
  },
  bedroom: {
    offsetX: 22,
    bounds: {
      minX: -5.02,
      maxX: 5.03,
      minZ: -3.08,
      maxZ: 3.18,
    },
    obstacles: [
      { minX: -5.35, maxX: -1.70, minZ: -.72, maxZ: 1.72 },
      { minX: 2.55, maxX: 5.45, minZ: 1.35, maxZ: 3.48 },
      { minX: 3.68, maxX: 5.62, minZ: -3.28, maxZ: -2.05 },
      { minX: -.38, maxX: 2.24, minZ: 2.48, maxZ: 3.48 },
      { minX: .05, maxX: 1.78, minZ: -1.12, maxZ: .08 },
      { minX: .95, maxX: 4.28, minZ: -2.62, maxZ: -1.02 },
    ],
    fallback: [0, -1.72],
  },
  street: {
    offsetX: 44,
    bounds: {
      minX: -5.03,
      maxX: 5.03,
      minZ: -3.05,
      maxZ: 3.12,
    },
    obstacles: [
      { minX: -3.48, maxX: -.72, minZ: .42, maxZ: 1.72 },
      { minX: -.88, maxX: .38, minZ: 1.42, maxZ: 3.22 },
      { minX: -5.62, maxX: -4.58, minZ: .05, maxZ: 1.45 },
      { minX: -5.48, maxX: 5.48, minZ: 3.02, maxZ: 3.62 },
    ],
    fallback: [0, -1.65],
  },
  cafe: {
    offsetX: 66,
    bounds: {
      minX: -5.03,
      maxX: 5.03,
      minZ: -3.08,
      maxZ: 3.18,
    },
    obstacles: [
      { minX: 1.05, maxX: 5.65, minZ: 1.14, maxZ: 3.62 },
      { minX: 3.62, maxX: 5.68, minZ: -.14, maxZ: 1.18 },
      { minX: -4.30, maxX: -2.72, minZ: -.18, maxZ: 2.14 },
      { minX: -1.90, maxX: -.30, minZ: -.18, maxZ: 2.14 },
      { minX: -5.55, maxX: -3.72, minZ: 2.08, maxZ: 3.48 },
    ],
    fallback: [-2.18, -1.56],
  },
  park: {
    offsetX: 88,
    bounds: {
      minX: -5.02,
      maxX: 5.02,
      minZ: -3.08,
      maxZ: 3.18,
    },
    obstacles: [
      { minX: -4.78, maxX: -2.38, minZ: -.62, maxZ: .58 },
      { minX: 2.38, maxX: 4.82, minZ: -.62, maxZ: .58 },
      { minX: -4.98, maxX: -1.72, minZ: -2.92, maxZ: -1.38 },
      { minX: 2.42, maxX: 4.38, minZ: -3.18, maxZ: -.90 },
      { minX: .68, maxX: 3.32, minZ: 1.72, maxZ: 3.22 },
      { minX: 3.10, maxX: 5.58, minZ: -.98, maxZ: 1.35 },
      { minX: -3.05, maxX: -.55, minZ: 1.52, maxZ: 3.28 },
      { minX: -.08, maxX: 1.18, minZ: 1.92, maxZ: 3.28 },
      { minX: .62, maxX: 2.92, minZ: -1.18, maxZ: -.16 },
      { minX: -2.08, maxX: -.92, minZ: -1.38, maxZ: -.18 },
    ],
    fallback: [0, -2.46],
  },
  grocery: {
    offsetX: 110,
    bounds: {
      minX: -5.02,
      maxX: 5.02,
      minZ: -3.08,
      maxZ: 3.18,
    },
    obstacles: [
      { minX: -5.72, maxX: -3.18, minZ: -3.28, maxZ: -2.00 },
      { minX: -4.50, maxX: -.62, minZ: 2.08, maxZ: 3.22 },
      { minX: -4.50, maxX: -.62, minZ: .18, maxZ: 1.40 },
      { minX: -4.50, maxX: -.62, minZ: -1.62, maxZ: -.38 },
      { minX: -1.12, maxX: 2.68, minZ: -3.28, maxZ: -1.72 },
      { minX: 1.95, maxX: 5.12, minZ: -.55, maxZ: 1.22 },
      { minX: 3.02, maxX: 5.72, minZ: -3.18, maxZ: -2.00 },
      { minX: 3.00, maxX: 5.72, minZ: 2.08, maxZ: 3.48 },
    ],
    fallback: [.20, .76],
  },
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function padded(rect: WalkRect, radius: number): WalkRect {
  return {
    minX: rect.minX - radius,
    maxX: rect.maxX + radius,
    minZ: rect.minZ - radius,
    maxZ: rect.maxZ + radius,
  };
}

function contains(rect: WalkRect, x: number, z: number): boolean {
  return (
    x >= rect.minX
    && x <= rect.maxX
    && z >= rect.minZ
    && z <= rect.maxZ
  );
}

function profilePoint(
  room: RoomId,
  point: Vector3,
): { profile: RoomWalkProfile; x: number; z: number } {
  const profile = ROOM_WALK_PROFILES[room];
  return {
    profile,
    x: point.x - profile.offsetX,
    z: point.z,
  };
}

function worldPoint(
  profile: RoomWalkProfile,
  x: number,
  z: number,
): Vector3 {
  return new Vector3(x + profile.offsetX, 0, z);
}

export function isWorldPointWalkable(
  room: RoomId,
  point: Vector3,
  radius = .30,
): boolean {
  const { profile, x, z } = profilePoint(room, point);
  const innerBounds = {
    minX: profile.bounds.minX + radius,
    maxX: profile.bounds.maxX - radius,
    minZ: profile.bounds.minZ + radius,
    maxZ: profile.bounds.maxZ - radius,
  };

  if (!contains(innerBounds, x, z)) return false;

  return !profile.obstacles.some((obstacle) => (
    contains(padded(obstacle, radius), x, z)
  ));
}

export function resolveWorldWalkablePoint(
  room: RoomId,
  point: Vector3,
  radius = .30,
  fallback?: Vector3,
): Vector3 {
  const { profile } = profilePoint(room, point);
  const innerBounds = {
    minX: profile.bounds.minX + radius,
    maxX: profile.bounds.maxX - radius,
    minZ: profile.bounds.minZ + radius,
    maxZ: profile.bounds.maxZ - radius,
  };

  let x = clamp(
    point.x - profile.offsetX,
    innerBounds.minX,
    innerBounds.maxX,
  );
  let z = clamp(
    point.z,
    innerBounds.minZ,
    innerBounds.maxZ,
  );

  for (let pass = 0; pass < 8; pass += 1) {
    const obstacle = profile.obstacles.find((candidate) => (
      contains(padded(candidate, radius), x, z)
    ));

    if (!obstacle) {
      return worldPoint(profile, x, z);
    }

    const blocked = padded(obstacle, radius);
    const candidates = [
      {
        x: blocked.minX - .015,
        z,
        distance: Math.abs(x - blocked.minX),
      },
      {
        x: blocked.maxX + .015,
        z,
        distance: Math.abs(blocked.maxX - x),
      },
      {
        x,
        z: blocked.minZ - .015,
        distance: Math.abs(z - blocked.minZ),
      },
      {
        x,
        z: blocked.maxZ + .015,
        distance: Math.abs(blocked.maxZ - z),
      },
    ].sort((a, b) => a.distance - b.distance);

    const candidate = candidates.find((option) => (
      contains(innerBounds, option.x, option.z)
    ));

    if (!candidate) break;

    x = candidate.x;
    z = candidate.z;
  }

  if (fallback && isWorldPointWalkable(room, fallback, radius)) {
    return fallback.clone();
  }

  return worldPoint(
    profile,
    profile.fallback[0],
    profile.fallback[1],
  );
}

function segmentIsWalkable(
  room: RoomId,
  from: Vector3,
  to: Vector3,
  radius: number,
): boolean {
  const distance = Vector3.Distance(from, to);
  const steps = Math.max(2, Math.ceil(distance / .12));

  for (let index = 1; index <= steps; index += 1) {
    const amount = index / steps;
    const sample = Vector3.Lerp(from, to, amount);
    if (!isWorldPointWalkable(room, sample, radius)) return false;
  }

  return true;
}

export function resolveWorldWalkableStep(
  room: RoomId,
  from: Vector3,
  to: Vector3,
  radius = .30,
): Vector3 {
  const direct = resolveWorldWalkablePoint(
    room,
    to,
    radius,
    from,
  );

  if (segmentIsWalkable(room, from, direct, radius)) {
    return direct;
  }

  const slideX = resolveWorldWalkablePoint(
    room,
    new Vector3(to.x, 0, from.z),
    radius,
    from,
  );

  if (segmentIsWalkable(room, from, slideX, radius)) {
    return slideX;
  }

  const slideZ = resolveWorldWalkablePoint(
    room,
    new Vector3(from.x, 0, to.z),
    radius,
    from,
  );

  if (segmentIsWalkable(room, from, slideZ, radius)) {
    return slideZ;
  }

  return from.clone();
}

function withOffset(
  room: RoomId,
  x: number,
  z: number,
): Vector3 {
  return new Vector3(
    ROOM_WALK_PROFILES[room].offsetX + x,
    0,
    z,
  );
}

export const FAST_TRACK_NPC_STATIONS: Record<NpcId, Vector3> = {
  parent: withOffset("home", 1.72, 1.72),
  neighbor: withOffset("street", -3.68, -.88),
  "cafe-worker": withOffset("cafe", .62, 2.42),
  "park-keeper": withOffset("park", -3.18, 1.02),
  "park-parent": withOffset("park", 1.55, -1.75),
  shopkeeper: withOffset("grocery", 1.68, -1.25),
  "grocery-shopper": withOffset("grocery", .08, .82),
};

export const FAST_TRACK_ROOM_STAGES: Record<
  RoomId,
  readonly Vector3[]
> = {
  home: [
    withOffset("home", 0, -1.68),
    withOffset("home", .72, -1.12),
    withOffset("home", -.62, -1.08),
  ],
  bedroom: [
    withOffset("bedroom", 0, -1.72),
    withOffset("bedroom", -.72, -.78),
    withOffset("bedroom", .78, .42),
  ],
  street: [
    withOffset("street", 0, -1.68),
    withOffset("street", -1.18, -1.10),
    withOffset("street", 2.00, -1.14),
  ],
  cafe: [
    withOffset("cafe", -2.20, -1.58),
    withOffset("cafe", .05, -1.18),
    withOffset("cafe", -4.48, -1.02),
  ],
  park: [
    withOffset("park", 0, -2.46),
    withOffset("park", 0, -.82),
    withOffset("park", -.35, -.82),
  ],
  grocery: [
    withOffset("grocery", .20, .76),
    withOffset("grocery", .42, 1.72),
    withOffset("grocery", -.18, 1.72),
  ],
};
