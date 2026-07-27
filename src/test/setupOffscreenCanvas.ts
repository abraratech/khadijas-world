/**
 * Minimal two-dimensional canvas surface for Babylon DynamicTexture tests.
 *
 * The production application uses the browser's native canvas implementation.
 * This shim is loaded only by Vitest so NullEngine can construct and exercise
 * DynamicTexture-backed UI without adding a native canvas dependency.
 */
class TestCanvasContext2D {
  readonly canvas: TestOffscreenCanvas;
  fillStyle: string | CanvasGradient | CanvasPattern = "#000000";
  strokeStyle: string | CanvasGradient | CanvasPattern = "#000000";
  lineWidth = 1;
  font = "10px sans-serif";
  textAlign: CanvasTextAlign = "start";
  textBaseline: CanvasTextBaseline = "alphabetic";

  constructor(canvas: TestOffscreenCanvas) {
    this.canvas = canvas;
  }

  beginPath(): void {}
  closePath(): void {}
  clearRect(_x: number, _y: number, _width: number, _height: number): void {}
  fill(): void {}
  stroke(): void {}
  moveTo(_x: number, _y: number): void {}
  lineTo(_x: number, _y: number): void {}
  arcTo(
    _x1: number,
    _y1: number,
    _x2: number,
    _y2: number,
    _radius: number,
  ): void {}
  fillText(
    _text: string,
    _x: number,
    _y: number,
    _maximumWidth?: number,
  ): void {}
  measureText(text: string): TextMetrics {
    return { width: text.length * 8 } as TextMetrics;
  }
}

class TestOffscreenCanvas {
  width: number;
  height: number;
  private readonly context: TestCanvasContext2D;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.context = new TestCanvasContext2D(this);
  }

  getContext(contextId: string): TestCanvasContext2D | null {
    return contextId === "2d" ? this.context : null;
  }

  remove(): void {}
}

if (typeof globalThis.OffscreenCanvas === "undefined") {
  Object.defineProperty(globalThis, "OffscreenCanvas", {
    configurable: true,
    writable: true,
    value: TestOffscreenCanvas,
  });
}
