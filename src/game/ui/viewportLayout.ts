export interface VisualViewportSnapshot {
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
}

export interface ViewportLayout {
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
  keyboardInset: number;
  compactLandscape: boolean;
}

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
  const width = positiveOr(visualViewport?.width ?? fallbackWidth, fallbackWidth);
  const height = positiveOr(visualViewport?.height ?? fallbackHeight, fallbackHeight);
  const offsetLeft = nonNegativeOrZero(visualViewport?.offsetLeft ?? 0);
  const offsetTop = nonNegativeOrZero(visualViewport?.offsetTop ?? 0);
  const visibleBottom = Math.min(fallbackHeight, offsetTop + height);
  const keyboardInset = Math.max(0, fallbackHeight - visibleBottom);

  return {
    width,
    height,
    offsetLeft,
    offsetTop,
    keyboardInset,
    compactLandscape: width > height && height <= 520,
  };
}
