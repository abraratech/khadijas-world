export interface DollhouseOrthoFrame {
  verticalHalfSpan: number;
  horizontalHalfSpan: number;
}

export interface DollhouseViewportMask {
  topPercent: number;
  rightPercent: number;
  bottomPercent: number;
  leftPercent: number;
}

const DEFAULT_ASPECT = 16 / 9;
const DESKTOP_VERTICAL_HALF_SPAN = 4.35;
const DESKTOP_HORIZONTAL_HALF_SPAN = (
  DESKTOP_VERTICAL_HALF_SPAN * DEFAULT_ASPECT
);
const DETACHED_HUD_MINIMUM_VERTICAL_HALF_SPAN = 3.55;
const ROOM_HALF_WIDTH_WITH_MARGIN = 6.15;

// Screen-space matte bounds for the common 12 x 8 dollhouse shell. The mask
// deliberately includes the visible wall/floor frame while hiding decorative
// meshes that extend beyond it. These values are visual only and do not change
// walkable or interaction bounds.
const MASK_HALF_WIDTH = 6.08;
const MASK_TOP_Y = 4.25;
const MASK_TOP_Z = 3.95;
const MASK_BOTTOM_Y = -0.18;
const MASK_BOTTOM_Z = -3.92;
const CAMERA_TARGET_Y = 0.8;
const CAMERA_TARGET_Z = 0.3;
const CAMERA_BETA = 1.08;

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function projectWorldVertical(y: number, z: number): number {
  const relativeY = y - CAMERA_TARGET_Y;
  const relativeZ = z - CAMERA_TARGET_Z;
  return (
    relativeY * Math.sin(CAMERA_BETA)
    + relativeZ * Math.cos(CAMERA_BETA)
  );
}

/**
 * Keeps the complete dollhouse visible on narrow screens while retaining a
 * stable apparent room width when the detached HUD makes the canvas wider.
 */
export function calculateDollhouseOrthoFrame(
  rawAspect: number,
): DollhouseOrthoFrame {
  const aspect = Number.isFinite(rawAspect) && rawAspect > 0
    ? rawAspect
    : DEFAULT_ASPECT;

  const verticalHalfSpan = aspect > DEFAULT_ASPECT
    ? Math.max(
      DETACHED_HUD_MINIMUM_VERTICAL_HALF_SPAN,
      DESKTOP_HORIZONTAL_HALF_SPAN / aspect,
    )
    : Math.max(
      DESKTOP_VERTICAL_HALF_SPAN,
      ROOM_HALF_WIDTH_WITH_MARGIN / aspect,
    );

  return {
    verticalHalfSpan,
    horizontalHalfSpan: verticalHalfSpan * aspect,
  };
}

/**
 * Converts the fixed dollhouse shell bounds into a responsive CSS inset mask.
 * Clipping the canvas preserves every room's gameplay geometry while
 * presenting a clean dollhouse window on screen.
 */
export function calculateDollhouseViewportMask(
  rawAspect: number,
): DollhouseViewportMask {
  const frame = calculateDollhouseOrthoFrame(rawAspect);
  const topProjection = projectWorldVertical(MASK_TOP_Y, MASK_TOP_Z);
  const bottomProjection = projectWorldVertical(
    MASK_BOTTOM_Y,
    MASK_BOTTOM_Z,
  );
  const leftEdge = (
    50 - (MASK_HALF_WIDTH / frame.horizontalHalfSpan) * 50
  );
  const rightEdge = (
    50 + (MASK_HALF_WIDTH / frame.horizontalHalfSpan) * 50
  );
  const topEdge = (
    50 - (topProjection / frame.verticalHalfSpan) * 50
  );
  const bottomEdge = (
    50 - (bottomProjection / frame.verticalHalfSpan) * 50
  );

  return {
    topPercent: clampPercent(topEdge),
    rightPercent: clampPercent(100 - rightEdge),
    bottomPercent: clampPercent(100 - bottomEdge),
    leftPercent: clampPercent(leftEdge),
  };
}
