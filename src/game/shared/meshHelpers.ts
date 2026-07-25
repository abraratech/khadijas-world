import {
  Animation,
  Color3,
  type Mesh,
  MeshBuilder,
  type Scene,
  type StandardMaterial,
  type TransformNode,
  type Vector3,
} from "@babylonjs/core";
import { createMaterial } from "./createMaterials";

export function box(
  scene: Scene,
  name: string,
  size: Vector3,
  position: Vector3,
  material: StandardMaterial,
  parent?: TransformNode,
): Mesh {
  const mesh = MeshBuilder.CreateBox(name, {
    width: size.x,
    height: size.y,
    depth: size.z,
  }, scene);
  mesh.position.copyFrom(position);
  mesh.material = material;
  mesh.parent = parent ?? null;
  mesh.receiveShadows = true;
  return mesh;
}

export function cylinder(
  scene: Scene,
  name: string,
  diameter: number,
  height: number,
  position: Vector3,
  material: StandardMaterial,
  tessellation = 16,
): Mesh {
  const mesh = MeshBuilder.CreateCylinder(
    name,
    { diameter, height, tessellation },
    scene,
  );
  mesh.position.copyFrom(position);
  mesh.material = material;
  return mesh;
}

export function addBlobShadow(
  scene: Scene,
  parent: TransformNode,
  radius: number,
): void {
  const shadow = MeshBuilder.CreateDisc(
    `${parent.name}-blob-shadow`,
    { radius, tessellation: 20 },
    scene,
  );
  shadow.rotation.x = Math.PI / 2;
  shadow.position.y = 0.015;
  shadow.parent = parent;
  const shadowMaterial = createMaterial(
    scene,
    `${parent.name}-shadow-mat`,
    new Color3(0.08, 0.05, 0.09),
  );
  shadowMaterial.alpha = 0.16;
  shadow.material = shadowMaterial;
  shadow.isPickable = false;
}

export function animateRotation(
  scene: Scene,
  mesh: TransformNode,
  toY: number,
): void {
  Animation.CreateAndStartAnimation(
    `${mesh.name}-toggle`,
    mesh,
    "rotation.y",
    30,
    10,
    mesh.rotation.y,
    toY,
    Animation.ANIMATIONLOOPMODE_CONSTANT,
    undefined,
    () => scene.stopAnimation(mesh),
  );
}
