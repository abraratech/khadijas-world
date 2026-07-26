import {
  Color3,
  DynamicTexture,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  type Scene,
  type TransformNode,
  Vector3,
} from "@babylonjs/core";

export const DEFAULT_WORLD_PLAQUE_ROTATION_Y = Math.PI;

export interface WorldPlaqueOptions {
  width?: number;
  height?: number;
  background?: string;
  border?: string;
  foreground?: string;
  fontSize?: number;
  parent?: TransformNode;
  rotationY?: number;
}

interface PlaqueCanvasContext {
  beginPath(): void;
  moveTo(x: number, y: number): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  closePath(): void;
  clearRect(x: number, y: number, width: number, height: number): void;
  fill(): void;
  stroke(): void;
  fillText(text: string, x: number, y: number, maximumWidth?: number): void;
  fillStyle: string | CanvasGradient | CanvasPattern;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
}

function roundedRectangle(
  context: PlaqueCanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x + width - safeRadius, y + height, safeRadius);
  context.arcTo(x, y + height, x, y + height - safeRadius, safeRadius);
  context.arcTo(x, y, x + safeRadius, y, safeRadius);
  context.closePath();
}

export function createWorldPlaque(
  scene: Scene,
  name: string,
  text: string,
  position: Vector3,
  options: WorldPlaqueOptions = {},
): Mesh {
  const width = options.width ?? 1.35;
  const height = options.height ?? .34;
  const textureWidth = 512;
  const textureHeight = 144;
  const texture = new DynamicTexture(
    `${name}-texture`,
    { width: textureWidth, height: textureHeight },
    scene,
    false,
  );
  texture.hasAlpha = true;
  const context = texture.getContext() as unknown as PlaqueCanvasContext;
  context.clearRect(0, 0, textureWidth, textureHeight);
  roundedRectangle(context, 8, 8, textureWidth - 16, textureHeight - 16, 34);
  context.fillStyle = options.background ?? "#fff7e8";
  context.fill();
  context.lineWidth = 9;
  context.strokeStyle = options.border ?? "#6f4a7d";
  context.stroke();
  context.fillStyle = options.foreground ?? "#493653";
  context.font = `900 ${options.fontSize ?? 48}px Arial, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text.toUpperCase(), textureWidth / 2, textureHeight / 2 + 3, textureWidth - 54);
  texture.update(false);

  const material = new StandardMaterial(`${name}-material`, scene);
  material.diffuseTexture = texture;
  material.opacityTexture = texture;
  material.useAlphaFromDiffuseTexture = true;
  material.emissiveColor = new Color3(.16, .13, .18);
  material.specularColor = new Color3(.14, .14, .14);
  material.specularPower = 30;
  // Plaques are viewed from the fixed dollhouse camera on the negative-Z side.
  // Render only the intended front face so the DynamicTexture can never be
  // seen through the back of the plane (which mirrors the lettering).
  material.backFaceCulling = true;

  const plaque = MeshBuilder.CreatePlane(
    name,
    { width, height, sideOrientation: Mesh.FRONTSIDE },
    scene,
  );
  plaque.position.copyFrom(position);
  plaque.rotation.y = options.rotationY ?? DEFAULT_WORLD_PLAQUE_ROTATION_Y;
  plaque.material = material;
  plaque.parent = options.parent ?? null;
  plaque.isPickable = false;
  plaque.receiveShadows = false;
  plaque.metadata = { decorativeLabel: true };
  return plaque;
}
