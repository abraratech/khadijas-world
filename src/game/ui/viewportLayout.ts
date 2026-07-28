export interface VisualViewportSnapshot {
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
}

export interface HudSafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ViewportLayout {
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
  keyboardInset: number;
  compactLandscape: boolean;
  detachedHud: boolean;
  hudSafeArea: HudSafeArea;
}

const EMPTY_HUD_SAFE_AREA: Readonly<HudSafeArea> = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const positiveOr = (value: number, fallback: number): number => (
  Number.isFinite(value) && value > 0 ? value : fallback
);

const nonNegativeOrZero = (value: number): number => (
  Number.isFinite(value) && value > 0 ? value : 0
);

export function measureViewportLayout(
  layoutWidth: number,
  layoutHeight: number,
  visualViewport?: VisualViewportSnapshot | null,
): ViewportLayout {
  const fallbackWidth = positiveOr(layoutWidth, 1);
  const fallbackHeight = positiveOr(layoutHeight, 1);
  const width = positiveOr(
    visualViewport?.width ?? fallbackWidth,
    fallbackWidth,
  );
  const height = positiveOr(
    visualViewport?.height ?? fallbackHeight,
    fallbackHeight,
  );
  const offsetLeft = nonNegativeOrZero(
    visualViewport?.offsetLeft ?? 0,
  );
  const offsetTop = nonNegativeOrZero(
    visualViewport?.offsetTop ?? 0,
  );
  const visibleBottom = Math.min(
    fallbackHeight,
    offsetTop + height,
  );
  const rawKeyboardInset = Math.max(
    0,
    fallbackHeight - visibleBottom,
  );

  // Fractional device-pixel ratios can make the visual viewport slightly
  // shorter than the layout viewport. Only a meaningful reduction represents
  // an opened software keyboard.
  const keyboardInset = rawKeyboardInset >= 24
    ? rawKeyboardInset
    : 0;

  const compactLandscape = width > height && height <= 520;
  const detachedHud = (
    !compactLandscape
    && keyboardInset === 0
    && width >= 1_100
    && height >= 580
  );

  const roomyDesktop = detachedHud && width >= 1_440 && height >= 800;
  const compactDesktop = detachedHud && height < 680;

  // Desktop gameplay uses a persistent left rail. The playfield therefore
  // needs only a small top margin, a bottom control-dock reservation, and
  // enough left space for the complete rail.
  const hudSafeArea: HudSafeArea = detachedHud
    ? roomyDesktop
      ? { top: 8, right: 10, bottom: 82, left: 124 }
      : compactDesktop
        ? { top: 6, right: 6, bottom: 72, left: 116 }
        : { top: 6, right: 8, bottom: 74, left: 120 }
    : { ...EMPTY_HUD_SAFE_AREA };

  return {
    width,
    height,
    offsetLeft,
    offsetTop,
    keyboardInset,
    compactLandscape,
    detachedHud,
    hudSafeArea,
  };
}
